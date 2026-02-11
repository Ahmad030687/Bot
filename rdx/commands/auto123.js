const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "auto",
    version: "60.0.0", // Your API Edition
    hasPermssion: 0,
    credits: "Ahmad Ali Safdar",
    description: "Universal Downloader using Ahmad API",
    commandCategory: "downloader",
    usages: "[link]",
    cooldowns: 5
};

// --- RDX PREMIUM ANIMATION ---
const progressBar = (percentage) => {
    const filled = Math.round(percentage / 10);
    const empty = 10 - filled;
    return `[${'█'.repeat(filled)}${'▒'.repeat(empty)}] ${percentage}%`;
};

const frames = [
    "⠋ Connecting to Ahmad RDX Server...",
    "⠙ Analyzing Link...",
    "⠹ Extracting Media Info...",
    "⠸ Bypass Successful...",
    "✅ Finalizing Download..."
];

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const link = args.join(" ");

    if (!link) return api.sendMessage("❌ **RDX AUTO:** Link to dein Ahmad bhai!", threadID, messageID);

    // 1. Initial Loading
    let loadingMsg = await api.sendMessage(`🔄 **RDX SYSTEM**\n\n${progressBar(0)}\nStatus: Request Sent...`, threadID);

    try {
        // --- ANIMATION STEP 1 ---
        await new Promise(r => setTimeout(r, 800));
        await api.editMessage(`🔄 **RDX SYSTEM**\n\n${progressBar(25)}\nStatus: ${frames[0]}`, loadingMsg.messageID);

        // 2. YOUR PERSONAL API CALL
        // Note: Render free servers sleep, so timeout increased
        const RDX_API = `https://ahmad-rdx-api-cos1.onrender.com/ahmad-dl?url=${encodeURIComponent(link)}`;
        
        const res = await axios.get(RDX_API);
        const data = res.data;

        if (!data.url) {
            return api.editMessage("❌ **FAILED:** Link Expire hai ya API Down hai.", loadingMsg.messageID);
        }

        // --- ANIMATION STEP 2 ---
        await api.editMessage(`⬇️ **RDX SYSTEM**\n\n${progressBar(60)}\nStatus: ${frames[2]}`, loadingMsg.messageID);

        // 3. Platform Check (For Decoration)
        let platform = "Media";
        if (link.includes("facebook")) platform = "Facebook";
        else if (link.includes("instagram")) platform = "Instagram";
        else if (link.includes("tiktok")) platform = "TikTok";

        // 4. File Downloading (THE INSTA FIX IS HERE)
        const cacheDir = path.join(__dirname, "cache");
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
        const filePath = path.join(cacheDir, `rdx_${Date.now()}.mp4`);

        // 🔥 IMPORTANT: Headers added to fix Instagram 403 Forbidden Error
        const videoResponse = await axios({
            method: 'GET',
            url: data.url,
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const writer = fs.createWriteStream(filePath);
        videoResponse.data.pipe(writer);

        writer.on('finish', async () => {
            // Check Size
            const stats = fs.statSync(filePath);
            if (stats.size < 2000) {
                fs.unlinkSync(filePath);
                return api.editMessage("❌ **ERROR:** Empty File (Instagram Blocked Request).", loadingMsg.messageID);
            }

            // --- FINAL ANIMATION ---
            await api.editMessage(`✅ **RDX SYSTEM**\n\n${progressBar(100)}\nStatus: Uploading...`, loadingMsg.messageID);
            await new Promise(r => setTimeout(r, 800));
            api.unsendMessage(loadingMsg.messageID);

            // 5. Send Video
            api.sendMessage({
                body: `🦅 **AHMAD RDX API**\n\n📌 **Platform:** ${platform}\n📝 **Title:** ${data.title || "Unknown"}\n✨ **Quality:** HD`,
                attachment: fs.createReadStream(filePath)
            }, threadID, () => fs.unlinkSync(filePath), messageID);
        });

        writer.on('error', (err) => {
            api.editMessage(`❌ **Download Error:** ${err.message}`, loadingMsg.messageID);
        });

    } catch (error) {
        console.error(error);
        api.editMessage(`❌ **API Error:** Apka Render server shayed sleep mode mein hai ya link private hai.`, loadingMsg.messageID);
    }
};
