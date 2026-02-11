const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "auto",
    version: "40.0.0", // Ultra Pro Version
    hasPermssion: 0,
    credits: "Ahmad Ali Safdar",
    description: "Premium Universal Downloader with Advanced Animation",
    commandCategory: "downloader",
    usages: "[link]",
    cooldowns: 5
};

// --- ANIMATION ENGINE ---
const frames = [
    "⠋ Connecting to RDX Server...",
    "⠙ Verifying URL integrity...",
    "⠹ Bypassing Security...",
    "⠸ Extracting Media Data...",
    "⠼ Downloading Content...",
    "⠴ Optimizing Video Quality...",
    "⠦ Finalizing..."
];

const progressBar = (percentage) => {
    const filled = Math.round(percentage / 10);
    const empty = 10 - filled;
    return `[${'█'.repeat(filled)}${'▒'.repeat(empty)}] ${percentage}%`;
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const link = args.join(" ");

    if (!link) return api.sendMessage("❌ **RDX SYSTEM:** Link to dein Ahmad bhai!", threadID, messageID);

    // 1. Initial Loading Message
    let loadingMsg = await api.sendMessage(`🔄 **RDX SERVER INITIALIZING...**\n\n${progressBar(0)}\nStatus: Request Received`, threadID);

    try {
        // --- ANIMATION PHASE 1: Fetching Data ---
        // Fake loading effect to show "Premium" feel
        for (let i = 0; i < 4; i++) {
            await new Promise(resolve => setTimeout(resolve, 800));
            await api.editMessage(
                `🚀 **RDX PREMIUM DOWNLOADER**\n\n${progressBar((i + 1) * 20)}\nStatus: ${frames[i]}`,
                loadingMsg.messageID
            );
        }

        // 2. Real API Call (Using New Endpoint)
        const RDX_API = `https://ahmad-rdx-api-cos1.onrender.com/ahmad-dl?url=${encodeURIComponent(link)}`;
        
        const res = await axios.get(RDX_API);
        const data = res.data;

        if (!data.url) {
            return api.editMessage("❌ **FAILED:** Link Expired or Private Video.", loadingMsg.messageID);
        }

        // --- ANIMATION PHASE 2: Downloading File ---
        await api.editMessage(
            `🚀 **RDX PREMIUM DOWNLOADER**\n\n${progressBar(90)}\nStatus: ${frames[5]}`,
            loadingMsg.messageID
        );

        // 3. File Handling
        const cacheDir = path.join(__dirname, "cache");
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
        const filePath = path.join(cacheDir, `rdx_${Date.now()}.mp4`);

        const videoResponse = await axios({
            method: 'GET',
            url: data.url,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(filePath);
        videoResponse.data.pipe(writer);

        writer.on('finish', async () => {
            // Check File Size
            const stats = fs.statSync(filePath);
            if (stats.size < 2000) {
                fs.unlinkSync(filePath);
                return api.editMessage("❌ Error: Corrupted File Received.", loadingMsg.messageID);
            }
            
            const sizeMB = stats.size / (1024 * 1024);
            if (sizeMB > 50) { // Increased limit slightly for HD
                fs.unlinkSync(filePath);
                return api.editMessage(`⚠️ **LIMIT EXCEEDED:** Video (${sizeMB.toFixed(2)}MB) is too large for Messenger.`, loadingMsg.messageID);
            }

            // --- FINAL PHASE: Sending ---
            await api.editMessage(
                `🚀 **RDX PREMIUM DOWNLOADER**\n\n${progressBar(100)}\nStatus: ✅ Uploading to Chat...`,
                loadingMsg.messageID
            );

            // Thora sa delay taake user 100% dekh sake
            await new Promise(resolve => setTimeout(resolve, 1000));
            api.unsendMessage(loadingMsg.messageID);

            api.sendMessage({
                body: `🦅 **AHMAD RDX PREMIUM**\n\n📌 **Title:** ${data.title || "Unknown"}\n📊 **Size:** ${sizeMB.toFixed(2)} MB\n✨ **Quality:** High Definition`,
                attachment: fs.createReadStream(filePath)
            }, threadID, () => fs.unlinkSync(filePath), messageID);
        });

        writer.on('error', (err) => {
            api.editMessage(`❌ **FILE ERROR:** ${err.message}`, loadingMsg.messageID);
        });

    } catch (error) {
        api.editMessage(`❌ **SERVER ERROR:** System Busy or API Down.`, loadingMsg.messageID);
    }
};
