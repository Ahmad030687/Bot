const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
    name: "auto123",
    version: "30.0.0",
    hasPermssion: 0,
    credits: "AHMAD RDX",
    description: "Universal Video Downloader - Error Fixed",
    commandCategory: "downloader",
    usages: "[link]",
    cooldowns: 2
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const videoUrl = args[0];

    const rdx_header = "🦅 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐒𝐘𝐒𝐓𝐄𝐌 🦅";
    const line = "━━━━━━━━━━━━━━━━━━";
    
    const frames = [
        " [▒▒▒▒▒▒▒▒▒▒] 10%",
        " [██▒▒▒▒▒▒▒▒] 35%",
        " [█████▒▒▒▒▒] 60%",
        " [████████▒▒] 85%",
        " [██████████] 100%"
    ];

    if (!videoUrl) {
        return api.sendMessage(`${rdx_header}\n${line}\n❌ 𝐀𝐡𝐦𝐚𝐝 𝐛𝐡𝐚𝐢, 𝐥𝐢𝐧𝐤 𝐭𝐨 𝐝𝐞𝐢𝐧!\n${line}`, threadID, messageID);
    }

    let statusMsg = null; // 🛡️ Initialize as null

    try {
        // Step 1: Initial Send
        statusMsg = await api.sendMessage(`${rdx_header}\n${line}\n🔍 𝐋𝐢𝐧𝐤 𝐃𝐞𝐭𝐞𝐜𝐭𝐞𝐝...\n${frames[0]}\n${line}`, threadID);

        // Step 2: Fetching (Safety check added)
        if (statusMsg && statusMsg.messageID) {
            await api.editMessage(`${rdx_header}\n${line}\n⚡ 𝐑𝐃𝐗 𝐄𝐧𝐠𝐢𝐧𝐞 𝐅𝐞𝐭𝐜𝐡𝐢𝐧𝐠...\n${frames[1]}\n${line}`, statusMsg.messageID, threadID);
        }

        const res = await axios.get(`https://kojaxd-api.vercel.app/downloader/aiodl`, {
            params: { url: videoUrl, apikey: 'Koja' }
        });

        const data = res.data;
        if (!data.status || !data.result) throw new Error("Media info not found.");

        const result = data.result;
        let finalDownloadUrl = result.links?.video?.hd?.url || result.links?.video?.sd?.url || result.url || (Array.isArray(result.links?.video) ? result.links.video[0]?.url : null);

        if (!finalDownloadUrl) throw new Error("Download link nahi mila.");

        // Step 3: Downloading
        if (statusMsg && statusMsg.messageID) {
            await api.editMessage(`${rdx_header}\n${line}\n📥 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐢𝐧𝐠 𝐌𝐞𝐝𝐢𝐚...\n${frames[2]}\n${line}`, statusMsg.messageID, threadID);
        }

        const cacheDir = path.join(__dirname, "cache");
        await fs.ensureDir(cacheDir);
        const filePath = path.join(cacheDir, `rdx_${Date.now()}.mp4`);

        const fileRes = await axios({
            method: 'GET',
            url: finalDownloadUrl,
            responseType: 'arraybuffer',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        // Step 4: Processing
        if (statusMsg && statusMsg.messageID) {
            await api.editMessage(`${rdx_header}\n${line}\n⚙️ 𝐏𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠 𝐅𝐢𝐥𝐞...\n${frames[3]}\n${line}`, statusMsg.messageID, threadID);
        }
        fs.writeFileSync(filePath, Buffer.from(fileRes.data));

        const stats = fs.statSync(filePath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

        // Step 5: Final Uploading
        if (statusMsg && statusMsg.messageID) {
            await api.editMessage(`${rdx_header}\n${line}\n📤 𝐔𝐩𝐥𝐨𝐚𝐝𝐢𝐧𝐠 𝐭𝐨 𝐂𝐡𝐚𝐭...\n${frames[4]}\n${line}`, statusMsg.messageID, threadID);
        }

        await api.sendMessage({
            body: `${rdx_header}\n${line}\n✅ 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐂𝐨𝐦𝐩𝐥𝐞𝐭𝐞!\n📝 𝐓𝐢𝐭𝐥𝐞: ${(result.title || "RDX Video").substring(0, 50)}...\n📦 𝐒𝐢𝐳𝐞: ${sizeMB} MB\n${line}\n🔥 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗`,
            attachment: fs.createReadStream(filePath)
        }, threadID, () => {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            if (statusMsg && statusMsg.messageID) api.unsendMessage(statusMsg.messageID);
        });

    } catch (error) {
        console.error("RDX ERROR:", error.message);
        if (statusMsg && statusMsg.messageID) {
            api.editMessage(`❌ ${rdx_header}\n${line}\n𝐄𝐫𝐫𝐨𝐫: ${error.message}\n${line}`, statusMsg.messageID, threadID);
            setTimeout(() => api.unsendMessage(statusMsg.messageID), 5000);
        }
    }
};
