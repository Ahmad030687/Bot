const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "auto",
    version: "110.0.0",
    hasPermssion: 0,
    credits: "AHMAD RDX",
    description: "Turbo Downloader - Final Attachment Fix",
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
        let platform = "Media";

        // --- PLATFORM DETECTION ---
        if (link.includes("tiktok.com")) {
            platform = "TikTok HD";
            const res = await axios.post("https://www.tikwm.com/api/", { url: link, hd: 1 });
            downloadUrl = res.data.data?.play;
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

        const cacheDir = path.join(__dirname, "cache");
        await fs.ensureDir(cacheDir);
        const filePath = path.join(cacheDir, `rdx_${Date.now()}.mp4`);

        // --- 📥 TURBO DOWNLOAD ---
        const response = await axios({
            method: 'GET',
            url: downloadUrl,
            responseType: 'stream',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        writer.on('finish', async () => {
            // 🛡️ WAIT & VALIDATE
            await new Promise(r => setTimeout(r, 2000)); // 2 Seconds wait for Render disk

            if (!fs.existsSync(filePath)) {
                return api.editMessage("❌ Error: File not found on server.", statusMsg.messageID, threadID);
            }

            const stats = fs.statSync(filePath);
            if (stats.size < 1000) { // If file is less than 1KB
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                return api.editMessage("❌ Error: Download corrupted.", statusMsg.messageID, threadID);
            }

            const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
            if (sizeMB > 48) {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                return api.editMessage(`⚠️ Size: ${sizeMB}MB (Messenger limit 48MB)`, statusMsg.messageID, threadID);
            }

            // --- 📤 STABLE SENDING ---
            const attachmentStream = fs.createReadStream(filePath);
            
            // Handle stream errors before sending
            attachmentStream.on('error', (err) => {
                console.error("Stream Error:", err);
                api.editMessage("❌ Stream Error occurred.", statusMsg.messageID, threadID);
            });

            api.sendMessage({
                body: `${rdx_header}\n${line}\n✅ 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐂𝐨𝐦𝐩𝐥𝐞𝐭𝐞!\n📌 𝐏𝐥𝐚𝐭𝐟𝐨𝐫𝐦: ${platform}\n📦 𝐒𝐢𝐳𝐞: ${sizeMB} MB\n${line}\n🔥 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗`,
                attachment: attachmentStream
            }, threadID, (err) => {
                if (err) {
                    console.error("FCA SEND ERROR:", err);
                    // If sending fails, try one last time with direct URL if possible
                    api.sendMessage(`❌ Error sending file. You can watch here:\n🔗 ${downloadUrl}`, threadID);
                }
                // Cleanup
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                if (statusMsg) api.unsendMessage(statusMsg.messageID);
            }, messageID);
        });

        writer.on('error', (e) => { throw e; });

    } catch (error) {
        console.error("RDX MASTER ERROR:", error);
        if (statusMsg) {
            api.editMessage(`❌ ${rdx_header}\n${line}\n𝐄𝐫𝐫𝐨𝐫: ${error.message}\n${line}`, statusMsg.messageID, threadID);
        }
    }
};
