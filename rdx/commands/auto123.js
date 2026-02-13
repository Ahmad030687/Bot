const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "auto",
    version: "310.0.0",
    hasPermssion: 0,
    credits: "AHMAD RDX",
    description: "Multi-Platform Turbo Downloader (TikTok Fix)",
    commandCategory: "media",
    usages: "[link]",
    cooldowns: 2
};

// 💎 PREMIUM UI ELEMENTS
const rdx_header = "🦅 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐔𝐍𝐈𝐕𝐄𝐑𝐒𝐀𝐋 🦅";
const line = "━━━━━━━━━━━━━━━━━━";
const getBar = (pct) => {
    const filled = Math.round(10 * pct / 100);
    return `[${'█'.repeat(filled)}${'▒'.repeat(10 - filled)}] ${pct}%`;
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, body } = event;
    const url = args[0] || (body && body.startsWith("https://") ? body : null);

    if (!url) return;

    let statusMsg = await api.sendMessage(`${rdx_header}\n${line}\n🚀 𝐑𝐃𝐗 𝐏𝐫𝐢𝐯𝐚𝐭𝐞 𝐄𝐧𝐠𝐢𝐧𝐞... \n${getBar(20)}\n${line}`, threadID);

    try {
        // 🦅 YOUR PYTHON API
        const apiUrl = `https://ahmad-rdx-api-cos1.onrender.com/downloader/aiodl?apikey=AhmadRDX&url=${encodeURIComponent(url)}`;
        
        const res = await axios.get(apiUrl, { timeout: 60000 });

        if (!res.data.status) throw new Error(res.data.msg || "Video not found.");

        const result = res.data.result;
        
        // 🚀 IMPROVED URL EXTRACTION
        let videoUrl = result.links?.video?.[0]?.url || result.url;
        const title = result.title || "RDX Media";
        const platform = result.extractor || "Universal";

        if (!videoUrl) throw new Error("Could not extract download link.");

        await api.editMessage(`${rdx_header}\n${line}\n📥 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐢𝐧𝐠: ${platform.toUpperCase()}\n${getBar(60)}\n${line}`, statusMsg.messageID, threadID);

        // 📥 TURBO BUFFER DOWNLOAD WITH MOBILE HEADERS (TikTok Fix)
        const response = await axios({
            method: 'GET',
            url: videoUrl,
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36',
                'Referer': 'https://www.tiktok.com/',
                'Accept': 'video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5'
            }
        });

        const cacheDir = path.join(__dirname, "cache");
        await fs.ensureDir(cacheDir);
        const filePath = path.join(cacheDir, `rdx_final_${Date.now()}.mp4`);
        fs.writeFileSync(filePath, Buffer.from(response.data));

        const stats = fs.statSync(filePath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

        if (sizeMB > 48) {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            return api.editMessage(`❌ ${rdx_header}\n${line}\n⚠️ 𝐒𝐢𝐳𝐞: ${sizeMB}MB (Limit 48MB)\n${line}`, statusMsg.messageID, threadID);
        }

        await api.editMessage(`${rdx_header}\n${line}\n📤 𝐔𝐩𝐥𝐨𝐚𝐝𝐢𝐧𝐠 𝐭𝐨 𝐂𝐡𝐚𝐭...\n${getBar(100)}\n${line}`, statusMsg.messageID, threadID);

        // ✅ FINAL DELIVERY
        api.sendMessage({
            body: `${rdx_header}\n${line}\n✅ 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐂𝐨𝐦𝐩𝐥𝐞𝐭𝐞!\n\n📌 𝐏𝐥𝐚𝐭𝐟𝐨𝐫𝐦: ${platform.toUpperCase()}\n📝 𝐓𝐢𝐭𝐥𝐞: ${title.substring(0, 30)}...\n📦 𝐒𝐢𝐳𝐞: ${sizeMB} MB\n${line}\n🔥 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗`,
            attachment: [fs.createReadStream(filePath)]
        }, threadID, (err) => {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            if (statusMsg) api.unsendMessage(statusMsg.messageID);
        }, messageID);

    } catch (error) {
        if (statusMsg) api.editMessage(`❌ ${rdx_header}\n${line}\n𝐄𝐫𝐫𝐨𝐫: ${error.message}\n${line}`, statusMsg.messageID, threadID);
    }
};
