const Canvas = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "tweet",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Ahmad RDX",
    description: "Make Elon Musk tweet about someone",
    commandCategory: "fun",
    usages: "[reply]",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    
    if (event.type !== "message_reply") return api.sendMessage("❌ Bhai, kisi ke message par Reply karo taake Elon Musk usay roast kare!", threadID, messageID);

    const targetID = event.messageReply.senderID;
    const userName = (await api.getUserInfo(targetID))[targetID].name;

    api.sendMessage("🐦 **Elon Musk is typing a tweet...**", threadID, messageID);

    try {
        const canvas = Canvas.createCanvas(1000, 500);
        const ctx = canvas.getContext("2d");

        // 1. Background (White Tweet Style)
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 1000, 500);

        // 2. Elon Musk Avatar (Direct Link)
        const elonImg = await Canvas.loadImage("https://i.imgur.com/7492G8O.png"); 
        ctx.drawImage(elonImg, 50, 50, 100, 100);

        // 3. User Avatar (Small circle or square next to text)
        const userImg = await Canvas.loadImage(`https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
        ctx.drawImage(userImg, 800, 50, 150, 150);

        // 4. Texts
        ctx.fillStyle = "#000000";
        ctx.font = "bold 35px Arial";
        ctx.fillText("Elon Musk", 170, 85);
        
        ctx.fillStyle = "#657786";
        ctx.font = "30px Arial";
        ctx.fillText("@elonmusk", 170, 125);

        // 5. The Tweet Content (Funny Roast)
        const roasts = [
            `I am planning to buy ${userName} and then delete them.`,
            `${userName} is the reason why I want to go to Mars.`,
            `Just saw ${userName}'s profile. Humanity is in danger.`,
            `My next mission is to find ${userName}'s missing brain.`
        ];
        const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];

        ctx.fillStyle = "#000000";
        ctx.font = "40px Arial";
        // Wrap text logic can be added, but keeping it simple for now
        ctx.fillText(randomRoast, 50, 250);

        // 6. Tweet Stats (Fake)
        ctx.fillStyle = "#657786";
        ctx.font = "25px Arial";
        ctx.fillText("10:30 AM · Feb 11, 2026 · Twitter for RDX", 50, 450);

        const filePath = path.join(__dirname, "cache", `tweet_${targetID}.png`);
        fs.writeFileSync(filePath, canvas.toBuffer());

        api.sendMessage({
            body: `🐦 **Elon Musk just tweeted!**`,
            attachment: fs.createReadStream(filePath)
        }, threadID, () => fs.unlinkSync(filePath), messageID);

    } catch (e) {
        api.sendMessage("❌ Error: Twitter server down (Check logs)!", threadID, messageID);
    }
};
