const Canvas = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "dost",
    version: "3.0.0",
    hasPermssion: 0,
    credits: "Ahmad RDX",
    description: "Best Friends Frame (Error Free)",
    commandCategory: "img",
    usages: "[mention or reply]",
    cooldowns: 5,
    aliases: ["bff", "dosti"]
};

// --- CIRCLE IMAGE FUNCTION ---
function drawCircle(ctx, image, x, y, size) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(image, x, y, size, size);
    ctx.restore();
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
    ctx.lineWidth = 15;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
}

module.exports.run = async function ({ api, event }) {
    // args ko hata diya hai taake slice error na aye
    const { threadID, messageID, senderID } = event;

    let targetID;

    // --- TARGET DETECTION (Reply ko Pehle Check Karega) ---
    if (event.type == "message_reply") {
        targetID = event.messageReply.senderID;
    } 
    else if (Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
    } 
    else {
        return api.sendMessage("❌ Bhai kisi dost ke message par Reply karo, ya use Mention karo!", threadID, messageID);
    }

    if (targetID === senderID) return api.sendMessage("❌ Apne sath dosti? Kisi aur ko tag karo!", threadID, messageID);

    api.setMessageReaction("💖", messageID, () => {}, true);
    api.sendMessage("✨ **Designing Frame...**", threadID, messageID);

    try {
        const width = 1200;
        const height = 675;
        const canvas = Canvas.createCanvas(width, height);
        const ctx = canvas.getContext("2d");

        // Background
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, "#FF9A9E");
        gradient.addColorStop(1, "#A18CD1");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Box
        ctx.strokeStyle = "white";
        ctx.lineWidth = 10;
        ctx.strokeRect(50, 50, width - 100, height - 100);

        // Images Load
        const avatar1 = await Canvas.loadImage(`https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
        const avatar2 = await Canvas.loadImage(`https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
        const heart = await Canvas.loadImage("https://i.imgur.com/g8vK3fP.png");

        // Draw
        drawCircle(ctx, avatar1, 100, 150, 350);
        drawCircle(ctx, avatar2, 750, 150, 350);
        ctx.drawImage(heart, 525, 250, 150, 150);

        // Text
        ctx.font = "bold 90px Sans";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText("BEST FRIENDS", width / 2, 120);

        const filePath = path.join(__dirname, "cache", `friend_${senderID}.png`);
        fs.writeFileSync(filePath, canvas.toBuffer());

        api.sendMessage({
            body: `💖 **FRIENDSHIP GOALS**`,
            attachment: fs.createReadStream(filePath)
        }, threadID, () => fs.unlinkSync(filePath), messageID);

    } catch (e) {
        api.sendMessage(`❌ Error: ${e.message}`, threadID, messageID);
    }
};
