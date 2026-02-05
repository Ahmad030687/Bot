const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
    name: "music",
    version: "3.0.0",
    credits: "Ahmad RDX",
    description: "Download Audio/Video from YouTube (e.g. #music sidhu-audio)",
    commandCategory: "Media Hub",
    usages: "[name-audio] or [name-video]",
    cooldowns: 15
};

module.exports.run = async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const input = args.join(" ");

    // Validation
    if (!input.includes("-")) {
        return api.sendMessage("⚠️ **Format:** #music [naam]-[audio/video]\nExample: #music legend-audio", threadID, messageID);
    }

    const [query, format] = input.split("-");
    const type = format.trim().toLowerCase() === 'video' ? 'video' : 'audio';

    api.sendMessage(`📡 **Ahmad RDX Intelligence:** Searching for "${query.trim()}"... 🛰️`, threadID, messageID);

    try {
        // 1. Search Logic (Using your working Render API)
        const searchRes = await axios.get(`https://yt-api-7mfm.onrender.com/yt-search?q=${encodeURIComponent(query)}`);
        
        // Pehla result aksar channel hota hai, isliye hum valid video URL dhoondenge
        const video = searchRes.data.results.find(res => res.url.includes('watch?v='));

        if (!video) return api.sendMessage("❌ **Error:** No video found for this query.", threadID, messageID);

        api.sendMessage(`📥 **Processing ${type.toUpperCase()}:** ${video.title}\nPlease wait... ⏳`, threadID, messageID);

        // 2. Download Link Extraction (Calls the /yt-dl route on your Render)
        const dlUrl = `https://yt-api-7mfm.onrender.com/yt-dl?url=${encodeURIComponent(video.url)}&type=${type}`;
        const dlRes = await axios.get(dlUrl);

        if (!dlRes.data.status || !dlRes.data.download_url) {
            return api.sendMessage("❌ **Meta Error:** Could not extract download link. Check Render logs.", threadID, messageID);
        }

        const directFileUrl = dlRes.data.download_url;

        // 3. File Setup
        const ext = type === 'audio' ? 'mp3' : 'mp4';
        const filePath = path.join(__dirname, 'cache', `${Date.now()}.${ext}`);
        
        // Ensure cache folder exists
        if (!fs.existsSync(path.join(__dirname, 'cache'))) fs.mkdirSync(path.join(__dirname, 'cache'));

        // 4. Stream and Save File
        const response = await axios({
            method: 'get',
            url: directFileUrl,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        writer.on('finish', () => {
            // 5. Send to Messenger
            api.sendMessage({
                body: `🦅 **AHMAD RDX MEDIA HUB**\n━━━━━━━━━━━━━━━\n🎬 **Title:** ${video.title}\n📁 **Type:** ${type.toUpperCase()}\n━━━━━━━━━━━━━━━\n*Aura: High Speed Delivery ⚡*`,
                attachment: fs.createReadStream(filePath)
            }, threadID, () => {
                // File bhejne ke baad delete karna zaroori hai
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }, messageID);
        });

        writer.on('error', (err) => {
            throw err;
        });

    } catch (e) {
        console.error(e);
        api.sendMessage("❌ **Critical Failure:** Server is overloaded or the file is too large for Render's free tier.", threadID, messageID);
    }
};
