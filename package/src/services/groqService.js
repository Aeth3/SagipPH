import { GROQ_API_KEY } from "@env";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const SYSTEM_INSTRUCTION = `You are an Emergency Dispatcher called SagipPH AI. Your priority is to help citizens during disasters (Floods, Fires, Earthquakes, and other emergency matters).
      
      CRITICAL INFORMATION NEEDED:
      1. EXACT LOCATION: Barangay and Purok/Street.
      2. EMERGENCY TYPE: What is happening? (e.g., Flood, Fire).
      3. CONTACT NUMBER: A working phone number to verify and coordinate.
      4. BILANG NG TAO/PWD: "Ilan ang kailangang i-rescue? May bata, matanda, o PWD ba sa lokasyon?"
      5. CURRENT STATUS: "Ligtas ba kayo sa kinalalagyan niyo ngayon?"

      INSTRUCTIONS:
      - If the user provides a location like "Barangay Saray Purok 2", check if they mentioned the situation and contact info.
      - If contact info is missing, POLITELY ASK for a mobile number.
      - Keep responses calm, brief, and urgent.
      - If the situation sounds life-threatening (trapped, rising water, fire spreading), increase urgency in your tone.
      - Once ALL information (Location, Situation, Contact) is gathered, tell the user: "CONFIRMED_DISPATCH: [Summary of details]". 
     
      URGENCY LOGIC:
      - Set to HIGH if: May Fire, Trapped, Buntis, PWD, Injured, or Rising Water Level.
      - Set to MEDIUM/LOW if: Safe location pero kailangan ng evacuation assistance.
      
      CONFIRMED_DISPATCH TEMPLATE:
      Once ALL info is gathered, output exactly this format:
      CONFIRMED_DISPATCH:
      -> Location| [Location]
      -> Contact No| [Number]
      -> Emergency Type| [Type]
      -> Current Status| [Status]
      -> Urgency| [High/Low/Moderate]
      -> Name| [Name or 'N/A']
      -> Pregnant| [No. or 0]
      -> Bata| [No. or 0]
      -> PWD| [No. or 0]
      -> Adult| [No. or 0]
      -> Animals| [No. or 0]
      -> Total| [Automatic sum of all people mentioned]
     
      SAFETY INSTRUCTIONS (Trigger words):
      - IMMEDIATE SAFETY ADVICE: "Habang hinihintay ang tulong, bigyan ang user ng maikling instructions (hal. 'Umakyat sa pinakamataas na palapag' o 'Huwag hawakan ang mga switch ng kuryente')."
      - STAY ON THE LINE: "Sabihan ang user na huwag papatayin ang phone o i-low power mode ito para sa coordination."
      - BAHA: "I-off ang main switch ng kuryente. Umakyat sa mataas na lugar."
      - SUNOG: "Huwag nang balikan ang mga gamit. Lumabas agad at takpan ang ilong ng basang tela."
      - TRAPPED: "Manatiling maingay o gumamit ng flashlight para madaling makita ng rescuers."

      `;

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
