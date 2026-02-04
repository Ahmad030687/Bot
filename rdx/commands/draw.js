const axios = require('axios');

module.exports.config = {
    name: "imagine",
    version: "6.0.0",
    hasPermssion: 0,
    credits: "Ahmad RDX",
    description: "Gemini + Pollinations (With Auto-Error Fixer)",
    commandCategory: "AI Creative Studio",
    usages: "[kuch bhi likhein]",
    cooldowns: 5
};

// 🔑 AHMAD BHAI KI KEYS
const GEMINI_KEY = "AIzaSyBogHNOLXqUiX8r1YQ-bXzLMk4UsB7W2lk";
const POLLINATIONS_KEY = "sk_JCkUDTlnx0rPAM5SJrjuk8teYnuEXxpT";

module.exports.run = async ({ api, event, args }) => {
    const userInput = args.join(" ");
    if (!userInput) return api.sendMessage("🎨 **Ahmad Creative Studio**\nBoss, kuch to likhein! Kuch bhi likhein, main bana dunga.", event.threadID);

    api.sendMessage("🧠 **AI Engine:** Processing your thoughts... ⚡", event.threadID, event.messageID);

    let finalPrompt = userInput; // Default agar AI fail ho jaye

    try {
        // --- STEP 1: GEMINI ENHANCEMENT (Try/Catch ke sath) ---
        try {
            const systemInstruction = `Act as a professional AI image prompt engineer. Convert this user input into a highly detailed, 8k, photorealistic English image prompt. Output ONLY the prompt text. Input: "${userInput}"`;
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;
            
            const geminiRes = await axios.post(geminiUrl, {
                contents: [{ parts: [{ text: systemInstruction }] }]
            }, { timeout: 5000 }); // 5 second timeout

            if (geminiRes.data && geminiRes.data.candidates) {
                finalPrompt = geminiRes.data.candidates[0].content.parts[0].text.trim();
                console.log("Gemini Success: " + finalPrompt);
            }
        } catch (geminiError) {
            console.log("Gemini Failed (404/Limit), using raw input instead.");
            // Agar Gemini fail hua, toh hum kuch extra quality keywords khud add kar denge
            finalPrompt = `${userInput}, highly detailed, cinematic lighting, 8k, realistic, masterpiece`;
        }

        // --- STEP 2: POLLINATIONS GENERATION ---
        const seed = Math.floor(Math.random() * 1000000);
        // Hum 'flux' model use kar rahe hain jo sabse behtareen hai
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?model=flux&width=1024&height=1024&nologo=true&seed=${seed}`;

        const imageRes = await axios.get(imageUrl, {
            responseType: 'stream',
            headers: { 'Authorization': `Bearer ${POLLINATIONS_KEY}` }
        });

        // --- STEP 3: FINAL RESULT ---
        api.sendMessage({
            body: `🎨 **AHMAD RDX CREATIVE STUDIO**\n━━━━━━━━━━━━━━━━━━\n🗣️ **Input:** "${userInput.substring(0, 50)}..."\n✨ **Status:** Image Generated Successfully\n━━━━━━━━━━━━━━━━━━\n*Aura: Unstoppable 🦅*`,
            attachment: imageRes.data
        }, event.threadID, event.messageID);

    } catch (error) {
        console.error(error);
        api.sendMessage("❌ **Critical Error:** System overload. Please try again in a moment.", event.threadID);
    }
};
