const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "auto",
    version: "210.0.0",
    hasPermssion: 0,
    credits: "AHMAD RDX",
    description: "Universal AIODL with Intelligent Domain Fix",
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
    const { threadID, messageID } = event;
    const url = args[0];

    if (!url) return api.sendMessage(`${rdx_header}\n${line}\n⚠️ 𝐔𝐬𝐭𝐚𝐝 𝐣𝐢, 𝐥𝐢𝐧𝐤 𝐭о 𝐝𝐞𝐢𝐧!\n${line}`, threadID, messageID);

    let statusMsg = await api.sendMessage(`${rdx_header}\n${line}\n🚀 𝐀𝐈𝐎𝐃𝐋 𝐄𝐧𝐠𝐢𝐧𝐞 𝐀𝐜𝐭𝐢𝐯𝐚𝐭𝐢𝐧𝐠...\n${getBar(15)}\n${line}`, threadID);

    try {
        const apiUrl = `https://kojaxd-api.vercel.app/downloader/aiodl?apikey=Koja&url=${encodeURIComponent(url)}`;
        const res = await axios.get(apiUrl);

        if (!res.data.status || !res.data.result) throw new Error("API could not find video data.");

        const result = res.data.result;
        let downloadUrl = "";
        let platform = result.extractor || "Universal";
        let title = result.title || "RDX Media";

        // 🚀 SMART URL EXTRACTION
        let rawLink = result.links?.video?.[0]?.url || result.url || result.downloadUrl;

        // 🦅 RDX INTELLIGENT DOMAIN FIXER
        // Agar link 'http' se shuru nahi ho raha, to domain khud nikalega
        if (rawLink && !rawLink.startsWith('http')) {
            const thumbUrl = result.thumbnail || "";
            const domainMatch = thumbUrl.match(/^https?:\/\/[^\/]+/);
            // Thumbnail se domain nikalo ya phir current active domain use karo
            const baseDomain = domainMatch ? domainMatch[0] : "https://dl1.iiilllilliliiiill.shop";
            downloadUrl = `${baseDomain}/download.php?token=${rawLink}`;
        } else {
            downloadUrl = rawLink;
        }

        if (!downloadUrl) throw new Error("Download Link not found.");

        await api.editMessage(`${rdx_header}\n${line}\n📥 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐢𝐧𝐠: ${platform.toUpperCase()}\n${getBar(65)}\n${line}`, statusMsg.messageID, threadID);

        // 📥 BUFFER DOWNLOAD
        const response = await axios.get(downloadUrl, { 
            responseType: 'arraybuffer',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const cacheDir = path.join(__dirname, "cache");
        await fs.ensureDir(cacheDir);
        const filePath = path.join(cacheDir, `rdx_uni_${Date.now()}.mp4`);
        fs.writeFileSync(filePath, Buffer.from(response.data));

        const stats = fs.statSync(filePath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

        if (sizeMB > 48) {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            return api.editMessage(`❌ ${rdx_header}\n${line}\n⚠️ 𝐒𝐢𝐳𝐞: ${sizeMB}MB (Limit 48MB)\n${line}`, statusMsg.messageID, threadID);
        }

        await api.editMessage(`${rdx_header}\n${line}\n📤 𝐔𝐩𝐥𝐨𝐚𝐝𝐢𝐧𝐠 𝐭𝐨 𝐂𝐡𝐚𝐭...\n${getBar(100)}\n${line}`, statusMsg.messageID, threadID);

        api.sendMessage({
            body: `${rdx_header}\n${line}\n✅ 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐂𝐨𝐦𝐩𝐥𝐞𝐭𝐞!\n\n📌 𝐏𝐥𝐚𝐭𝐟𝐨𝐫𝐦: ${platform.toUpperCase()}\n📝 𝐓𝐢𝐭𝐥𝐞: ${title.substring(0, 35)}...\n📦 𝐒𝐢𝐳𝐞: ${sizeMB} MB\n✨ 𝐒𝐭𝐚𝐭𝐮𝐬: Ultra Turbo\n${line}\n🔥 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗`,
            attachment: [fs.createReadStream(filePath)]
        }, threadID, (err) => {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            if (statusMsg) api.unsendMessage(statusMsg.messageID);
        }, messageID);

    } catch (error) {
        if (statusMsg) api.editMessage(`❌ ${rdx_header}\n${line}\n𝐄𝐫𝐫𝐨𝐫: Server is down or Link invalid.\n${line}`, statusMsg.messageID, threadID);
    }
};
