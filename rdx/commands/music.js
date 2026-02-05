const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
    name: "music",
    version: "2.5.0",
    credits: "Ahmad RDX",
    description: "Search and Download Audio/Video via Private API",
    commandCategory: "Media Hub",
    usages: "[name-audio] or [name-video]",
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

    api.sendMessage(`📡 **Ahmad RDX Engine:** Fetching Direct Link for "${query.trim()}"...`, threadID, messageID);

    try {
        // 1. Pehle Search karein (JSON output)
        const searchRes = await axios.get(`https://yt-api-7mfm.onrender.com/yt-search?q=${encodeURIComponent(query)}`);
        const video = searchRes.data.results.find(res => res.url.includes('watch?v='));

        if (!video) return api.sendMessage("❌ Video not found!", threadID, messageID);

        // 2. Ab Download Link nikaalein (Ye JSON dega)
        const dlRes = await axios.get(`https://yt-api-7mfm.onrender.com/yt-dl?url=${encodeURIComponent(video.url)}&type=${type}`);
        
        // Ahmad bhai, yahan hum JSON se link nikaal rahay hain
        const directFileUrl = dlRes.data.download_url;

        if (!directFileUrl) throw new Error("Could not extract direct link");

        // 3. File setup
        const ext = type === 'audio' ? 'mp3' : 'mp4';
        const fileName = `${Date.now()}.${ext}`;
        const filePath = path.join(__dirname, 'cache', fileName);

        if (!fs.existsSync(path.join(__dirname, 'cache'))) fs.mkdirSync(path.join(__dirname, 'cache'));

        api.sendMessage(`📥 **Downloading ${type.toUpperCase()}...** Please wait.`, threadID, messageID);

        // 4. Asli File Download Logic (Link to File)
        const fileStream = await axios({
            method: 'get',
            url: directFileUrl,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(filePath);
        fileStream.data.pipe(writer);

        writer.on('finish', () => {
            // 5. Group mein file bhejna
            api.sendMessage({
                body: `🦅 **AHMAD RDX MEDIA DELIVERY**\n━━━━━━━━━━━━━━\n🎬 **Title:** ${video.title}\n📁 **Format:** ${type.toUpperCase()}\n━━━━━━━━━━━━━━\n*Aura: Media King ⚡*`,
                attachment: fs.createReadStream(filePath)
            }, threadID, () => fs.unlinkSync(filePath), messageID); // File bhejne ke baad delete
        });

        writer.on('error', (err) => {
            api.sendMessage("❌ Download failed during streaming!", threadID, messageID);
        });

    } catch (e) {
        console.error(e);
        api.sendMessage("❌ **Critical Error:** API returned JSON but file streaming failed. Server might be overloaded.", threadID, messageID);
    }
};
