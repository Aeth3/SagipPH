import { GROQ_API_KEY, SYSTEM_INSTRUCTION } from "@env";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";



/** Conversation history kept in memory for multi-turn chat. */
let conversationHistory = [];

/**
 * Returns true if a Groq API key is configured.
 */
export function isGroqAvailable() {
    return !!GROQ_API_KEY;
}

/**
 * Send a message to Groq (Llama 3.3 70B) and return the response text.
 *
 * @param {string} userMessage
 * @returns {Promise<string>}
 */
export async function sendMessageViaGroq(userMessage) {
    if (!GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is not set. Add it to your .env file.");
    }

    conversationHistory.push({ role: "user", content: userMessage });

    const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
                { role: "system", content: SYSTEM_INSTRUCTION },
                ...conversationHistory,
            ],
            temperature: 0.7,
            top_p: 0.95,
            max_tokens: 1024,
        }),
    });

    if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(
            `Groq API error (${response.status}): ${body}`
        );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content ?? "";

    conversationHistory.push({ role: "assistant", content: reply });

    return reply;
}

/**
 * Reset the Groq conversation history.
 */
export function resetGroqChat() {
    conversationHistory = [];
}

/**
 * Generate a short chat title using Groq without mutating conversation history.
 *
 * @param {string} contextText
 * @returns {Promise<string>}
 */
export async function generateTitleViaGroq(contextText) {
    if (!GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is not set. Add it to your .env file.");
    }

    const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
                {
                    role: "system",
                    content:
                        "You generate concise chat titles. Return only the title text.",
                },
                {
                    role: "user",
                    content:
                        "Create one concise chat title from this conversation context.\n" +
                        "Rules: max 6 words, no quotes, no trailing punctuation.\n\n" +
                        contextText,
                },
            ],
            temperature: 0.2,
            top_p: 0.9,
            max_tokens: 20,
        }),
    });

    if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(`Groq API error (${response.status}): ${body}`);
    }

    const data = await response.json();
    const title = data.choices?.[0]?.message?.content?.trim()?.replace(/[."]+$/g, "");
    return title || "SagipPH Chat";
}

function safeParseJSONFromText(text) {
    if (typeof text !== "string") return null;

    const trimmed = text.trim();
    if (!trimmed) return null;

    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const candidate = fenced?.[1] || trimmed;

    try {
        return JSON.parse(candidate);
    } catch (_) {
        const start = candidate.indexOf("{");
        const end = candidate.lastIndexOf("}");
        if (start < 0 || end <= start) return null;
        try {
            return JSON.parse(candidate.slice(start, end + 1));
        } catch {
            return null;
        }
    }
}

export async function extractDispatchStateViaGroq(messages = []) {
    if (!GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is not set. Add it to your .env file.");
    }

    const normalized = messages
        .filter((m) => typeof m?.text === "string" && m.text.trim())
        .slice(-20)
        .map((m) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.text.trim(),
        }));

    const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
                {
                    role: "system",
                    content:
                        "You extract dispatch info from conversation. Return JSON only with keys: " +
                        "ready(boolean), missing(array of strings), content(object). " +
                        "Never infer or invent missing values. If missing, use null (or 0 for numbers). " +
                        "ready=true only if sender, location, street, and situation are explicitly present. " +
                        "If any required value is missing, set ready=false and list keys in missing. " +
                        "content keys: sender, location, street, situation, name, emergencyType, riskLevel, geoTag, otherContactNo, pregnant, senior, twoYearsOldBelow, kids, pwd, adult, animals, total.",
                },
                ...normalized,
            ],
            temperature: 0,
            top_p: 1,
            max_tokens: 512,
            response_format: { type: "json_object" },
        }),
    });

    if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(`Groq API error (${response.status}): ${body}`);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content ?? "";
    const parsed = safeParseJSONFromText(raw);

    if (!parsed || typeof parsed !== "object") {
        return { ready: false, missing: ["location", "situation", "sender"], content: null };
    }

    return {
        ready: parsed.ready === true,
        missing: Array.isArray(parsed.missing) ? parsed.missing : [],
        content: parsed.content && typeof parsed.content === "object" ? parsed.content : null,
    };
}
