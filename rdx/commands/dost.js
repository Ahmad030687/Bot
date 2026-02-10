const Canvas = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "dost",
    version: "6.0.0",
    hasPermssion: 0,
    credits: "Ahmad RDX",
    description: "Royal Frame (Fits Perfectly)",
    commandCategory: "img",
    usages: "[mention or reply]",
    cooldowns: 5,
    aliases: ["bff", "dosti"]
};

module.exports.run = async function ({ api, event }) {
    const { threadID, messageID, senderID } = event;
    let targetID;

    // --- TARGET LOGIC ---
    if (event.type == "message_reply") {
        targetID = event.messageReply.senderID || event.messageReply.author;
    } else if (Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
    } else {
        return api.sendMessage("❌ Kisi dost ko Mention karo ya Reply karo!", threadID, messageID);
    }

    if (targetID === senderID) return api.sendMessage("❌ Khud par try mat karo!", threadID, messageID);

    api.setMessageReaction("💖", messageID, () => {}, true);
    api.sendMessage("✨ **Designing Royal Frame...**", threadID, messageID);

    try {
        // --- 1. LOAD FRAME FIRST (To get size) ---
        // Yahan wo link dalein jo aapne upload kiya (Postimg wala link best hai)
        const frameImageUrl = "https://i.postimg.cc/8PZkmmJG/1770355527236.png"; 
        const frame = await Canvas.loadImage(frameImageUrl);
        
        // Canvas size same as frame
        const canvas = Canvas.createCanvas(frame.width, frame.height);
        const ctx = canvas.getContext("2d");

        // --- 2. LOAD AVATARS ---
        const avatar1 = await Canvas.loadImage(`https://graph.facebook.com/${senderID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
        const avatar2 = await Canvas.loadImage(`https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);

        // --- 3. DRAW AVATARS (BEHIND THE FRAME) ---
        // Yeh coordinates maine andazan set kiye hain frame ke hisaab se.
        // Agar pic thori idhar udhar ho to X aur Y change karein.

        // LEFT GOLD FRAME (Sender)
        // x=165, y=200, width=285, height=390
        ctx.drawImage(avatar1, 165, 200, 285, 390);

        // RIGHT SILVER FRAME (Target)
        // x=665, y=200, width=285, height=390
        ctx.drawImage(avatar2, 665, 200, 285, 390);

        // --- 4. DRAW FRAME ON TOP (Covering edges) ---
        ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);

        // --- 5. SAVE & SEND ---
        const filePath = path.join(__dirname, "cache", `friend_royal_${senderID}.png`);
        fs.writeFileSync(filePath, canvas.toBuffer());

        api.sendMessage({
            body: `💖 **SIDE-BY-SIDE ON THE JOURNEY**`,
            attachment: fs.createReadStream(filePath)
        }, threadID, () => fs.unlinkSync(filePath), messageID);

    } catch (e) {
        api.sendMessage(`❌ Error: ${e.message}`, threadID, messageID);
    }
};
