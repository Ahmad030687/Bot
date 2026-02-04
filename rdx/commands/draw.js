const axios = require('axios');

module.exports.config = {
    name: "draw",
    version: "4.0.0",
    hasPermssion: 0,
    credits: "Ahmad RDX",
    description: "OpenAI + Pollinations Premium Image Generator",
    commandCategory: "AI Creative Studio",
    usages: "[kuch bhi likhein]",
    cooldowns: 15
};

// 🔑 AHMAD BHAI KI EXCLUSIVE KEYS
const OPENAI_KEY = "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";
const POLLINATIONS_KEY = "sk_JCkUDTlnx0rPAM5SJrjuk8teYnuEXxpT";

module.exports.run = async ({ api, event, args }) => {
    const userInput = args.join(" ");
    if (!userInput) return api.sendMessage("🎨 **Ahmad Creative Studio**\nBoss, kuch to likhein! Jo dil mein hai bol dein, AI hazir hai.", event.threadID);

    api.sendMessage("🧠 **Ahmad RDX Hybrid Engine:**\nChatGPT se mashwara ho raha hai... 🖌️⚡", event.threadID, event.messageID);

    try {
        // --- STEP 1: CHATGPT PROMPT ENHANCEMENT ---
        const systemPrompt = "You are a pro image prompt engineer. Convert the user input into a highly detailed, 8k, photorealistic English image prompt. Output only the prompt.";
        
        const gptRes = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userInput }
            ]
        }, {
            headers: { 'Authorization': `Bearer ${OPENAI_KEY}` }
        });

        const enhancedPrompt = gptRes.data.choices[0].message.content.trim();

        // --- STEP 2: POLLINATIONS IMAGE GENERATION ---
        // Hum yahan Pollinations ki API key aur detailed prompt use kar rahe hain
        const seed = Math.floor(Math.random() * 999999);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?model=flux&width=1024&height=1024&nologo=true&seed=${seed}`;

        const imageRes = await axios.get(imageUrl, {
            responseType: 'stream',
            headers: { 'Authorization': `Bearer ${POLLINATIONS_KEY}` }
        });

        // --- STEP 3: SENDING THE RESULT ---
        api.sendMessage({
            body: `🎨 **GENERATION SUCCESS**\n━━━━━━━━━━━━━━━━━━\n🗣️ **You Said:** "${userInput}"\n✨ **AI Logic:** "${enhancedPrompt.substring(0, 150)}..."\n━━━━━━━━━━━━━━━━━━\n*Powered by Ahmad RDX Premium System*`,
            attachment: imageRes.data
        }, event.threadID, event.messageID);

    } catch (error) {
        console.error(error);
        api.sendMessage("❌ **Ahmad Bhai, System Busy Hai!**\nShayad API limit khatam ho gayi ya network ka masla hai.", event.threadID);
    }
};
