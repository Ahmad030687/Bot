const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "tiktok",
    version: "10.0.0", // No-Key Edition
    hasPermssion: 0,
    credits: "Ahmad Ali Safdar",
    description: "Premium TikTok Downloader (No RapidAPI)",
    commandCategory: "media",
    usages: "[video_link]",
    cooldowns: 5
};

// --- RDX ANIMATION SYSTEM ---
const progressBar = (percentage) => {
    const filled = Math.round(percentage / 10);
    const empty = 10 - filled;
    return `[${'█'.repeat(filled)}${'▒'.repeat(empty)}] ${percentage}%`;
};

const frames = [
    "⠋ Connecting to TikTok Server...",
    "⠙ Bypassing Watermark...",
    "⠹ Extracting HD Video...",
    "⠸ Finalizing Stream...",
    "✅ Uploading..."
];

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const link = args.join(" ");

    if (!link) return api.sendMessage("❌ **RDX TIKTOK:** Link to dein Ahmad bhai!", threadID, messageID);

    // 1. Initial Loading
    let loadingMsg = await api.sendMessage(`🎵 **RDX TIKTOK ENGINE**\n\n${progressBar(0)}\nStatus: Request Received...`, threadID);

    try {
        // --- ANIMATION STEP 1 (20%) ---
        await new Promise(r => setTimeout(r, 800));
        await api.editMessage(`🎵 **RDX TIKTOK ENGINE**\n\n${progressBar(20)}\nStatus: ${frames[0]}`, loadingMsg.messageID);

        // 2. SCRAPER LOGIC (Direct TikWM - No RapidAPI)
        // Ye API free hai, unlimited hai aur HD deti hai
        const response = await axios.post("https://www.tikwm.com/api/", {
            url: link,
            hd: 1 // HD Quality Request
        });

        const data = response.data.data;

        if (!data || !data.play) {
            return api.editMessage("❌ **ERROR:** Video nahi mili ya Link Private hai.", loadingMsg.messageID);
        }

        // --- ANIMATION STEP 2 (50%) ---
        await api.editMessage(`🎵 **RDX TIKTOK ENGINE**\n\n${progressBar(50)}\nStatus: ${frames[1]}`, loadingMsg.messageID);
        
        const videoUrl = data.play; // No Watermark Video
        const title = data.title || "TikTok Video";
        const author = data.author ? data.author.nickname : "Unknown";
        const music = data.music_info ? data.music_info.title : "Original Sound";

        // --- ANIMATION STEP 3 (Download) ---
        await api.editMessage(`🎵 **RDX TIKTOK ENGINE**\n\n${progressBar(80)}\nStatus: ${frames[2]}`, loadingMsg.messageID);

        const cacheDir = path.join(__dirname, "cache");
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
        const filePath = path.join(cacheDir, `tiktok_${Date.now()}.mp4`);

        const videoStream = await axios({
            method: 'GET',
            url: videoUrl,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(filePath);
        videoStream.data.pipe(writer);

        writer.on('finish', async () => {
            // --- FINAL ANIMATION (100%) ---
            await api.editMessage(`🎵 **RDX TIKTOK ENGINE**\n\n${progressBar(100)}\nStatus: ${frames[4]}`, loadingMsg.messageID);
            await new Promise(r => setTimeout(r, 1000));
            
            api.unsendMessage(loadingMsg.messageID);

            // Send Video
            api.sendMessage({
                body: `🦅 **AHMAD RDX TIKTOK**\n\n👤 **Author:** ${author}\n📝 **Title:** ${title}\n🎵 **Music:** ${music}`,
                attachment: fs.createReadStream(filePath)
            }, threadID, () => fs.unlinkSync(filePath), messageID);
        });

        writer.on('error', (err) => {
            api.editMessage(`❌ Download Error: ${err.message}`, loadingMsg.messageID);
        });

    } catch (error) {
        console.error(error);
        api.editMessage(`❌ **SYSTEM ERROR:** Link check karein.`, loadingMsg.messageID);
    }
};
