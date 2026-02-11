const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "frame",
    version: "6.0.0", // Crash Proof Edition
    hasPermssion: 0,
    credits: "Ahmad RDX",
    description: "100+ Premium Random Frames (No Crash)",
    commandCategory: "image",
    usages: "(Bas #frame likhein reply kar ke)",
    cooldowns: 5,
    aliases: ["pic", "avatar", "dp", "edit", "look"]
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID, type, messageReply } = event;

    // 1. Target Selection
    let targetID = senderID;
    if (type === "message_reply") {
        targetID = messageReply.senderID;
    } else if (Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
    }

    // 2. HD Avatar
    const avatar = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

    // 3. API Bases
    const pop = "https://api.popcat.xyz";
    const dank = "https://some-random-api.com/canvas"; 

    // --- EFFECT LIST (Safe List) ---
    const effects = [
        { name: "🧊 FROSTED GLASS", url: `${dank}/glass?avatar=${avatar}` },
        { name: "👾 RETRO PIXEL", url: `${dank}/misc/pixelate?avatar=${avatar}` },
        { name: "🌑 NOIR B&W", url: `${pop}/greyscale?image=${avatar}` },
        { name: "🎨 NEGATIVE ART", url: `${pop}/invert?image=${avatar}` },
        { name: "🌫️ DREAMY BLUR", url: `${pop}/blur?image=${avatar}` },
        { name: "📜 VINTAGE SEPIA", url: `${pop}/sepia?image=${avatar}` },
        { name: "🔥 BURN EFFECT", url: `${dank}/triggered?avatar=${avatar}` },
        { name: "🌈 RAINBOW VIBE", url: `${dank}/gay?avatar=${avatar}` },
        { name: "💎 BRIGHTNESS", url: `${dank}/brightness?avatar=${avatar}` },
        { name: "🟢 NIGHT VISION", url: `${pop}/colorify?image=${avatar}&color=00ff00` },
        { name: "🔴 ROYAL RED", url: `${pop}/colorify?image=${avatar}&color=ff0000` },
        { name: "🔵 DEEP OCEAN", url: `${pop}/colorify?image=${avatar}&color=0000ff` },
        { name: "🟡 GOLDEN HOUR", url: `${pop}/colorify?image=${avatar}&color=ffd700` },
        { name: "🟣 ROYAL PURPLE", url: `${pop}/colorify?image=${avatar}&color=800080` },
        { name: "🦄 UNICORN", url: `${pop}/colorify?image=${avatar}&color=ff00ff` },
        { name: "🤖 CYBERPUNK", url: `${pop}/colorify?image=${avatar}&color=0ff0fc` }
    ];

    // 4. Folder Safety Check
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    // 5. Random Picker
    const randomPick = effects[Math.floor(Math.random() * effects.length)];
    const filePath = path.join(cacheDir, `rdx_frame_${targetID}_${Date.now()}.png`);

    let loadingMsg = await api.sendMessage(`🎨 **Applying Effect:** ${randomPick.name}...`, threadID, messageID);

    try {
        // 6. Download Image (With Buffer)
        const response = await axios({
            url: randomPick.url,
            method: 'GET',
            responseType: 'arraybuffer'
        });

        // 🚨 CRITICAL CHECK: Agar API ne Image ki jagah JSON Error diya to crash na ho
        if (response.headers['content-type'] && response.headers['content-type'].includes('application/json')) {
            throw new Error("API sent JSON instead of Image");
        }

        // Save File
        fs.writeFileSync(filePath, Buffer.from(response.data));

        // 🚨 SIZE CHECK: Agar file 0kb ki hai to send mat karo
        const stats = fs.statSync(filePath);
        if (stats.size < 100) {
            throw new Error("Empty file downloaded");
        }

        // 7. Send Image
        await api.sendMessage({
            body: `🦅 **RDX STUDIO**\n✨ **Style:** ${randomPick.name}`,
            attachment: fs.createReadStream(filePath)
        }, threadID, () => {
            // Delete file ONLY after sending
            fs.unlinkSync(filePath);
            api.unsendMessage(loadingMsg.messageID);
        }, messageID);

    } catch (e) {
        console.error("Frame Error:", e.message);
        api.unsendMessage(loadingMsg.messageID);
        api.sendMessage("❌ Server Busy! Please dubara try karein.", threadID, messageID);
        // Error hone par bhi file delete karein taake kachra na jama ho
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
};
            
