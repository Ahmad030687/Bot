const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const yts = require("yt-search");

module.exports.config = {
    name: "music",
    version: "20.0.0",
    hasPermssion: 0,
    credits: "AHMAD RDX",
    description: "Ultra Fast YouTube Audio/Video Downloader",
    commandCategory: "media",
    usages: "[song name] [audio/video]",
    cooldowns: 2
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    // 1. INPUT HANDLING (Fast Detection)
    let lastArg = args[args.length - 1]?.toLowerCase();
    let isVideo = ["video", "mp4", "watch"].includes(lastArg);
    let isAudio = ["audio", "mp3", "song"].includes(lastArg);
    
    let type = isVideo ? "mp4" : "mp3"; 
    if (isAudio || isVideo) args.pop(); 

    const query = args.join(" ");
    if (!query) return api.sendMessage("⚠️ Ustad ji, gane ka naam likhein!\nExample: #music Sadqay audio", threadID, messageID);

    const rdx_header = "🦅 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐒𝐘𝐒𝐓𝐄𝐌 🦅";
    const line = "━━━━━━━━━━━━━━━━━━";

    let statusMsg = await api.sendMessage(`${rdx_header}\n${line}\n🔍 𝐒𝐞𝐚𝐫𝐜𝐡𝐢𝐧𝐠... 🚀\n${line}`, threadID);

    try {
        // 2. FAST SEARCH
        const search = await yts(query);
        const video = search.videos[0];
        if (!video) throw new Error("Gana nahi mila!");

        await api.editMessage(`${rdx_header}\n${line}\n⚡ 𝐅𝐞𝐭𝐜𝐡𝐢𝐧𝐠: ${video.title.substring(0, 25)}...\n📥 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐢𝐧𝐠...`, statusMsg.messageID, threadID);

        // 3. HIGH SPEED API (No GitHub latency)
        // Using Ryzen API for YouTube (Fast & Stable)
        const apiRes = await axios.get(`https://api.ryzendesu.vip/api/downloader/ytdl?url=${encodeURIComponent(video.url)}`);
        
        let downloadUrl = "";
        if (type === "mp4") {
            downloadUrl = apiRes.data.data?.video || apiRes.data.video;
        } else {
            downloadUrl = apiRes.data.data?.audio || apiRes.data.audio;
        }

        if (!downloadUrl) throw new Error("Download link nahi mila.");

        // 4. STREAM DOWNLOAD (Direct Pipe for Max Speed)
        const cacheDir = path.join(__dirname, "cache");
        await fs.ensureDir(cacheDir);
        const filePath = path.join(cacheDir, `rdx_${Date.now()}.${type}`);

        const response = await axios({
            method: 'GET',
            url: downloadUrl,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        writer.on('finish', async () => {
            const stats = fs.statSync(filePath);
            const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

            if (sizeMB > 48) {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                return api.editMessage(`⚠️ File (${sizeMB}MB) Messenger limit se bari hai.`, statusMsg.messageID, threadID);
            }

            await api.sendMessage({
                body: `${rdx_header}\n${line}\n✅ 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐂𝐨𝐦𝐩𝐥𝐞𝐭𝐞!\n🎵 **Title:** ${video.title}\n📦 **Size:** ${sizeMB} MB\n${line}\n🔥 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗`,
                attachment: fs.createReadStream(filePath)
            }, threadID, () => {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                api.unsendMessage(statusMsg.messageID);
            }, messageID);
        });

    } catch (error) {
        api.editMessage(`❌ ${rdx_header}\n${line}\n𝐄𝐫𝐫𝐨𝐫: ${error.message}\n${line}`, statusMsg.messageID, threadID);
    }
};
