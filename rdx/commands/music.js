const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const yts = require("yt-search");

module.exports.config = {
    name: "music",
    version: "115.0.0",
    hasPermssion: 0,
    credits: "AHMAD RDX",
    description: "Premium Pro Ultra-Fast Downloader",
    commandCategory: "media",
    usages: "[song name] [audio/video]",
    cooldowns: 1
};

// 💎 PREMIUM UI ELEMENTS
const rdx_header = "🦅 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐏𝐑𝐄𝐌𝐈𝐔𝐌 🦅";
const line = "━━━━━━━━━━━━━━━━━━";
const getBar = (pct) => {
    const filled = Math.round(10 * pct / 100);
    return `[${'█'.repeat(filled)}${'▒'.repeat(10 - filled)}] ${pct}%`;
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    // 🚀 FAST INPUT PARSING
    const isVideo = args.includes("video") || args.includes("mp4");
    const query = args.filter(a => !["video", "mp4", "audio", "mp3"].includes(a.toLowerCase())).join(" ");

    if (!query) return api.sendMessage(`${rdx_header}\n${line}\n⚠️ 𝐔𝐬𝐭𝐚𝐝 𝐣𝐢, 𝐠𝐚𝐧𝐞 𝐤𝐚 𝐧𝐚𝐚𝐦 𝐥𝐢𝐤𝐡𝐞𝐢𝐧!\n${line}`, threadID, messageID);

    const type = isVideo ? "video" : "audio";
    const ext = isVideo ? "mp4" : "mp3";

    // 1. SEARCHING ANIMATION
    let statusMsg = await api.sendMessage(`${rdx_header}\n${line}\n🔎 𝐒𝐞𝐚𝐫𝐜𝐡𝐢𝐧𝐠 YouTube...\n${getBar(20)}\n${line}`, threadID);

    try {
        // 🚀 PARALLEL EXECUTION
        const [searchResult] = await Promise.all([yts(query)]);
        const video = searchResult.videos[0];
        if (!video) throw new Error("Gana nahi mila!");

        // 2. EXTRACTION ANIMATION
        if (statusMsg) await api.editMessage(`${rdx_header}\n${line}\n⚡ 𝐅𝐞𝐭𝐜𝐡𝐢𝐧𝐠: ${video.title.substring(0, 20)}...\n${getBar(50)}\n${line}`, statusMsg.messageID, threadID);

        const nixtube = "https://nixtube.aryannix.workers.dev/api/download"; 
        const dlRes = await axios.get(`${nixtube}?url=${encodeURIComponent(video.url)}&type=${type}`);
        const dlLink = dlRes.data.downloadUrl || dlRes.data.data?.downloadUrl;

        if (!dlLink) throw new Error("Link bypass failed.");

        // 3. DOWNLOADING ANIMATION
        if (statusMsg) await api.editMessage(`${rdx_header}\n${line}\n📥 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐢𝐧𝐠 𝐒𝐭𝐫𝐞𝐚𝐦...\n${getBar(80)}\n${line}`, statusMsg.messageID, threadID);

        const cacheDir = path.join(__dirname, "cache");
        await fs.ensureDir(cacheDir);
        const filePath = path.join(cacheDir, `rdx_${Date.now()}.${ext}`);

        // --- 📥 TURBO DOWNLOAD LOGIC ---
        const response = await axios({
            method: 'GET',
            url: dlLink,
            responseType: 'arraybuffer', // Stable for FCA
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        // Write to file and wait
        fs.writeFileSync(filePath, Buffer.from(response.data));

        // 🛡️ ATTACHMENT GUARD: Verify file exists and has data
        if (!fs.existsSync(filePath) || fs.statSync(filePath).size < 100) {
            throw new Error("File corruption detected.");
        }

        const stats = fs.statSync(filePath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

        if (sizeMB > 48) {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            return api.editMessage(`❌ ${rdx_header}\n${line}\n𝐒𝐢𝐳𝐞: ${sizeMB}MB (Limit 48MB)\n${line}`, statusMsg.messageID, threadID);
        }

        // 4. UPLOADING ANIMATION
        if (statusMsg) await api.editMessage(`${rdx_header}\n${line}\n📤 𝐔𝐩𝐥𝐨𝐚𝐝𝐢𝐧𝐠 𝐭𝐨 𝐂𝐡𝐚𝐭...\n${getBar(100)}\n${line}`, statusMsg.messageID, threadID);

        // FINAL PROFESSIONAL MESSAGE
        const body = `${rdx_header}\n${line}\n✅ 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐂𝐨𝐦𝐩𝐥𝐞𝐭𝐞!\n\n🎵 **Title:** ${video.title}\n📺 **Channel:** ${video.author.name}\n📦 **Size:** ${sizeMB} MB\n✨ **Status:** Premium High-Speed\n${line}\n🔥 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗`;

        api.sendMessage({
            body: body,
            attachment: [fs.createReadStream(filePath)]
        }, threadID, (err) => {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            if (statusMsg) api.unsendMessage(statusMsg.messageID);
        }, messageID);

    } catch (error) {
        console.error("RDX PRO ERROR:", error);
        if (statusMsg) api.editMessage(`❌ ${rdx_header}\n${line}\n𝐄𝐫𝐫𝐨𝐫: ${error.message}\n${line}`, statusMsg.messageID, threadID);
    }
};
