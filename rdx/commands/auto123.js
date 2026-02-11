const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "auto",
    version: "3.5.0",
    hasPermssion: 0,
    credits: "Ahmad RDX",
    description: "Premium Video Downloader with Real Animation",
    commandCategory: "media",
    usages: "[link]",
    cooldowns: 5,
    aliases: ["fb", "insta", "tiktok", "dl", "video"]
};

// --- RDX ANIMATION ENGINE ---
async function animateLoading(api, threadID, messageID) {
    const states = [
        { bar: "[▒▒▒▒▒▒▒▒▒▒]", pct: "10%", status: "🔎 SEARCHING URL..." },
        { bar: "[██▒▒▒▒▒▒▒▒]", pct: "30%", status: "📡 ESTABLISHING CONNECTION..." },
        { bar: "[████▒▒▒▒▒▒]", pct: "50%", status: "🔓 VIDEO FIND..." },
        { bar: "[██████▒▒▒▒]", pct: "70%", status: "📥 EXTRACTING VIDEO DATA..." },
        { bar: "[████████▒▒]", pct: "90%", status: "💾 SAVING TO SERVER..." },
        { bar: "[██████████]", pct: "100%", status: "✅ SENDING TO CHAT..." }
    ];

    for (let state of states) {
        await new Promise(resolve => setTimeout(resolve, 1200)); // 1.2 Second delay for realism
        await api.editMessage(
            `🚀 **RDX DOWNLOADER**\n\n` +
            `▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n` +
            `${state.bar} **${state.pct}**\n` +
            `📂 Status: ${state.status}\n` +
            `▬▬▬▬▬▬▬▬▬▬▬▬▬▬`,
            messageID
        );
    }
}

// --- UNIVERSAL SCRAPER LOGIC (Smart Switch) ---
async function getLink(url) {
    try {
        // Method 1: Primary Heavy Scraper (TikTok/FB/Insta Friendly)
        const { data } = await axios.post("https://co.wuk.sh/api/json", {
            url: url,
            vQuality: "720",
            filenamePattern: "basic"
        }, {
            headers: { "Accept": "application/json", "Content-Type": "application/json" }
        });
        if (data && data.url) return { url: data.url, type: "video" };

        // Method 2: Backup Scraper (Agar pehla fail ho)
        const backup = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${url}`);
        if (backup.data && backup.data.video && backup.data.video.url) return { url: backup.data.video.url, type: "video" };

        return null;
    } catch (e) {
        return null;
    }
}

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const link = args.join(" ");

    if (!link) return api.sendMessage("❌ احمد بھائی، لنک تو دیں! (FB, Insta, TikTok, YT)", threadID, messageID);

    // 1. Start Initial Message
    const initialMsg = await api.sendMessage(`🚀 **RDX SYSTEM STARTING...**`, threadID);
    const animMessageID = initialMsg.messageID;

    try {
        // 2. Start Animation (Background mein chalega)
        const animationPromise = animateLoading(api, threadID, animMessageID);
        
        // 3. Start Scraping (Real work)
        const scraperPromise = getLink(link);

        // Dono ko parallel chalayenge lekin wait karenge result ka
        const [_, result] = await Promise.all([animationPromise, scraperPromise]);

        if (!result || !result.url) {
            return api.editMessage("❌ **FAILED:** لنک پرائیویٹ ہے یا سکریپر ایکسپائر ہو گیا ہے۔", animMessageID);
        }

        // 4. Video Download
        const filePath = path.join(__dirname, "cache", `rdx_vid_${Date.now()}.mp4`);
        const writer = fs.createWriteStream(filePath);
        
        const videoResponse = await axios({
            url: result.url,
            method: 'GET',
            responseType: 'stream'
        });

        videoResponse.data.pipe(writer);

        writer.on('finish', () => {
            // 5. Send Final Video
            api.unsendMessage(animMessageID); // Loading message delete
            
            api.sendMessage({
                body: `✅ **Download Complete!**\n🎥 Source: Universal Scraper`,
                attachment: fs.createReadStream(filePath)
            }, threadID, () => fs.unlinkSync(filePath), messageID);
        });

        writer.on('error', (err) => {
            api.editMessage("❌ ویڈیو ڈاؤنلوڈ کرتے وقت ایرر آ گیا۔", animMessageID);
        });

    } catch (e) {
        console.error(e);
        api.editMessage("❌ سسٹم کریش! دوبارہ کوشش کریں۔", animMessageID);
    }
};
