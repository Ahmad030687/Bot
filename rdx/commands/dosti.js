const canvacord = require("canvacord");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "dosti",
    version: "3.0.0",
    hasPermssion: 0,
    credits: "Ahmad RDX",
    description: "Slap/Kiss (Reply Guaranteed Fix)",
    commandCategory: "img",
    usages: "[reply or mention]",
    cooldowns: 5,
    aliases: ["slap", "spank", "kiss", "bed"]
};

module.exports.run = async function ({ api, event }) {
    const { threadID, messageID, senderID, body } = event;

    // Command Name (e.g. slap)
    // Hum 'args' use nahi kar rahe taake crash na ho
    const cmd = body.split(" ")[0].slice(1).toLowerCase();

    // --- TARGET FINDING (Super Robust) ---
    let targetID = null;

    if (event.messageReply) {
        // Method 1: Direct Reply Object
        targetID = event.messageReply.senderID;
    } 
    else if (Object.keys(event.mentions).length > 0) {
        // Method 2: Mentions
        targetID = Object.keys(event.mentions)[0];
    }
    
    // Agar abhi bhi ID nahi mili
    if (!targetID) {
        return api.sendMessage("🚫 برائے کرم کسی کو ٹیگ کریں یا میسج پر Reply کریں!", threadID, messageID);
    }

    if (targetID === senderID) return api.sendMessage("❌ Khud par try mat karo!", threadID, messageID);

    // --- EXECUTION ---
    api.setMessageReaction("✅", messageID, () => {}, true);

    try {
        const avatar1 = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const avatar2 = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

        let image;
        switch (cmd) {
            case "slap": image = await canvacord.Canvas.slap(avatar1, avatar2); break;
            case "spank": image = await canvacord.Canvas.spank(avatar1, avatar2); break;
            case "kiss": image = await canvacord.Canvas.kiss(avatar1, avatar2); break;
            case "bed": image = await canvacord.Canvas.bed(avatar1, avatar2); break;
            default: return api.sendMessage("❌ Command samajh nahi ayi (slap, kiss, spank, bed).", threadID, messageID);
        }

        const filePath = path.join(__dirname, "cache", `${cmd}_${senderID}.png`);
        fs.writeFileSync(filePath, image);

        api.sendMessage({
            body: `🦅 **RDX ACTION: ${cmd.toUpperCase()}**`,
            attachment: fs.createReadStream(filePath)
        }, threadID, () => fs.unlinkSync(filePath), messageID);

    } catch (error) {
        console.error(error); // Console mein error check karein agar dubara aye
        api.sendMessage(`❌ Error: ${error.message}`, threadID, messageID);
    }
};
