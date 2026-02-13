const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "auto",
    version: "50.0.0",
    hasPermssion: 0,
    credits: "AHMAD RDX",
    description: "Universal Downloader (FB, IG, TikTok HD)",
    commandCategory: "media",
    usages: "[link]",
    cooldowns: 2
};

// --- RDX UI SYSTEM ---
const progressBar = (percentage) => {
    const filled = Math.round(percentage / 10);
    const empty = 10 - filled;
    return `[${'█'.repeat(filled)}${'▒'.repeat(empty)}] ${percentage}%`;
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const link = args[0];

    const rdx_header = "🦅 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐒𝐘𝐒𝐓𝐄𝐌 🦅";
    const line = "━━━━━━━━━━━━━━━━━━";

    if (!link) return api.sendMessage(`${rdx_header}\n${line}\n❌ 𝐀𝐡𝐦𝐚𝐝 𝐛𝐡𝐚𝐢, 𝐥𝐢𝐧𝐤 𝐭𝐨 𝐝𝐞𝐢𝐧!\n${line}`, threadID, messageID);

    let statusMsg = null;
    try {
        statusMsg = await api.sendMessage(`${rdx_header}\n${line}\n🔍 𝐃𝐞𝐭𝐞𝐜𝐭𝐢𝐧𝐠 𝐏𝐥𝐚𝐭𝐟𝐨𝐫𝐦...\n${progressBar(10)}\n${line}`, threadID);

        let downloadUrl = "";
        let title = "RDX Media";
        let platform = "Media";

        // --- 1. TIKTOK LOGIC ---
        if (link.includes("tiktok.com")) {
            platform = "TikTok HD";
            if (statusMsg) await api.editMessage(`${rdx_header}\n${line}\n🎵 𝐓𝐢𝐤𝐓𝐨𝐤 𝐄𝐧𝐠𝐢𝐧ｅ 𝐀𝐜𝐭𝐢𝐯𝐞...\n${progressBar(30)}\n${line}`, statusMsg.messageID, threadID);
            
            const res = await axios.post("https://www.tikwm.com/api/", { url: link, hd: 1 });
            const data = res.data.data;
            if (data && data.play) {
                downloadUrl = data.play;
                title = data.title || "TikTok Video";
            }
        }

        // --- 2. FACEBOOK LOGIC ---
        else if (link.includes("facebook.com") || link.includes("fb.watch")) {
            platform = "Facebook";
            if (statusMsg) await api.editMessage(`${rdx_header}\n${line}\n🔵 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐄𝐧𝐠𝐢𝐧𝐞 𝐀𝐜𝐭𝐢𝐯𝐞...\n${progressBar(30)}\n${line}`, statusMsg.messageID, threadID);
            
            const res = await axios.get(`https://kojaxd-api.vercel.app/downloader/facebook2?apikey=Koja&url=${encodeURIComponent(link)}`);
            if (res.data.status) {
                downloadUrl = res.data.video_HD?.url || res.data.video_SD?.url;
                title = "FB Reel/Video";
            }
        }

        // --- 3. INSTAGRAM LOGIC ---
        else if (link.includes("instagram.com")) {
            platform = "Instagram";
            if (statusMsg) await api.editMessage(`${rdx_header}\n${line}\n📸 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦 𝐄𝐧𝐠𝐢𝐧𝐞 𝐀𝐜𝐭𝐢𝐯𝐞...\n${progressBar(30)}\n${line}`, statusMsg.messageID, threadID);
            
            const res = await axios.get(`https://kojaxd-api.vercel.app/downloader/instagram?apikey=Koja&url=${encodeURIComponent(link)}`);
            if (res.data.status) {
                downloadUrl = res.data.downloadUrl || res.data.videoUrl;
                title = "IG Reel/Post";
            }
        }

        if (!downloadUrl) throw new Error("Video not found or link is private.");

        // --- DOWNLOAD & SEND ---
        if (statusMsg) await api.editMessage(`${rdx_header}\n${line}\n📥 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐢𝐧𝐠 𝐒𝐭𝐫𝐞𝐚𝐦...\n${progressBar(60)}\n${line}`, statusMsg.messageID, threadID);

        const cacheDir = path.join(__dirname, "cache");
        await fs.ensureDir(cacheDir);
        const filePath = path.join(cacheDir, `rdx_${Date.now()}.mp4`);

        const fileRes = await axios({
            method: 'GET',
            url: downloadUrl,
            responseType: 'arraybuffer',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        if (statusMsg) await api.editMessage(`${rdx_header}\n${line}\n⚙️ 𝐏𝐫𝐨𝐜𝐞𝐬𝐬𝐢ｎ𝐠 𝐅𝐢𝐥𝐞...\n${progressBar(90)}\n${line}`, statusMsg.messageID, threadID);
        fs.writeFileSync(filePath, Buffer.from(fileRes.data));

        const stats = fs.statSync(filePath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

        if (sizeMB > 45) {
             throw new Error(`File size (${sizeMB}MB) is too large for Messenger.`);
        }

        await api.sendMessage({
            body: `${rdx_header}\n${line}\n✅ 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐂𝐨𝐦𝐩𝐥𝐞𝐭𝐞!\n📌 𝐏𝐥𝐚𝐭𝐟𝐨𝐫𝐦: ${platform}\n📝 𝐓𝐢𝐭𝐥𝐞: ${title.substring(0, 40)}...\n📦 𝐒𝐢𝐳𝐞: ${sizeMB} MB\n${line}\n🔥 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗`,
            attachment: fs.createReadStream(filePath)
        }, threadID, () => {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            if (statusMsg) api.unsendMessage(statusMsg.messageID);
        }, messageID);

    } catch (error) {
        console.error(error);
        if (statusMsg) {
            api.editMessage(`❌ ${rdx_header}\n${line}\n𝐄𝐫𝐫𝐨𝐫: ${error.message}\n${line}`, statusMsg.messageID, threadID);
            setTimeout(() => api.unsendMessage(statusMsg.messageID), 5000);
        }
    }
};
