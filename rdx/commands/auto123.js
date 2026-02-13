const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
    name: "auto",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "AHMAD RDX",
    description: "Download FB Videos via Direct Koja API",
    commandCategory: "downloader",
    usages: "[link]",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const videoUrl = args[0];

    // 🦅 RDX UI Design
    const rdx_header = "🦅 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐒𝐘𝐒𝐓𝐄𝐌 🦅";
    const line = "━━━━━━━━━━━━━━━━━━";
    
    if (!videoUrl) return api.sendMessage(`${rdx_header}\n${line}\n❌ 𝐀𝐡𝐦𝐚𝐝 𝐛𝐡𝐚𝐢, 𝐥𝐢𝐧𝐤 𝐝𝐨!\n${line}`, threadID, messageID);

    const frames = [
        " [▒▒▒▒▒▒▒▒▒▒] 15%",
        " [███▒▒▒▒▒▒▒] 45%",
        " [██████▒▒▒▒] 70%",
        " [██████████] 100%"
    ];

    let statusMsg = null;

    try {
        // Step 1: Status Message
        statusMsg = await api.sendMessage(`${rdx_header}\n${line}\n🔍 𝐅𝐞𝐭𝐜𝐡𝐢𝐧𝐠 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐃𝐚𝐭𝐚...\n${frames[0]}\n${line}`, threadID);

        // Step 2: Direct API Call
        const res = await axios.get(`https://kojaxd-api.vercel.app/downloader/facebook2`, {
            params: { apikey: "Koja", url: videoUrl }
        });

        if (!res.data.status) throw new Error("Video link not found!");

        // 🛠️ HD Link select karna (aapke tester ke mutabiq)
        const downloadUrl = res.data.video_HD?.url || res.data.video_SD?.url;
        const duration = res.data.duration || "N/A";

        if (!downloadUrl) throw new Error("Downloadable URL missing.");

        // Step 3: Downloading Animation
        if (statusMsg) await api.editMessage(`${rdx_header}\n${line}\n📥 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐢𝐧𝐠 𝐌𝐞𝐝𝐢𝐚...\n${frames[1]}\n${line}`, statusMsg.messageID, threadID);

        const cacheDir = path.join(__dirname, "cache");
        await fs.ensureDir(cacheDir);
        const filePath = path.join(cacheDir, `fb_rdx_${Date.now()}.mp4`);

        const fileRes = await axios({
            method: 'GET',
            url: downloadUrl,
            responseType: 'arraybuffer',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        // Step 4: Saving File
        if (statusMsg) await api.editMessage(`${rdx_header}\n${line}\n⚙️ 𝐏𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠 𝐅𝐢𝐥𝐞...\n${frames[2]}\n${line}`, statusMsg.messageID, threadID);
        fs.writeFileSync(filePath, Buffer.from(fileRes.data));

        const stats = fs.statSync(filePath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

        // Step 5: Final Upload
        if (statusMsg) await api.editMessage(`${rdx_header}\n${line}\n📤 𝐔𝐩𝐥𝐨𝐚𝐝𝐢𝐧𝐠 𝐭𝐨 𝐂𝐡𝐚𝐭...\n${frames[3]}\n${line}`, statusMsg.messageID, threadID);

        await api.sendMessage({
            body: `${rdx_header}\n${line}\n✅ 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐂𝐨𝐦𝐩𝐥𝐞𝐭𝐞!\n⏱️ 𝐃𝐮𝐫𝐚𝐭𝐢𝐨𝐧: ${duration}\n📦 𝐒𝐢𝐳𝐞: ${sizeMB} MB\n${line}\n🔥 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗`,
            attachment: fs.createReadStream(filePath)
        }, threadID, () => {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            if (statusMsg) api.unsendMessage(statusMsg.messageID);
        }, messageID);

    } catch (error) {
        if (statusMsg) {
            api.editMessage(`❌ ${rdx_header}\n${line}\n𝐄𝐫𝐫𝐨𝐫: ${error.message}\n${line}`, statusMsg.messageID, threadID);
            setTimeout(() => api.unsendMessage(statusMsg.messageID), 5000);
        }
    }
};
