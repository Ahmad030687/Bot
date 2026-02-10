const Canvas = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "friend",
    version: "8.0.0", // Ultimate Version
    hasPermssion: 0,
    credits: "Ahmad RDX",
    description: "Premium Gold/Silver Frame (No Links)",
    commandCategory: "img",
    usages: "[reply or mention]",
    cooldowns: 10,
    aliases: ["bff", "dosti", "royalfriend"]
};

// --- HELPER FUNCTION: DRAW CIRCULAR AVATAR WITH BORDER ---
function drawStyledAvatar(ctx, image, x, y, size, borderColor1, borderColor2) {
    ctx.save();
    
    // 1. Define Circle Path & Clip
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    // Draw Image
    ctx.drawImage(image, x, y, size, size);
    ctx.restore(); // Restore context to stop clipping

    // 2. Draw Metallic Border (Gradient Stroke)
    const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
    gradient.addColorStop(0, borderColor1);   // Light part
    gradient.addColorStop(0.5, borderColor2); // Dark part
    gradient.addColorStop(1, borderColor1);   // Light part again

    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
    ctx.lineWidth = 25; // Thick Premium Border
    ctx.strokeStyle = gradient;
    // Add Glow Shadow
    ctx.shadowColor = borderColor1;
    ctx.shadowBlur = 20;
    ctx.stroke();
    
    // Reset Shadow for next elements
    ctx.shadowBlur = 0;
}

module.exports.run = async function ({ api, event }) {
    const { threadID, messageID, senderID } = event;
    let targetID;

    // --- ROBUST TARGET LOGIC ---
    if (event.type == "message_reply") {
        targetID = event.messageReply.senderID;
    } else if (Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
    } else {
        return api.sendMessage("👑 شاہی فریم کے لیے کسی دوست کو Reply یا Mention کریں!", threadID, messageID);
    }

    if (targetID === senderID) return api.sendMessage("❌ خود اکیلے فریم میں اچھے نہیں لگو گے!", threadID, messageID);

    api.setMessageReaction("✨", messageID, () => {}, true);
    api.sendMessage("🎨 **Creating Premium Masterpiece...**", threadID, messageID);

    try {
        // --- 1. SETUP CANVAS ---
        const width = 1280;
        const height = 720;
        const canvas = Canvas.createCanvas(width, height);
        const ctx = canvas.getContext("2d");

        // --- 2. DRAW ROYAL BACKGROUND ---
        const bgGrad = ctx.createRadialGradient(width/2, height/2, 100, width/2, height/2, 800);
        bgGrad.addColorStop(0, "#001f3f"); // Deep Royal Blue Center
        bgGrad.addColorStop(1, "#000000"); // Black Edges
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Add some decorative faint patterns (Optional - simple lines)
        ctx.strokeStyle = "rgba(255, 215, 0, 0.1)"; // Faint Gold
        ctx.lineWidth = 5;
        ctx.strokeRect(50, 50, width-100, height-100);

        // --- 3. LOAD AVATARS (HD) ---
        const avatar1 = await Canvas.loadImage(`https://graph.facebook.com/${senderID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
        const avatar2 = await Canvas.loadImage(`https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);

        // --- 4. DRAW AVATARS WITH PREMIUM BORDERS ---
        const avatarSize = 400;
        const yPos = 160;

        // Left Avatar (GOLD THEME) - Sender
        drawStyledAvatar(ctx, avatar1, 150, yPos, avatarSize, "#FFD700", "#DAA520");

        // Right Avatar (SILVER THEME) - Target
        drawStyledAvatar(ctx, avatar2, 730, yPos, avatarSize, "#C0C0C0", "#A9A9A9");

        // --- 5. ADD PREMIUM TEXT ---
        // Main Title
        ctx.font = "bold 80px Sans";
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        // Text Shadow for 3D effect
        ctx.shadowColor = "#FFD700"; // Gold shadow
        ctx.shadowBlur = 15;
        ctx.fillText("ROYAL BOND", width / 2, 120);
        ctx.shadowBlur = 0; // Reset

        // Subtitle
        ctx.font = "italic 40px Sans";
        ctx.fillStyle = "#E0E0E0";
        ctx.fillText("An Unbreakable Friendship", width / 2, 650);
        
        // Center Element (e.g., a small crown or symbol)
        ctx.font = "60px Sans";
        ctx.fillText("👑", width / 2, height / 2);


        // --- 6. SAVE & SEND ---
        const filePath = path.join(__dirname, "cache", `friend_premium_${senderID}.png`);
        fs.writeFileSync(filePath, canvas.toBuffer());

        api.sendMessage({
            body: `✨ **A Premium Frame for Premium Friends** ✨`,
            attachment: fs.createReadStream(filePath)
        }, threadID, () => fs.unlinkSync(filePath), messageID);

    } catch (e) {
        console.error(e);
        api.sendMessage(`❌ Error: ${e.message}`, threadID, messageID);
    }
};
