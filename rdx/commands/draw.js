const axios = require('axios');

module.exports.config = {
    name: "draw",
    version: "5.0.0 (Gemini Edition)",
    hasPermssion: 0,
    credits: "Ahmad RDX",
    description: "Gemini + Pollinations Ultra Image Generator",
    commandCategory: "AI Creative Studio",
    usages: "[kuch bhi likhein]",
    cooldowns: 10
};

// 🔑 AHMAD BHAI KI FRESH KEYS
const GEMINI_KEY = "AIzaSyBogHNOLXqUiX8r1YQ-bXzLMk4UsB7W2lk";
const POLLINATIONS_KEY = "sk_JCkUDTlnx0rPAM5SJrjuk8teYnuEXxpT";

module.exports.run = async ({ api, event, args }) => {
    const userInput = args.join(" ");
    if (!userInput) return api.sendMessage("🎨 **Ahmad Creative Studio**\nBoss, kuch to likhein! Jo dil mein hai bol dein, Gemini hazir hai.", event.threadID);

    api.sendMessage("🧠 **Ahmad RDX Gemini-X Engine:**\nPrompt enhance ho raha hai... 🖌️⚡", event.threadID, event.messageID);

    try {
        // --- STEP 1: GEMINI PROMPT ENHANCEMENT ---
        // Hum Gemini ko instruction de rahe hain ke wo aik shandaar English prompt banaye
        const systemInstruction = `Act as a professional AI image prompt engineer. Convert this user input into a highly detailed, 8k, photorealistic English image prompt. Output only the prompt text and nothing else. Input: "${userInput}"`;
        
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;
        
        const geminiRes = await axios.post(geminiUrl, {
            contents: [{ parts: [{ text: systemInstruction }] }]
        });

        const enhancedPrompt = geminiRes.data.candidates[0].content.parts[0].text.trim();

        // --- STEP 2: POLLINATIONS IMAGE GENERATION ---
        // Flux model use kar rahe hain jo sabse top par hai
        const seed = Math.floor(Math.random() * 999999);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?model=flux&width=1024&height=1024&nologo=true&seed=${seed}`;

        const imageRes = await axios.get(imageUrl, {
            responseType: 'stream',
            headers: { 'Authorization': `Bearer ${POLLINATIONS_KEY}` }
        });

        // --- STEP 3: RESULT SENDING ---
        api.sendMessage({
            body: `🎨 **AHMAD RDX CREATIVE STUDIO**\n━━━━━━━━━━━━━━━━━━\n🗣️ **Prompt:** "${userInput}"\n✨ **AI Power:** Gemini-1.5-Flash\n━━━━━━━━━━━━━━━━━━\n*Aura Level: Maxed Out 🦅*`,
            attachment: imageRes.data
        }, event.threadID, event.messageID);

    } catch (error) {
        console.error(error);
        api.sendMessage("❌ **Error:** Gemini key limit ya server issue. Dubara try karein!", event.threadID);
    }
};
