const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "auto",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "Ahmad RDX",
    description: "Universal Downloader (FB, Insta, TikTok, YT)",
    commandCategory: "media",
    usages: "[link]",
    cooldowns: 5,
    aliases: ["fb", "insta", "tiktok", "dl"]
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const link = args.join(" ");

    if (!link) return api.sendMessage("❌ احمد بھائی، لنک تو دیں! (FB, Insta, TikTok)", threadID, messageID);

    // 1. Animation Frames
    const frames = [
        "📥 Video Find... 10%",
        "📥 Processing... 25%",
        "📥 Detected... 50%",
        "📥 Downloading... 75%",
        "📥 Completed... 100%"
    ];

    // 2. Initial Message bhejna
    let infoMsg = await api.sendMessage(frames[0], threadID);

    try {
        // --- ANIMATION LOOP (Fake Loading to look cool) ---
        for (let i = 1; i < frames.length - 1; i++) {
            await new Promise(resolve => setTimeout(resolve, 800)); // 0.8 second delay
            await api.editMessage(frames[i], infoMsg.messageID);
        }

        // 3. API Call (Cobalt Universal Engine)
        // Ye API kabhi expire nahi hoti kyunke ye open-source heavy engine hai
        const headers = {
            "Accept": "application/json",
            "Content-Type": "application/json"
        };
        
        const res = await axios.post("https://co.wuk.sh/api/json", { 
            url: link,
            vQuality: "720",
            filenamePattern: "basic"
        }, { headers });

        if (!res.data || !res.data.url) {
            return api.editMessage("❌ ویڈیو نہیں ملی! لنک پرائیویٹ ہو سکتا ہے۔", infoMsg.messageID);
        }

        const videoUrl = res.data.url;

        // 4. Video Download karna
        await api.editMessage(frames[3], infoMsg.messageID); // "Downloading... 75%"

        const filePath = path.join(__dirname, "cache", `video_${Date.now()}.mp4`);
        const writer = fs.createWriteStream(filePath);
        const response = await axios({
            url: videoUrl,
            method: 'GET',
            responseType: 'stream'
        });

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', async () => {
                // 5. Completed & Send
                await api.editMessage(frames[4], infoMsg.messageID); // "Completed... 100%"
                await new Promise(resolve => setTimeout(resolve, 1000)); // Thora wait taake user 100% dekh sake
                
                // Loading message delete kar ke video bhejna
                api.unsendMessage(infoMsg.messageID);

                api.sendMessage({
                    body: `✅ **Download Successful!**\n🎥 Quality: High (RDX Server)`,
                    attachment: fs.createReadStream(filePath)
                }, threadID, () => fs.unlinkSync(filePath), messageID);
                
                resolve();
            });
            writer.on('error', reject);
        });

    } catch (e) {
        console.error(e);
        api.editMessage("❌ یہ لنک ایکسپائر ہے یا سرور بزی ہے۔", infoMsg.messageID);
    }
};
