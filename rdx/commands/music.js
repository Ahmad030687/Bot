const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const yts = require("yt-search");

module.exports.config = {
    name: "music",
    version: "100.0.0",
    hasPermssion: 0,
    credits: "AHMAD RDX",
    description: "Premium Ultra-Fast Music/Video Downloader",
    commandCategory: "media",
    usages: "[song name] [audio/video]",
    cooldowns: 1
};

// --- 💎 PREMIUM UI SYSTEM ---
const rdx_header = "🦅 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐏𝐑𝐄𝐌𝐈𝐔𝐌 🦅";
const line = "━━━━━━━━━━━━━━━━━━";

const getProgressBar = (pct) => {
    const size = 10;
    const filled = Math.round(size * pct / 100);
    const empty = size - filled;
    return `[${'█'.repeat(filled)}${'▒'.repeat(empty)}] ${pct}%`;
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    // 🚀 FAST PARSING
    const isVideo = args.includes("video") || args.includes("mp4");
    const query = args.filter(a => !["video", "mp4", "audio", "mp3"].includes(a.toLowerCase())).join(" ");

    if (!query) return api.sendMessage(`${rdx_header}\n${line}\n⚠️ 𝐔𝐬𝐭𝐚𝐝 𝐣𝐢, 𝐠𝐚𝐧𝐞 𝐤𝐚 𝐧𝐚𝐚𝐦 𝐥𝐢𝐤𝐡𝐞𝐢𝐧!\n${line}`, threadID, messageID);

    const type = isVideo ? "video" : "audio";
    const ext = isVideo ? "mp4" : "mp3";
    
    // 1. INITIAL PREMIUM STATUS
    let statusMsg = await api.sendMessage(`${rdx_header}\n${line}\n🔍 𝐒𝐞𝐚𝐫𝐜𝐡𝐢𝐧𝐠... 🚀\n${getProgressBar(15)}\n${line}`, threadID);

    try {
        // 🚀 PARALLEL LOGIC (Searching + Server Preparation)
        const [searchResult] = await Promise.all([yts(query)]);
        const video = searchResult.videos[0];
        if (!video) throw new Error("Media not found!");

        // 2. EXTRACTION STATUS
        if (statusMsg) await api.editMessage(`${rdx_header}\n${line}\n⚡ 𝐄𝐱𝐭𝐫𝐚𝐜𝐭𝐢𝐧𝐠: ${video.title.substring(0, 20)}...\n${getProgressBar(45)}\n${line}`, statusMsg.messageID, threadID);

        const nixtube = "https://nixtube.aryannix.workers.dev/api/download"; 
        const dlRes = await axios.get(`${nixtube}?url=${encodeURIComponent(video.url)}&type=${type}`);
        const dlLink = dlRes.data.downloadUrl || dlRes.data.data?.downloadUrl;

        if (!dlLink) throw new Error("Bypass Failed.");

        // 3. DOWNLOAD STATUS
        if (statusMsg) await api.editMessage(`${rdx_header}\n${line}\n📥 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐢𝐧𝐠 𝐒𝐭𝐫𝐞𝐚𝐦...\n${getProgressBar(75)}\n${line}`, statusMsg.messageID, threadID);

        const cacheDir = path.join(__dirname, "cache");
        await fs.ensureDir(cacheDir);
        const filePath = path.join(cacheDir, `rdx_pro_${Date.now()}.${ext}`);

        // HIGH-SPEED STREAMING
        const response = await axios({
            method: 'GET',
            url: dlLink,
            responseType: 'stream',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const writer = fs.createWriteStream(filePath, { highWaterMark: 1024 * 1024 });
        response.data.pipe(writer);

        writer.on('finish', async () => {
            const stats = fs.statSync(filePath);
            const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

            // 4. UPLOAD STATUS
            if (statusMsg) await api.editMessage(`${rdx_header}\n${line}\n📤 𝐔𝐩𝐥𝐨𝐚𝐝𝐢𝐧𝐠 𝐭𝐨 𝐂𝐡𝐚𝐭...\n${getProgressBar(100)}\n${line}`, statusMsg.messageID, threadID);

            // FINAL PREMIUM BODY
            const body = `${rdx_header}\n${line}\n✅ 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐂𝐨𝐦𝐩𝐥𝐞𝐭𝐞!\n\n🎵 **Title:** ${video.title}\n📺 **Channel:** ${video.author.name}\n📦 **Size:** ${sizeMB} MB\n✨ **Status:** Success\n${line}\n🔥 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗`;

            api.sendMessage({
                body: body,
                attachment: [fs.createReadStream(filePath)]
            }, threadID, (err) => {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                if (statusMsg) api.unsendMessage(statusMsg.messageID);
            }, messageID);
        });

    } catch (error) {
        if (statusMsg) api.editMessage(`${rdx_header}\n${line}\n❌ 𝐄𝐫𝐫𝐨𝐫: ${error.message}\n${line}`, statusMsg.messageID, threadID);
    }
};
