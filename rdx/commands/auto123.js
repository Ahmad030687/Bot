const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "auto",
    version: "80.0.0",
    hasPermssion: 0,
    credits: "AHMAD RDX",
    description: "Turbo-Speed Downloader - Fixed Attachment Error",
    commandCategory: "media",
    usages: "[link]",
    cooldowns: 2
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const link = args[0];

    const rdx_header = "🦅 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐒𝐘𝐒𝐓𝐄𝐌 🦅";
    const line = "━━━━━━━━━━━━━━━━━━";

    if (!link) return api.sendMessage(`${rdx_header}\n${line}\n❌ 𝐀𝐡𝐦𝐚𝐝 𝐛𝐡𝐚𝐢, 𝐥𝐢𝐧𝐤 𝐭𝐨 𝐝𝐞𝐢𝐧!\n${line}`, threadID, messageID);

    let statusMsg = await api.sendMessage(`${rdx_header}\n${line}\n🚀 𝐓𝐮𝐫𝐛𝐨 𝐄𝐧𝐠𝐢𝐧𝐞 𝐒𝐭𝐚𝐫𝐭𝐢𝐧𝐠...\n${line}`, threadID);

    try {
        let downloadUrl = "";
        let title = "RDX Media";
        let platform = "Media";

        // --- PLATFORM DETECTION ---
        if (link.includes("tiktok.com")) {
            platform = "TikTok HD";
            const res = await axios.post("https://www.tikwm.com/api/", { url: link, hd: 1 });
            downloadUrl = res.data.data?.play;
            title = res.data.data?.title || "TikTok Video";
        } 
        else if (link.includes("facebook.com") || link.includes("fb.watch")) {
            platform = "Facebook";
            const res = await axios.get(`https://kojaxd-api.vercel.app/downloader/facebook2?apikey=Koja&url=${encodeURIComponent(link)}`);
            downloadUrl = res.data.video_HD?.url || res.data.video_SD?.url;
        } 
        else if (link.includes("instagram.com")) {
            platform = "Instagram";
            const res = await axios.get(`https://kojaxd-api.vercel.app/downloader/instagram?apikey=Koja&url=${encodeURIComponent(link)}`);
            downloadUrl = res.data.downloadUrl || res.data.videoUrl;
        } 
        else if (link.includes("snapchat.com")) {
            platform = "Snapchat";
            const res = await axios.get(`https://kojaxd-api.vercel.app/downloader/aiodl?apikey=Koja&url=${encodeURIComponent(link)}`);
            downloadUrl = res.data.result?.links?.video[0]?.url || res.data.result?.url;
            if (downloadUrl && !downloadUrl.startsWith('http')) downloadUrl = "https://dl1.mnmnmnmnrmnmnn.shop/" + downloadUrl;
        }

        if (!downloadUrl) throw new Error("Link not supported or Private.");

        // --- SAFETY DOWNLOAD SYSTEM ---
        const cacheDir = path.join(__dirname, "cache");
        await fs.ensureDir(cacheDir);
        const filePath = path.join(cacheDir, `rdx_turbo_${Date.now()}.mp4`);

        const response = await axios({
            method: 'GET',
            url: downloadUrl,
            responseType: 'stream',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        writer.on('finish', async () => {
            // 🛡️ CRITICAL CHECK: Does file exist and is not empty?
            if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
                return api.editMessage(`❌ ${rdx_header}\n${line}\n𝐄𝐫𝐫𝐨𝐫: Download failed or file corrupted.\n${line}`, statusMsg.messageID, threadID);
            }

            const stats = fs.statSync(filePath);
            const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

            if (sizeMB > 48) {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                return api.editMessage(`❌ ${rdx_header}\n${line}\n𝐒𝐢𝐳𝐞: ${sizeMB}MB (Too big for Messenger)\n${line}`, statusMsg.messageID, threadID);
            }

            // 📤 SENDING WITH ERROR CATCHING
            api.sendMessage({
                body: `${rdx_header}\n${line}\n✅ 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐂𝐨𝐦𝐩𝐥𝐞𝐭𝐞!\n📌 𝐏𝐥𝐚𝐭𝐟𝐨𝐫𝐦: ${platform}\n📦 𝐒𝐢𝐳𝐞: ${sizeMB} MB\n${line}\n🔥 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗`,
                attachment: fs.createReadStream(filePath)
            }, threadID, (err) => {
                if (err) console.error("Send Attachment Error:", err);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                if (statusMsg) api.unsendMessage(statusMsg.messageID);
            }, messageID);
        });

        writer.on('error', (err) => { throw err; });

    } catch (error) {
        console.error("RDX Error:", error.message);
        if (statusMsg) {
            api.editMessage(`❌ ${rdx_header}\n${line}\n𝐄𝐫𝐫𝐨𝐫: ${error.message}\n${line}`, statusMsg.messageID, threadID);
            setTimeout(() => api.unsendMessage(statusMsg.messageID), 5000);
        }
    }
};
