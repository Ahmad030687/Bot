const Canvas = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "news",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Ahmad RDX",
    description: "Make a friend a Breaking News criminal",
    commandCategory: "fun",
    usages: "[reply/mention]",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    let targetID = event.type == "message_reply" ? event.messageReply.senderID : Object.keys(event.mentions)[0];

    if (!targetID) return api.sendMessage("📺 نیوز میں آنے کے لیے کسی کو ٹیگ تو کرو بھائی!", threadID, messageID);

    api.sendMessage("🎥 **News Studio is preparing the report...**", threadID, messageID);

    try {
        // --- 1. SETUP CANVAS & FRAME ---
        const frame = await Canvas.loadImage("https://i.ibb.co/Vp8pXQk/breaking-news-frame.png"); // Yahan aik acha sa news frame link hoga
        const canvas = Canvas.createCanvas(frame.width, frame.height);
        const ctx = canvas.getContext("2d");

        // --- 2. LOAD TARGET AVATAR ---
        const avatar = await Canvas.loadImage(`https://graph.facebook.com/${targetID}/picture?width=1024&height=1024&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);

        // --- 3. DRAWING LAYERS ---
        ctx.drawImage(avatar, 100, 150, 800, 500); // Picture placement
        ctx.drawImage(frame, 0, 0, canvas.width, canvas.height); // Frame on top

        // --- 4. TEXT ON NEWS ---
        ctx.font = "bold 60px Arial";
        ctx.fillStyle = "white";
        ctx.fillText("MOST WANTED VELLA FOUND!", 150, 750);

        const filePath = path.join(__dirname, "cache", `news_${targetID}.png`);
        fs.writeFileSync(filePath, canvas.toBuffer());

        api.sendMessage({
            body: `🎤 **RDX NEWS REPORT:**\nعلاقے کا سب سے بڑا ویلا پکڑا گیا!`,
            attachment: fs.createReadStream(filePath)
        }, threadID, () => fs.unlinkSync(filePath), messageID);

    } catch (e) {
        api.sendMessage("❌ نیوز سٹوڈیو میں آگ لگ گئی (Error)!", threadID, messageID);
    }
};
