const Canvas = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "news",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "Ahmad RDX",
    description: "Breaking News (Safe Version)",
    commandCategory: "fun",
    usages: "[mention/reply]",
    cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
    const { threadID, messageID, senderID } = event;
    let targetID = event.type == "message_reply" ? event.messageReply.senderID : Object.keys(event.mentions)[0];

    if (!targetID) return api.sendMessage("❌ بھائی، نیوز میں ذلیل کرنے کے لیے کسی کو ٹیگ تو کرو!", threadID, messageID);

    try {
        const canvas = Canvas.createCanvas(1280, 720);
        const ctx = canvas.getContext("2d");

        // 1. Load Profile Pic
        const avatar = await Canvas.loadImage(`https://graph.facebook.com/${targetID}/picture?width=1024&height=1024&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
        ctx.drawImage(avatar, 0, 0, 1280, 720);

        // 2. Draw Red Banner (Bottom)
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(0, 550, 1280, 170);

        // 3. Draw "BREAKING NEWS" Box
        ctx.fillStyle = "#FFD700";
        ctx.fillRect(0, 500, 450, 60);
        
        // 4. Text - Breaking News
        ctx.font = "bold 45px Sans";
        ctx.fillStyle = "black";
        ctx.fillText("BREAKING NEWS", 30, 545);

        // 5. Main Headline
        ctx.font = "bold 65px Sans";
        ctx.fillStyle = "white";
        ctx.fillText("علاقے کا سب سے بڑا ویلا پکڑا گیا!", 480, 630);

        // 6. Ticker (Bottom small text)
        ctx.fillStyle = "white";
        ctx.font = "30px Sans";
        ctx.fillText("RDX NEWS: ILAQE MAIN KHOUF O HIRAS PHAYL GAYA...  ", 50, 690);

        const filePath = path.join(__dirname, "cache", `news_${targetID}.png`);
        fs.writeFileSync(filePath, canvas.toBuffer());

        api.sendMessage({
            body: `🎤 **RDX NEWS REPORT:**\nہوشیار رہیں، یہ بندہ خطرناک حد تک ویلا ہے!`,
            attachment: fs.createReadStream(filePath)
        }, threadID, () => fs.unlinkSync(filePath), messageID);

    } catch (e) {
        api.sendMessage("❌ سٹوڈیو میں پھر آگ لگ گئی: " + e.message, threadID, messageID);
    }
};
        
