const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "auto",
    version: "120.0.0",
    hasPermssion: 0,
    credits: "AHMAD RDX",
    description: "Multi-Platform Turbo Downloader (Fixed Snapchat)",
    commandCategory: "media",
    usages: "[link]",
    cooldowns: 2
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
    const link = args[0];

    if (!link) return api.sendMessage(`${rdx_header}\n${line}\n⚠️ 𝐔𝐬𝐭𝐚𝐝 𝐣𝐢, 𝐥𝐢𝐧𝐤 𝐭𝐨 𝐝𝐞𝐢𝐧!\n${line}`, threadID, messageID);

    let statusMsg = await api.sendMessage(`${rdx_header}\n${line}\n🚀 𝐈𝐧𝐢𝐭𝐢𝐚𝐥𝐢𝐳𝐢𝐧𝐠 𝐄𝐧𝐠𝐢𝐧𝐞...\n${getBar(10)}\n${line}`, threadID);

    try {
        let downloadUrl = "";
        let platform = "Media";
        let title = "RDX Download";

        // --- 1. TIKTOK DETECTION ---
        if (link.includes("tiktok.com")) {
            platform = "TikTok HD";
            await api.editMessage(`${rdx_header}\n${line}\n🎵 𝐓𝐢𝐤𝐓𝐨𝐤 𝐄𝐧𝐠𝐢𝐧𝐞 𝐀𝐜𝐭𝐢𝐯𝐞...\n${getBar(40)}\n${line}`, statusMsg.messageID, threadID);
            const res = await axios.post("https://www.tikwm.com/api/", { url: link, hd: 1 });
            downloadUrl = res.data.data?.play;
            title = res.data.data?.title || "TikTok Video";
        } 
        // --- 2. FACEBOOK DETECTION ---
        else if (link.includes("facebook.com") || link.includes("fb.watch")) {
            platform = "Facebook";
            await api.editMessage(`${rdx_header}\n${line}\n🔵 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐄𝐧𝐠𝐢𝐧𝐞 𝐀𝐜𝐭𝐢𝐯𝐞...\n${getBar(40)}\n${line}`, statusMsg.messageID, threadID);
            const res = await axios.get(`https://kojaxd-api.vercel.app/downloader/facebook2?apikey=Koja&url=${encodeURIComponent(link)}`);
            downloadUrl = res.data.video_HD?.url || res.data.video_SD?.url;
        } 
        // --- 3. INSTAGRAM DETECTION ---
        else if (link.includes("instagram.com")) {
            platform = "Instagram";
            await api.editMessage(`${rdx_header}\n${line}\n📸 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦 𝐄𝐧𝐠𝐢𝐧𝐞 𝐀𝐜𝐭𝐢𝐯𝐞...\n${getBar(40)}\n${line}`, statusMsg.messageID, threadID);
            const res = await axios.get(`https://kojaxd-api.vercel.app/downloader/instagram?apikey=Koja&url=${encodeURIComponent(link)}`);
            downloadUrl = res.data.downloadUrl || res.data.videoUrl;
        } 
        // --- 4. SNAPCHAT DETECTION (New Logic) ---
        else if (link.includes("snapchat.com")) {
            platform = "Snapchat";
            await api.editMessage(`${rdx_header}\n${line}\n👻 𝐒𝐧𝐚𝐩𝐜𝐡𝐚𝐭 𝐄𝐧𝐠𝐢𝐧𝐞 𝐀𝐜𝐭𝐢𝐯𝐞...\n${getBar(40)}\n${line}`, statusMsg.messageID, threadID);
            const res = await axios.get(`https://kojaxd-api.vercel.app/downloader/aiodl?apikey=Koja&url=${encodeURIComponent(link)}`);
            
            if (res.data.status && res.data.result) {
                const snapData = res.data.result;
                title = snapData.title || "Snapchat Snap";
                // Snapchat ka link aksar extract karna parta hai
                downloadUrl = snapData.links?.video[0]?.url || snapData.url;
                
                // Agar URL direct nahi hai to snap server base lagana parega
                if (downloadUrl && !downloadUrl.startsWith('http')) {
                    downloadUrl = "https://dl1.mnmnmnmnrmnmnn.site/download.php?token=" + downloadUrl;
                }
            }
        }

        if (!downloadUrl) throw new Error("Link not supported or Private.");

        // --- 📥 BUFFER DOWNLOAD SYSTEM ---
        await api.editMessage(`${rdx_header}\n${line}\n📥 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐢𝐧𝐠 𝐒𝐭𝐫𝐞𝐚𝐦...\n${getBar(70)}\n${line}`, statusMsg.messageID, threadID);

        const response = await axios.get(downloadUrl, { 
            responseType: 'arraybuffer',
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });

        const cacheDir = path.join(__dirname, "cache");
        await fs.ensureDir(cacheDir);
        const filePath = path.join(cacheDir, `rdx_${Date.now()}.mp4`);
        fs.writeFileSync(filePath, Buffer.from(response.data));

        const stats = fs.statSync(filePath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

        if (sizeMB > 48) {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            return api.editMessage(`❌ ${rdx_header}\n${line}\n⚠️ 𝐒𝐢𝐳𝐞: ${sizeMB}MB (Messenger Limit 48MB)\n${line}`, statusMsg.messageID, threadID);
        }

        // --- 📤 PREMIUM SENDING ---
        await api.editMessage(`${rdx_header}\n${line}\n📤 𝐔𝐩𝐥𝐨𝐚𝐝𝐢𝐧𝐠 𝐭𝐨 𝐂𝐡𝐚𝐭...\n${getBar(100)}\n${line}`, statusMsg.messageID, threadID);

        const body = `${rdx_header}\n${line}\n✅ 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐂𝐨𝐦𝐩𝐥𝐞𝐭𝐞!\n\n📌 𝐏𝐥𝐚𝐭𝐟𝐨𝐫𝐦: ${platform}\n📝 𝐓𝐢𝐭𝐥𝐞: ${title.substring(0, 30)}...\n📦 𝐒𝐢𝐳𝐞: ${sizeMB} MB\n✨ 𝐒𝐭𝐚𝐭𝐮𝐬: Premium High-Speed\n${line}\n🔥 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗`;

        api.sendMessage({
            body: body,
            attachment: [fs.createReadStream(filePath)]
        }, threadID, (err) => {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            if (statusMsg) api.unsendMessage(statusMsg.messageID);
        }, messageID);

    } catch (error) {
        if (statusMsg) api.editMessage(`❌ ${rdx_header}\n${line}\n𝐄𝐫𝐫𝐨𝐫: ${error.message}\n${line}`, statusMsg.messageID, threadID);
    }
};
