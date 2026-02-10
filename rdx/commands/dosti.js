const canvacord = require("canvacord");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "dost",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "Ahmad RDX",
    description: "Interaction Commands (FIXED REPLY)",
    commandCategory: "img",
    usages: "[mention or reply]",
    cooldowns: 5,
    aliases: ["slap", "spank", "kiss", "bed"]
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID, body } = event;
    const cmd = args[0].slice(1).toLowerCase();

    // --- FIX: ROBUST TARGET LOGIC ---
    let targetID;

    // 1. Pehle Reply check karein (Priority)
    if (event.type === "message_reply") {
        targetID = event.messageReply.senderID;
    } 
    // 2. Phir Mention check karein
    else if (Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
    } 
    else {
        return api.sendMessage(`❌ Bhai kisko ${cmd} karna hai? Reply karo ya Mention karo!`, threadID, messageID);
    }

    if (targetID === senderID) return api.sendMessage("❌ Khud par try mat karo!", threadID, messageID);

    const avatar1 = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const avatar2 = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

    api.setMessageReaction("😈", messageID, () => {}, true);

    try {
        let image;
        switch (cmd) {
            case "slap": image = await canvacord.Canvas.slap(avatar1, avatar2); break;
            case "spank": image = await canvacord.Canvas.spank(avatar1, avatar2); break;
            case "kiss": image = await canvacord.Canvas.kiss(avatar1, avatar2); break;
            case "bed": image = await canvacord.Canvas.bed(avatar1, avatar2); break;
            default: return api.sendMessage("❌ Unknown action.", threadID, messageID);
        }

        const filePath = path.join(__dirname, "cache", `${cmd}_${senderID}.png`);
        fs.writeFileSync(filePath, image);

        api.sendMessage({
            body: `🦅 **RDX ACTION: ${cmd.toUpperCase()}**`,
            attachment: fs.createReadStream(filePath)
        }, threadID, () => fs.unlinkSync(filePath), messageID);

    } catch (error) {
        api.sendMessage(`❌ Error: ${error.message}`, threadID, messageID);
    }
};
