const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: 'autoDownload',
        eventType: 'message',
        version: '6.0.0',
        credits: 'AHMAD RDX',
        description: 'Fixed JSON Path for Facebook Reels'
    },

    async run({ api, event }) {
        const { threadID, body, messageID, senderID } = event;
        if (!body) return;

        const botID = api.getCurrentUserID();
        if (senderID === botID) return;

        const socialRegex = /https?:\/\/(?:www\.|m\.|web\.|v\.|fb\.)?(?:facebook\.com|fb\.watch|instagram\.com|tiktok\.com|reels|reel|share|fb\.gg)\/\S+/ig;
        const matches = body.match(socialRegex);
        if (!matches) return;

        const videoUrl = matches[0];
        const rdx_header = "🦅 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐒𝐘𝐒𝐓𝐄𝐌 🦅";
        const line = "━━━━━━━━━━━━━━━━━━";
        
        const frames = [
            " [▒▒▒▒▒▒▒▒▒▒] 10%",
            " [██▒▒▒▒▒▒▒▒] 35%",
            " [█████▒▒▒▒▒] 60%",
            " [████████▒▒] 85%",
            " [██████████] 100%"
        ];

        let statusMsg;
        try {
            statusMsg = await api.sendMessage(`${rdx_header}\n${line}\n🔍 𝐋𝐢𝐧𝐤 𝐃𝐞𝐭𝐞𝐜𝐭𝐞𝐝...\n${frames[0]}\n${line}`, threadID);
        } catch (e) { return; }

        const cacheDir = path.join(__dirname, "../commands/cache");

        try {
            await api.editMessage(`${rdx_header}\n${line}\n⚡ 𝐑𝐃𝐗 𝐄𝐧𝐠𝐢𝐧𝐞 𝐅𝐞𝐭𝐜𝐡𝐢𝐧𝐠...\n${frames[1]}\n${line}`, statusMsg.messageID, threadID);

            // 🚀 KOJA API CALL
            const res = await axios.get(`https://kojaxd-api.vercel.app/downloader/aiodl?url=${encodeURIComponent(videoUrl)}&apikey=Koja`);
            
            // --- 🛠️ FIXED LINK EXTRACTION LOGIC ---
            const result = res.data.result;
            let finalUrl = null;

            if (result && result.links) {
                // Pehle HD check karein, phir SD, phir array style agar ho
                if (result.links.video) {
                    finalUrl = result.links.video.hd?.url || 
                               result.links.video.sd?.url || 
                               (Array.isArray(result.links.video) ? result.links.video[0]?.url : null);
                }
            }
            
            // Agar upar wala fail ho to direct URL check karein
            if (!finalUrl) finalUrl = result?.url || res.data.url;

            if (!finalUrl) throw new Error("Video path not matched in API response.");

            await api.editMessage(`${rdx_header}\n${line}\n📥 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐢𝐧𝐠 𝐌𝐞𝐝𝐢𝐚...\n${frames[2]}\n${line}`, statusMsg.messageID, threadID);

            const fileRes = await axios({
                method: 'GET',
                url: finalUrl,
                responseType: 'arraybuffer',
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });

            await api.editMessage(`${rdx_header}\n${line}\n⚙️ 𝐏𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠 𝐅𝐢𝐥𝐞...\n${frames[3]}\n${line}`, statusMsg.messageID, threadID);

            await fs.ensureDir(cacheDir);
            const filePath = path.join(cacheDir, `rdx_${Date.now()}.mp4`);
            fs.writeFileSync(filePath, Buffer.from(fileRes.data));

            const stats = fs.statSync(filePath);
            const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

            await api.editMessage(`${rdx_header}\n${line}\n📤 𝐔𝐩𝐥𝐨𝐚𝐝𝐢𝐧𝐠 𝐭𝐨 𝐂𝐡𝐚𝐭...\n${frames[4]}\n${line}`, statusMsg.messageID, threadID);

            await api.sendMessage({
                body: `${rdx_header}\n${line}\n✅ 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐂𝐨𝐦𝐩𝐥𝐞𝐭𝐞!\n📦 𝐒𝐢𝐳𝐞: ${sizeMB} MB\n✨ 𝐒𝐭𝐚𝐭𝐮𝐬: Success\n${line}\n🔥 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗`,
                attachment: fs.createReadStream(filePath)
            }, threadID, () => {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                api.unsendMessage(statusMsg.messageID);
            });

        } catch (error) {
            console.log("RDX Error:", error.message);
            api.editMessage(`❌ ${rdx_header}\n${line}\n𝐄𝐫𝐫𝐨𝐫: ${error.message}\n💡 𝐓𝐢𝐩: Try a different video link!\n${line}`, statusMsg.messageID, threadID);
            setTimeout(() => api.unsendMessage(statusMsg.messageID), 5000);
        }
    }
};
