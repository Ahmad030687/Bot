const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
    name: "music",
    version: "3.5.0",
    credits: "Ahmad RDX",
    description: "Download Audio/Video from YouTube",
    commandCategory: "Media Hub",
    usages: "[name-audio/video]",
    cooldowns: 15
};

module.exports.run = async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const input = args.join(" ");

    if (!input.includes("-")) {
        return api.sendMessage("⚠️ **Format:** #music [naam]-[audio/video]\nExample: #music legend-audio", threadID, messageID);
    }

    const [query, format] = input.split("-");
    const type = format.trim().toLowerCase() === 'video' ? 'video' : 'audio';

    api.sendMessage(`📡 **Ahmad RDX Engine:** Searching for "${query.trim()}"...`, threadID, messageID);

    try {
        // 1. SEARCH: Apki working API se data nikalna
        const searchRes = await axios.get(`https://yt-api-7mfm.onrender.com/yt-search?q=${encodeURIComponent(query)}`);
        
        // Aapke JSON ke mutabiq pehla result (results[0]) uthana
        const video = searchRes.data.results[0];

        if (!video || !video.url) {
            return api.sendMessage("❌ **Error:** No video found!", threadID, messageID);
        }

        api.sendMessage(`📥 **Processing ${type.toUpperCase()}:** ${video.title}\nPlease wait... ⏳`, threadID, messageID);

        // 2. DOWNLOAD: Apki Render API ke /yt-dl route ko call karna
        const dlUrl = `https://yt-api-7mfm.onrender.com/yt-dl?url=${encodeURIComponent(video.url)}&type=${type}`;
        const dlRes = await axios.get(dlUrl);

        if (!dlRes.data.status || !dlRes.data.download_url) {
            return api.sendMessage("❌ **Meta Error:** Could not extract download link. Video might be too long or restricted.", threadID, messageID);
        }

        const directLink = dlRes.data.download_url;

        // 3. FILE SYSTEM
        const ext = type === 'audio' ? 'mp3' : 'mp4';
        const filePath = path.join(__dirname, 'cache', `${Date.now()}.${ext}`);
        
        if (!fs.existsSync(path.join(__dirname, 'cache'))) fs.mkdirSync(path.join(__dirname, 'cache'));

        // 4. DOWNLOADING TO BOT SERVER
        const response = await axios({
            method: 'get',
            url: directLink,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        writer.on('finish', () => {
            // Check file size (Messenger limit: 25MB)
            const stats = fs.statSync(filePath);
            const fileSizeInMB = stats.size / (1024 * 1024);

            if (fileSizeInMB > 25) {
                fs.unlinkSync(filePath);
                return api.sendMessage("⚠️ **File Too Large:** Result is over 25MB. Try a shorter version or audio format.", threadID, messageID);
            }

            api.sendMessage({
                body: `🦅 **AHMAD RDX DOWNLOADER**\n━━━━━━━━━━━━━━\n🎬 **Title:** ${video.title}\n📁 **Type:** ${type.toUpperCase()}\n━━━━━━━━━━━━━━`,
                attachment: fs.createReadStream(filePath)
            }, threadID, () => {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }, messageID);
        });

    } catch (e) {
        console.error(e);
        api.sendMessage("❌ **Critical Failure:** Server is busy or API connection lost.", threadID, messageID);
    }
};
