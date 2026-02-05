const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
    name: "music",
    version: "1.0.0",
    credits: "Ahmad RDX",
    description: "Download Audio/Video from YouTube (e.g. .music kalam-audio)",
    commandCategory: "Media Hub",
    usages: "[name-audio] or [name-video]",
    cooldowns: 10
};

module.exports.run = async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const input = args.join(" ");

    if (!input || !input.includes("-")) {
        return api.sendMessage("⚠️ **Ahmad Systems:** Format galat hai!\nUsage: .music [name]-[audio/video]\nExample: .music barota-audio", threadID, messageID);
    }

    const [query, format] = input.split("-");
    const type = format.trim().toLowerCase();

    api.sendMessage(`🛰️ **Ahmad RDX Engine:** Searching & Converting "${query.trim()}" to ${type}... ⚡`, threadID, messageID);

    try {
        // 1. Search using YOUR Render API
        const searchRes = await axios.get(`https://yt-api-7mfm.onrender.com/yt-search?q=${encodeURIComponent(query)}`);
        const video = searchRes.data.results[1]; // Taking the first video result

        if (!video) return api.sendMessage("❌ No results found!", threadID, messageID);

        const videoUrl = video.url;
        const title = video.title;

        // 2. Download Logic using a High-Speed External API (to keep Render light)
        // Hum aik reliable downloader use karenge jo direct link deta hai
        const dlApi = `https://api.dandoc.me/api/ytdl?url=${encodeURIComponent(videoUrl)}&type=${type === 'audio' ? 'mp3' : 'mp4'}`;
        const dlRes = await axios.get(dlApi);
        const downloadUrl = dlRes.data.url;

        if (!downloadUrl) throw new Error("Link extraction failed");

        // 3. File path settings
        const ext = type === 'audio' ? 'mp3' : 'mp4';
        const filePath = path.join(__dirname, 'cache', `music_${Date.now()}.${ext}`);
        
        // 4. Downloading the file to bot server
        const response = await axios({
            method: 'get',
            url: downloadUrl,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        writer.on('finish', () => {
            api.sendMessage({
                body: `🦅 **AHMAD RDX DOWNLOADER**\n━━━━━━━━━━━━━━━━━━\n🎬 **TITLE:** ${title}\n📁 **FORMAT:** ${type.toUpperCase()}\n━━━━━━━━━━━━━━━━━━\n*Aura: Media Specialist ⚡*`,
                attachment: fs.createReadStream(filePath)
            }, threadID, () => fs.unlinkSync(filePath), messageID);
        });

        writer.on('error', (err) => {
            console.error(err);
            api.sendMessage("❌ Error while writing file!", threadID, messageID);
        });

    } catch (e) {
        console.error(e);
        api.sendMessage("❌ **Critical Error:** System overloaded or YouTube blocked the request. Try again later.", threadID, messageID);
    }
};
