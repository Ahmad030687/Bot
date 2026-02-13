const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "auto",
    version: "300.0.0",
    hasPermssion: 0,
    credits: "AHMAD RDX",
    description: "Multi-Platform Turbo Downloader using RDX Private API",
    commandCategory: "media",
    usages: "[link]",
    cooldowns: 2
};

// 🛡️ RDX CREDIT PROTECTION
module.exports.onLoad = function () {
    const fs = require("fs");
    const path = __filename;
    const fileData = fs.readFileSync(path, "utf8");
    if (!fileData.includes('credits: "AHMAD RDX"')) {
        console.log("\n❌ [RDX ERROR]: Credits changed! System Protection Active. ❌\n");
        process.exit(1);
    }
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

    if (!url) return; // Silent if no link

    let statusMsg = await api.sendMessage(`${rdx_header}\n${line}\n🚀 𝐑𝐃𝐗 𝐏𝐫𝐢𝐯𝐚𝐭𝐞 𝐄𝐧𝐠𝐢𝐧𝐞... \n${getBar(20)}\n${line}`, threadID);

    try {
        // 🦅 CALLING YOUR OWN PYTHON API
        // Apka API Key: AhmadRDX
        const apiUrl = `https://ahmad-rdx-api-cos1.onrender.com/downloader/aiodl?apikey=AhmadRDX&url=${encodeURIComponent(url)}`;
        
        // Timeout set to 60s because Render needs time to wake up
        const res = await axios.get(apiUrl, { timeout: 60000 });

        if (!res.data.status) throw new Error(res.data.msg || "Video not found.");

        const result = res.data.result;
        const videoUrl = result.links.video[0].url;
        const title = result.title || "RDX Media";
        const platform = result.extractor || "Universal";

        await api.editMessage(`${rdx_header}\n${line}\n📥 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐢𝐧𝐠: ${platform.toUpperCase()}\n${getBar(60)}\n${line}`, statusMsg.messageID, threadID);

        // 📥 BUFFER DOWNLOAD
        const response = await axios.get(videoUrl, { 
            responseType: 'arraybuffer',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const cacheDir = path.join(__dirname, "cache");
        await fs.ensureDir(cacheDir);
        const filePath = path.join(cacheDir, `rdx_private_${Date.now()}.mp4`);
        fs.writeFileSync(filePath, Buffer.from(response.data));

        const stats = fs.statSync(filePath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

        if (sizeMB > 48) {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            return api.editMessage(`❌ ${rdx_header}\n${line}\n⚠️ 𝐒𝐢𝐳𝐞: ${sizeMB}MB (Messenger Limit 48MB)\n${line}`, statusMsg.messageID, threadID);
        }

        await api.editMessage(`${rdx_header}\n${line}\n📤 𝐔𝐩𝐥𝐨𝐚𝐝𝐢𝐧𝐠 𝐭𝐨 𝐂𝐡𝐚𝐭...\n${getBar(100)}\n${line}`, statusMsg.messageID, threadID);

        // ✅ FINAL DELIVERY
        api.sendMessage({
            body: `${rdx_header}\n${line}\n✅ 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐂𝐨𝐦𝐩𝐥𝐞𝐭𝐞!\n\n📌 𝐏𝐥𝐚𝐭𝐟𝐨𝐫𝐦: ${platform.toUpperCase()}\n📝 𝐓𝐢𝐭𝐥𝐞: ${title.substring(0, 30)}...\n📦 𝐒𝐢𝐳𝐞: ${sizeMB} MB\n✨ 𝐒𝐞𝐫𝐯𝐞𝐫: RDX Private Node\n${line}\n🔥 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗`,
            attachment: [fs.createReadStream(filePath)]
        }, threadID, (err) => {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            if (statusMsg) api.unsendMessage(statusMsg.messageID);
        }, messageID);

    } catch (error) {
        let errorMsg = error.message;
        if (error.code === 'ECONNABORTED') errorMsg = "Render Server is waking up, please try again in 10 seconds.";
        
        if (statusMsg) api.editMessage(`❌ ${rdx_header}\n${line}\n𝐄𝐫𝐫о𝐫: ${errorMsg}\n${line}`, statusMsg.messageID, threadID);
        console.error("RDX API ERROR:", error);
    }
};
