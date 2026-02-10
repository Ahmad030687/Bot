const Canvas = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports.config = {
    name: "dost",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "Ahmad RDX",
    description: "Make a Beautiful Friendship Frame",
    commandCategory: "img",
    usages: "[mention or reply]",
    cooldowns: 10,
    aliases: ["bff", "dosti", "friends"]
};

// --- IMAGE CIRCLE FUNCTION (Gol Tasveer) ---
function drawCircle(ctx, image, x, y, size) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(image, x, y, size, size);
    ctx.restore();
    // Border add karte hain
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#ffffff"; // White Border
    ctx.stroke();
}

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID, body } = event;

    // --- TARGET LOGIC (Fixed for Reply) ---
    let targetID;
    
    // 1. Agar Mention kiya hai
    if (Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
    } 
    // 2. Agar Reply kiya hai (Yeh wala part fix kiya hai)
    else if (event.type === "message_reply") {
        targetID = event.messageReply.senderID;
    } 
    else {
        return api.sendMessage("❌ Kisi dost ko Mention karo ya Reply karo!", threadID, messageID);
    }

    api.setMessageReaction("💖", messageID, () => {}, true);
    api.sendMessage("✨ **Designing Best Friends Frame...**", threadID, messageID);

    try {
        // --- 1. SETUP CANVAS ---
        const width = 1200;
        const height = 675;
        const canvas = Canvas.createCanvas(width, height);
        const ctx = canvas.getContext("2d");

        // --- 2. BACKGROUND (Attractive Gradient) ---
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, "#8EC5FC"); // Light Blue
        gradient.addColorStop(0.5, "#E0C3FC"); // Light Purple
        gradient.addColorStop(1, "#FF9A9E"); // Pinkish
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Frame Border
        ctx.strokeStyle = "white";
        ctx.lineWidth = 30;
        ctx.strokeRect(15, 15, width - 30, height - 30);

        // --- 3. LOAD AVATARS ---
        const avatar1Url = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const avatar2Url = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

        const avatar1 = await Canvas.loadImage(avatar1Url);
        const avatar2 = await Canvas.loadImage(avatar2Url);
        // Dil (Heart) Image load karna (Online link se)
        const heart = await Canvas.loadImage("https://i.imgur.com/g8vK3fP.png"); // Heart Icon

        // --- 4. DRAWING ---
        
        // Photos Draw karna (Circle Function se)
        drawCircle(ctx, avatar1, 150, 180, 350); // Aap (Left)
        drawCircle(ctx, avatar2, 700, 180, 350); // Dost (Right)

        // Heart Center mein
        ctx.drawImage(heart, 525, 280, 150, 150);

        // Text: BEST FRIENDS
        ctx.font = "bold 80px Sans";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 10;
        ctx.fillText("BEST FRIENDS", width / 2, 120);
        
        // Text: Forever
        ctx.font = "bold 60px Sans";
        ctx.fillStyle = "#FF416C"; // Dark Pink
        ctx.fillText("FOREVER", width / 2, 600);

        // Quote
        ctx.font = "italic 35px Sans";
        ctx.fillStyle = "#333333";
        ctx.fillText(`"${"True friendship consists not in the multitude of friends,"}`, width / 2, 650);

        // --- 5. SENDING ---
        const filePath = path.join(__dirname, "cache", `friend_${senderID}_${targetID}.png`);
        const buffer = canvas.toBuffer("image/png");
        fs.writeFileSync(filePath, buffer);

        api.sendMessage({
            body: `💖 **FRIENDSHIP GOALS** 💖\n✨ ${senderID} 🤝 ${targetID}`,
            attachment: fs.createReadStream(filePath)
        }, threadID, () => fs.unlinkSync(filePath), messageID);

    } catch (e) {
        console.log(e);
        api.sendMessage("❌ Error generating frame. Please try again.", threadID, messageID);
    }
};
