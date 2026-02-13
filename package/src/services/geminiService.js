import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "@env";
import { isGroqAvailable, sendMessageViaGroq, resetGroqChat } from "./groqService";

const SYSTEM_INSTRUCTION = `You are SagipPH AI, a helpful disaster-preparedness and emergency-response assistant for Filipino communities.

Your responsibilities:
- Help users report emergencies and understand proper protocols
- Provide directions to the nearest evacuation centers and shelters
- Share disaster preparedness tips (typhoons, earthquakes, floods, volcanic eruptions)
- Relay weather updates and safety advisories
- Answer general questions about disaster response in the Philippines

Guidelines:
- Be concise and actionable — lives may depend on clear instructions.
- When a user reports an emergency, acknowledge urgency and provide immediate steps.
- Use simple language; mix in Filipino/Tagalog when it helps clarity.
- If you don't know something, say so — never fabricate safety-critical information.
- Keep responses under 300 words unless the user asks for more detail.`;

const PRIMARY_MODEL = "gemini-2.0-flash";
const FALLBACK_MODEL = "gemini-2.0-flash-lite";
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

const GENERATION_CONFIG = {
    temperature: 0.7,
    topP: 0.95,
    maxOutputTokens: 1024,
};

let chatSession = null;
let activeModel = PRIMARY_MODEL;
let usingGroqFallback = false;

function createSession(modelName) {
    if (!GEMINI_API_KEY) {
        throw new Error(
            "GEMINI_API_KEY is not set. Add it to your .env file."
        );
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_INSTRUCTION,
    });

    return model.startChat({ generationConfig: GENERATION_CONFIG });
}

function getOrCreateSession() {
    if (chatSession) return chatSession;
    chatSession = createSession(activeModel);
    return chatSession;
}

/**
 * Returns true when the error looks like a 429 rate-limit / quota error.
 */
function isRateLimitError(error) {
    const msg = error?.message ?? "";
    return (
        msg.includes("429") ||
        msg.includes("quota") ||
        msg.includes("RESOURCE_EXHAUSTED")
    );
}

/**
 * Sleep helper.
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Execute `fn` with exponential back-off on 429 errors.
 * After exhausting retries on the primary model it switches to the fallback,
 * and ultimately falls through to Groq if all Gemini models are exhausted.
 */
async function withRetry(fn, userMessage) {
    let lastError;

    // Try with current active model (primary or already-switched fallback)
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            if (!isRateLimitError(error)) throw error;

            const delay = BASE_DELAY_MS * Math.pow(2, attempt);
            console.warn(
                `[geminiService] Rate limited on ${activeModel} (attempt ${attempt + 1}/${MAX_RETRIES}). ` +
                `Retrying in ${delay / 1000}s…`
            );
            await sleep(delay);
        }
    }

    // All retries on current model exhausted — try fallback Gemini model
    if (activeModel !== FALLBACK_MODEL) {
        console.warn(
            `[geminiService] Switching from ${activeModel} → ${FALLBACK_MODEL}`
        );
        activeModel = FALLBACK_MODEL;
        chatSession = null;

        // Give the fallback model a couple of attempts too
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                if (!isRateLimitError(error)) throw error;
                if (attempt < 1) await sleep(BASE_DELAY_MS);
            }
        }
    }

    // All Gemini models exhausted — fall back to Groq if available
    if (isGroqAvailable()) {
        console.warn("[geminiService] All Gemini quotas exhausted. Falling back to Groq (Llama 3.3 70B).");
        usingGroqFallback = true;
        return sendMessageViaGroq(userMessage);
    }

    throw lastError;
}

/**
 * Send a message to Gemini and get a streamed response.
 * Returns an async generator that yields text chunks.
 *
 * @param {string} userMessage
 * @returns {AsyncGenerator<string>}
 */
export async function* streamMessage(userMessage) {
    const session = getOrCreateSession();
    const result = await session.sendMessageStream(userMessage);

    for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) yield text;
    }
}

/**
 * Send a message to Gemini and get the full response at once.
 * Automatically retries on rate-limit errors with exponential back-off
 * and falls back to a lighter model if the primary quota is exhausted.
 *
 * @param {string} userMessage
 * @returns {Promise<string>}
 */
export async function sendMessage(userMessage) {
    // If we already switched to Groq in a previous call, keep using it
    if (usingGroqFallback && isGroqAvailable()) {
        return sendMessageViaGroq(userMessage);
    }

    return withRetry(async () => {
        const session = getOrCreateSession();
        const res = await session.sendMessage(userMessage);
        return res.response.text();
    }, userMessage);
}

/**
 * Generate a short chat title from the user's first message and the AI reply.
 * Uses a one-shot (stateless) Gemini call so it doesn't pollute the
 * conversation history.
 *
 * @param {string} userMessage  – the user's first message
 * @param {string} aiReply      – the assistant's response
 * @returns {Promise<string>}   – a concise title (≤ 6 words)
 */
export async function generateChatTitle(userMessage, aiReply) {
    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: FALLBACK_MODEL });

        const prompt =
            `Summarize this conversation into a short chat title (max 6 words, no quotes, no punctuation at the end).\n\n` +
            `User: ${userMessage}\nAssistant: ${aiReply}`;

        const res = await model.generateContent(prompt);
        const title = res.response.text().trim().replace(/[."]+$/g, "");
        return title || "SagipPH Chat";
    } catch (error) {
        console.warn("[geminiService] generateChatTitle error:", error);
        return "SagipPH Chat";
    }
}

/**
 * Reset the chat session (e.g. when user wants a fresh conversation).
 * Also resets to the primary model for the next conversation.
 */
export function resetChat() {
    chatSession = null;
    activeModel = PRIMARY_MODEL;
    usingGroqFallback = false;
    resetGroqChat();
}
