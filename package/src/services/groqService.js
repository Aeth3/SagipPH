import { GROQ_API_KEY } from "@env";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

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
