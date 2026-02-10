const Canvas = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports.config = {
    name: "dost",
    version: "2.1.0",
    hasPermssion: 0,
    credits: "Ahmad RDX",
    description: "Beautiful Friendship Frame (Fixed Slice Error)",
    commandCategory: "img",
    usages: "[mention or reply]",
    cooldowns: 10,
    aliases: ["bff", "dosti", "friends"]
};

// --- IMAGE CIRCLE FUNCTION ---
function drawCircle(ctx, image, x, y, size) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(image, x, y, size, size);
    ctx.restore();
    
    // White Border
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
    ctx.lineWidth = 15;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
}

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID, body } = event;

    // --- FIX: ERROR YAHAN THA ---
    // Hum args use hi nahi karenge, kyunke humein command name ki zaroorat nahi.
    // Hum seedha target dhoondenge.

    let targetID;
    let targetName = "Friend";

    // --- TARGET LOGIC (Priority: Reply > Mention) ---
    
    // 1. Agar Reply kiya hai
    if (event.type === "message_reply") {
        targetID = event.messageReply.senderID;
        // Reply wale ka naam nikalne ki koshish (Optional)
    } 
    // 2. Agar Mention kiya hai
    else if (Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
        targetName = event.mentions[targetID].replace("@", "");
    } 
    else {
        return api.sendMessage("❌ Kisi dost ko Mention karo ya Reply karke #friend likho!", threadID, messageID);
    }

    if (targetID === senderID) return api.sendMessage("❌ Khud se dosti? Akele ho kya? 😂 Kisi aur ko tag karo!", threadID, messageID);

    api.setMessageReaction("💖", messageID, () => {}, true);
    api.sendMessage("✨ **Designing Best Friends Frame...**", threadID, messageID);

    try {
        // --- 1. SETUP CANVAS ---
        const width = 1200;
        const height = 675;
        const canvas = Canvas.createCanvas(width, height);
        const ctx = canvas.getContext("2d");

        // --- 2. BACKGROUND (Beautiful Gradient) ---
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, "#FF9A9E"); // Pink
        gradient.addColorStop(0.5, "#FECFEF"); // Soft Pink
        gradient.addColorStop(1, "#A18CD1"); // Purple
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Frame Decoration (White Box)
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.fillRect(50, 50, width - 100, height - 100);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 10;
        ctx.strokeRect(50, 50, width - 100, height - 100);

        // --- 3. LOAD IMAGES ---
        // Sender Avatar
        const avatar1 = await Canvas.loadImage(`https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
        // Target Avatar
        const avatar2 = await Canvas.loadImage(`https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
        
        // Heart Icon (Online)
        const heart = await Canvas.loadImage("https://i.imgur.com/g8vK3fP.png");

        // --- 4. DRAWING ---
        // Circle Photos
        drawCircle(ctx, avatar1, 100, 150, 350); // Aap (Left)
        drawCircle(ctx, avatar2, 750, 150, 350); // Dost (Right)

        // Heart Center Image
        ctx.drawImage(heart, 525, 250, 150, 150);

        // TEXT: "BEST FRIENDS"
        ctx.font = "bold 90px Sans";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 10;
        ctx.fillText("BEST FRIENDS", width / 2, 120);

        // Quote Bottom
        ctx.font = "italic 40px Sans";
        ctx.fillStyle = "#555555";
        ctx.shadowBlur = 0;
        ctx.fillText(`"Friendship is a single soul dwelling in two bodies."`, width / 2, 600);

        // --- 5. SAVE & SEND ---
        const filePath = path.join(__dirname, "cache", `friend_${senderID}_${targetID}.png`);
        const buffer = canvas.toBuffer("image/png");
        fs.writeFileSync(filePath, buffer);

        api.sendMessage({
            body: `💖 **FRIENDSHIP GOALS** 💖`,
            attachment: fs.createReadStream(filePath)
        }, threadID, () => fs.unlinkSync(filePath), messageID);

    } catch (e) {
        console.log(e);
        api.sendMessage(`❌ Error: ${e.message}`, threadID, messageID);
    }
};
