const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: 'autoDownload',
        eventType: 'message',
        version: '2.0.0',
        credits: 'AHMAD RDX',
        description: 'Premium Auto Video Downloader with RDX Animations'
    },

    async run({ api, event }) {
        const { threadID, body, messageID, senderID } = event;
        if (!body) return;

        const botID = api.getCurrentUserID();
        if (senderID === botID) return;

        // 🦅 RDX Ultra Detection Regex
        const socialRegex = /https?:\/\/(?:www\.|m\.|web\.|v\.|fb\.)?(?:facebook\.com|fb\.watch|instagram\.com|tiktok\.com|reels|share|youtube\.com|youtu\.be)\/\S+/ig;
        const matches = body.match(socialRegex);
        if (!matches) return;

        const videoUrl = matches[0];
        
        // --- 💎 PREMIUM FONTS & SYMBOLS ---
        const rdx_header = "🦅 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐒𝐘𝐒𝐓𝐄𝐌 🦅";
        const line = "━━━━━━━━━━━━━━━━━━";
        
        const frames = [
            " [▒▒▒▒▒▒▒▒▒▒] 10%",
            " [██▒▒▒▒▒▒▒▒] 30%",
            " [█████▒▒▒▒▒] 55%",
            " [████████▒▒] 85%",
            " [██████████] 100%"
        ];

        let statusMsg;
        try {
            statusMsg = await api.sendMessage(`${rdx_header}\n${line}\n🔍 𝐋𝐢𝐧𝐤 𝐃𝐞𝐭𝐞𝐜𝐭𝐞𝐝...\n${frames[0]}\n${line}`, threadID);
        } catch (e) { return; }

        const cacheDir = path.join(__dirname, "../commands/cache");

        try {
            // Animation 1: Fetching Data
            await api.editMessage(`${rdx_header}\n${line}\n⚡ 𝐅𝐞𝐭𝐜𝐡𝐢𝐧𝐠 𝐌𝐞𝐝𝐢𝐚 𝐃𝐚𝐭𝐚...\n${frames[1]}\n${line}`, statusMsg.messageID, threadID);

            // 🚀 Engine 1: Koja API (Primary)
            let videoData;
            try {
                const res = await axios.get(`https://kojaxd-api.vercel.app/downloader/aiodl?url=${encodeURIComponent(videoUrl)}&apikey=Koja`);
                videoData = res.data.result?.url || res.data.url || res.data.data?.main_url;
            } catch (err) {
                // 🚀 Engine 2: Vreden (Backup)
                const backup = await axios.get(`https://api.vreden.web.id/api/downloader/all?url=${encodeURIComponent(videoUrl)}`);
                videoData = backup.data?.data?.url || backup.data?.result;
            }

            if (!videoData) throw new Error("Video link not found or API down.");

            // Animation 2: Starting Download
            await api.editMessage(`${rdx_header}\n${line}\n📥 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐢𝐧𝐠 𝐅𝐢𝐥𝐞...\n${frames[2]}\n${line}`, statusMsg.messageID, threadID);

            const fileResponse = await axios({
                method: 'GET',
                url: videoData,
                responseType: 'arraybuffer',
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });

            // Animation 3: Processing File
            await api.editMessage(`${rdx_header}\n${line}\n⚙️ 𝐏𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠 𝐌𝐞𝐝𝐢𝐚...\n${frames[3]}\n${line}`, statusMsg.messageID, threadID);

            await fs.ensureDir(cacheDir);
            const filePath = path.join(cacheDir, `rdx_vid_${Date.now()}.mp4`);
            fs.writeFileSync(filePath, Buffer.from(fileResponse.data));

            const stats = fs.statSync(filePath);
            const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

            // Final Animation: Uploading
            await api.editMessage(`${rdx_header}\n${line}\n📤 𝐔𝐩𝐥𝐨𝐚𝐝𝐢𝐧𝐠 𝐭𝐨 𝐂𝐡𝐚𝐭...\n${frames[4]}\n${line}`, statusMsg.messageID, threadID);

            // Prepare Final Message
            const finalBody = `${rdx_header}\n${line}\n✅ 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐂𝐨𝐦𝐩𝐥𝐞𝐭𝐞!\n📦 𝐒𝐢𝐳𝐞: ${sizeMB} MB\n✨ 𝐄𝐧𝐠𝐢𝐧𝐞: RDX Premium\n${line}\n🔥 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗`;

            await api.sendMessage({
                body: finalBody,
                attachment: fs.createReadStream(filePath)
            }, threadID, () => {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                api.unsendMessage(statusMsg.messageID);
            });

        } catch (error) {
            console.log("RDX Error:", error.message);
            api.editMessage(`❌ ${rdx_header}\n${line}\n𝐄𝐫𝐫𝐨𝐫: ${error.message}\n${line}`, statusMsg.messageID, threadID);
            setTimeout(() => api.unsendMessage(statusMsg.messageID), 5000);
        }
    }
};
