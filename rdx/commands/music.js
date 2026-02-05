const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
    name: "music",
    version: "4.0.0",
    credits: "Ahmad RDX",
    description: "Smart YouTube Downloader",
    commandCategory: "Media Hub",
    usages: "[name-audio/video]",
    cooldowns: 10
};

module.exports.run = async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const input = args.join(" ");

    if (!input.includes("-")) {
        return api.sendMessage("⚠️ **Format:** #music [naam]-[audio/video]\nExample: #music sidhu just listen-audio", threadID, messageID);
    }

    let [query, format] = input.split("-");
    const type = format.trim().toLowerCase() === 'video' ? 'video' : 'audio';
    
    // Ahmad Bhai: Yahan hum query ko thora "Heavy" kar rahe hain taake asli gaana aaye
    let finalQuery = query.trim();
    if (!finalQuery.toLowerCase().includes("official")) {
        finalQuery += " official video"; 
    }

    api.sendMessage(`📡 **Ahmad RDX Intelligence:** Searching for "${finalQuery}"... 🛰️`, threadID, messageID);

    try {
        const searchRes = await axios.get(`https://yt-api-7mfm.onrender.com/yt-search?q=${encodeURIComponent(finalQuery)}`);
        
        // --- SMART FILTER ---
        // Hum un videos ko skip karenge jo 1 ghantay se bari hain (Frequency type videos)
        // Aur pehla sahi result pakrenge
        const results = searchRes.data.results;
        let video = results.find(res => !res.title.toLowerCase().includes("frequency") && !res.title.toLowerCase().includes("hz"));
        
        // Agar filter se kuch na mile toh normal result
        if (!video) video = results[0];

        if (!video || !video.url) return api.sendMessage("❌ No valid video found!", threadID, messageID);

        api.sendMessage(`📥 **Processing:** ${video.title}\nPlease wait... ⏳`, threadID, messageID);

        const dlRes = await axios.get(`https://yt-api-7mfm.onrender.com/yt-dl?url=${encodeURIComponent(video.url)}&type=${type}`);
        
        if (!dlRes.data.status) throw new Error("API Limit");

        const directLink = dlRes.data.download_url;
        const ext = type === 'audio' ? 'mp3' : 'mp4';
        const filePath = path.join(__dirname, 'cache', `${Date.now()}.${ext}`);

        if (!fs.existsSync(path.join(__dirname, 'cache'))) fs.mkdirSync(path.join(__dirname, 'cache'));

        const response = await axios({ method: 'get', url: directLink, responseType: 'stream' });
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        writer.on('finish', () => {
            const stats = fs.statSync(filePath);
            if (stats.size > 26214400) { // 25MB check
                fs.unlinkSync(filePath);
                return api.sendMessage("⚠️ **File Size Alert:** Ye gaana 25MB se bara hai, is liye nahi bhej sakta.", threadID, messageID);
            }

            api.sendMessage({
                body: `🦅 **AHMAD RDX MEDIA DELIVERY**\n━━━━━━━━━━━━━━\n🎬 **Title:** ${video.title}\n📁 **Type:** ${type.toUpperCase()}\n━━━━━━━━━━━━━━`,
                attachment: fs.createReadStream(filePath)
            }, threadID, () => fs.unlinkSync(filePath), messageID);
        });

    } catch (e) {
        api.sendMessage("❌ **Meta Error:** Video restricted or server timeout. Try another keyword.", threadID, messageID);
    }
};
