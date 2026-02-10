const Canvas = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "rank",
    version: "5.0.0", // Visual Update Version
    hasPermssion: 0,
    credits: "Ahmad RDX",
    description: "Visual Rank Card with Profile and Coins",
    commandCategory: "economy",
    usages: "[reply/none]",
    cooldowns: 5
};

const dataPath = path.join(__dirname, "cache", "rdx_economy.json");

// --- HELPER FUNCTIONS ---
const getLevel = (xp) => Math.floor(Math.sqrt(xp / 100));
const getNextLevelXp = (level) => (level + 1) * (level + 1) * 100;

// Canvas par Rounded Rectangle banane ke liye
function drawRoundedRect(ctx, x, y, width, height, radius, color) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
}

// --- HANDLE EVENT (Ye wohi purana hai, 10rs bonus wala) ---
module.exports.handleEvent = async function ({ api, event }) {
    const { threadID, senderID, body } = event;
    if (!body || senderID == api.getCurrentUserID()) return;

    if (!fs.existsSync(dataPath)) return;
    let data = fs.readJsonSync(dataPath);

    if (!data[senderID] || !data[senderID].isRegistered) return;

    let oldLevel = getLevel(data[senderID].xp);
    data[senderID].xp += 5; 
    let newLevel = getLevel(data[senderID].xp);

    if (newLevel > oldLevel) {
        data[senderID].level = newLevel;
        data[senderID].coins += 10; // Rank up par 10rs bonus
        api.sendMessage(`🎊 **LEVEL UP!** 🎊\n@${senderID} Aapka level barh kar ${newLevel} ho gaya hai!\n💰 Reward: 10rs aapke account mein jama kar diye gaye hain.`, threadID);
    }

    fs.writeJsonSync(dataPath, data);
};

// --- MAIN RUN COMMAND (Ye naya visual hissa hai) ---
module.exports.run = async function ({ api, event }) {
    const { threadID, messageID, senderID } = event;
    let targetID = event.type == "message_reply" ? event.messageReply.senderID : senderID;

    if (!fs.existsSync(dataPath)) return api.sendMessage("❌ Database nahi mila!", threadID);
    let data = fs.readJsonSync(dataPath);
    
    // Check agar user registered hai
    if (!data[targetID] || !data[targetID].isRegistered) {
        return api.sendMessage("❌ Is user ka account nahi khula hua. Pehle `#openaccount` karein.", threadID);
    }

    let user = data[targetID];
    let currentLevel = getLevel(user.xp);
    let nextXp = getNextLevelXp(currentLevel);
    let currentLevelBaseXp = getNextLevelXp(currentLevel - 1);
    if (currentLevel === 0) currentLevelBaseXp = 0;

    api.setMessageReaction("📊", messageID, () => {}, true);

    try {
        // Canvas Setup (900x300 banner)
        const canvas = Canvas.createCanvas(900, 300);
        const ctx = canvas.getContext("2d");

        // 1. Background (Dark Theme)
        drawRoundedRect(ctx, 0, 0, 900, 300, 30, "#141414");
        
        // --- LEFT SIDE: PROFILE ---
        // Avatar Load
        const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const avatar = await Canvas.loadImage(avatarUrl);

        // Circular Avatar Draw
        ctx.save();
        ctx.beginPath();
        ctx.arc(150, 150, 100, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 50, 50, 200, 200);
        ctx.restore();
        // Avatar Border
        ctx.beginPath();
        ctx.arc(150, 150, 100, 0, Math.PI * 2, true);
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#ffd700"; // Gold Border
        ctx.stroke();

        // Registered Name
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 35px Arial";
        ctx.textAlign = "center";
        ctx.fillText(user.name.length > 15 ? user.name.substring(0, 15) + "..." : user.name, 150, 280);


        // --- RIGHT SIDE: COINS & STATS ---
        // Coin Icon Load (Aik online gold coin image)
        const coinImg = await Canvas.loadImage("https://i.imgur.com/De61sRk.png");
        ctx.drawImage(coinImg, 680, 40, 80, 80);

        // Coin Balance Text
        ctx.fillStyle = "#ffd700"; // Gold Color
        ctx.font = "bold 60px Arial";
        ctx.textAlign = "right";
        ctx.fillText(`${user.coins.toLocaleString()} RS`, 660, 100);

        // Level Text
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 40px Arial";
        ctx.textAlign = "left";
        ctx.fillText(`Level: ${currentLevel}`, 300, 180);

        // XP Text
        ctx.fillStyle = "#aaaaaa";
        ctx.font = "25px Arial";
        ctx.fillText(`XP: ${user.xp} / ${nextXp}`, 300, 220);

        // --- PROGRESS BAR ---
        // Background Bar
        drawRoundedRect(ctx, 300, 240, 550, 30, 15, "#333333");
        // Filled Bar (Calculation)
        let totalNeeded = nextXp - currentLevelBaseXp;
        let currentProgress = user.xp - currentLevelBaseXp;
        let percentage = (currentProgress / totalNeeded);
        let barWidth = Math.max(30, percentage * 550); // Kam se kam 30px width rahe
        
        drawRoundedRect(ctx, 300, 240, barWidth, 30, 15, "#00ff00"); // Green Progress bar

        // --- SAVE & SEND ---
        const filePath = path.join(__dirname, "cache", `rank_card_${targetID}.png`);
        fs.writeFileSync(filePath, canvas.toBuffer());

        api.sendMessage({
            body: `📊 **RDX BANK CARD**`,
            attachment: fs.createReadStream(filePath)
        }, threadID, () => fs.unlinkSync(filePath), messageID);

    } catch (e) {
        console.error(e);
        api.sendMessage("❌ Error generating rank card!", threadID, messageID);
    }
};
