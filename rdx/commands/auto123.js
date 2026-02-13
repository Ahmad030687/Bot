const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "auto",
    version: "70.0.0",
    hasPermssion: 0,
    credits: "AHMAD RDX",
    description: "Turbo-Speed Downloader (FB, IG, TT, SC)",
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

        // --- 1. TIKTOK LOGIC ---
        if (link.includes("tiktok.com")) {
            platform = "TikTok HD";
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
            const res = await axios.get(`https://kojaxd-api.vercel.app/downloader/facebook2?apikey=Koja&url=${encodeURIComponent(link)}`);
            if (res.data.status) {
                downloadUrl = res.data.video_HD?.url || res.data.video_SD?.url;
                title = "FB Video/Reel";
            }
        }

        // --- 3. INSTAGRAM LOGIC ---
        else if (link.includes("instagram.com")) {
            platform = "Instagram";
            const res = await axios.get(`https://kojaxd-api.vercel.app/downloader/instagram?apikey=Koja&url=${encodeURIComponent(link)}`);
            if (res.data.status) {
                downloadUrl = res.data.downloadUrl || res.data.videoUrl;
                title = "IG Reel/Post";
            }
        }

        // --- 4. SNAPCHAT LOGIC (New) ---
        else if (link.includes("snapchat.com")) {
            platform = "Snapchat";
            const res = await axios.get(`https://kojaxd-api.vercel.app/downloader/aiodl?apikey=Koja&url=${encodeURIComponent(link)}`);
            if (res.data.status && res.data.result) {
                const result = res.data.result;
                // Path based on your tester output
                downloadUrl = result.links?.video[0]?.url || result.url;
                title = result.title || "Snapchat Video";
                
                // Snapchat links often need a base domain if they are relative
                if (downloadUrl && !downloadUrl.startsWith('http')) {
                    downloadUrl = "https://dl1.mnmnmnmnrmnmnn.shop/" + downloadUrl;
                }
            }
        }

        if (!downloadUrl) throw new Error("Link not supported or Private.");

        // --- 🚀 TURBO STREAMING DOWNLOAD ---
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
            const stats = fs.statSync(filePath);
            const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

            if (sizeMB > 48) {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                return api.editMessage(`❌ ${rdx_header}\n${line}\n𝐒𝐢𝐳𝐞: ${sizeMB}MB (Too big for Messenger)\n${line}`, statusMsg.messageID, threadID);
            }

            await api.sendMessage({
                body: `${rdx_header}\n${line}\n✅ 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐂𝐨𝐦𝐩𝐥𝐞𝐭𝐞!\n📌 𝐏𝐥𝐚𝐭𝐟𝐨𝐫𝐦: ${platform}\n📦 𝐒𝐢𝐳𝐞: ${sizeMB} MB\n${line}\n🔥 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗`,
                attachment: fs.createReadStream(filePath)
            }, threadID, () => {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                if (statusMsg) api.unsendMessage(statusMsg.messageID);
            }, messageID);
        });

        writer.on('error', (err) => { throw err; });

    } catch (error) {
        console.error(error);
        if (statusMsg) {
            api.editMessage(`❌ ${rdx_header}\n${line}\n𝐄𝐫𝐫𝐨𝐫: ${error.message}\n${line}`, statusMsg.messageID, threadID);
            setTimeout(() => api.unsendMessage(statusMsg.messageID), 5000);
        }
    }
};
