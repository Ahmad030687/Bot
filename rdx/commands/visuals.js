const canvacord = require("canvacord");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "visuals",
    version: "3.1.0",
    hasPermssion: 0,
    credits: "Ahmad RDX",
    description: "Visual Effects (Fixed Slice Error)",
    commandCategory: "img",
    usages: "[mention or reply]",
    cooldowns: 5,
    aliases: ["wanted", "jail", "wasted", "rip", "trash", "trigger"]
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID, body } = event;
    
    // --- FIX: Error Yahan Tha ---
    // Hum ab 'args' ki bajaye direct 'body' se command nikal rahe hain
    // Example: Body = "#jail @Ali" -> split -> ["#jail", "@Ali"] -> 0 index = "#jail" -> slice(1) = "jail"
    const cmd = body.split(" ")[0].slice(1).toLowerCase();

    // --- TARGET SELECTION LOGIC ---
    let targetID = senderID; // Default: Aap khud

    if (Object.keys(event.mentions).length > 0) {
        // 1. Mention Check
        targetID = Object.keys(event.mentions)[0];
    } else if (event.type == "message_reply") {
        // 2. Reply Check
        targetID = event.messageReply.senderID;
    }

    // Facebook Avatar URL
    const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

    api.setMessageReaction("🎨", messageID, () => {}, true);
    api.sendMessage(`⏳ **Applying ${cmd.toUpperCase()} effect...**`, threadID, messageID);

    try {
        let image;
        
        // --- EFFECT SELECTION ---
        switch (cmd) {
            case "wanted":
                image = await canvacord.Canvas.wanted(avatarUrl);
                break;
            case "jail":
                image = await canvacord.Canvas.jail(avatarUrl, true);
                break;
            case "wasted":
                image = await canvacord.Canvas.wasted(avatarUrl);
                break;
            case "rip":
                image = await canvacord.Canvas.rip(avatarUrl);
                break;
            case "trash":
                image = await canvacord.Canvas.trash(avatarUrl);
                break;
            case "trigger":
                image = await canvacord.Canvas.trigger(avatarUrl);
                break;
            default:
                return api.sendMessage("❌ Unknown visual command.", threadID, messageID);
        }

        const filePath = path.join(__dirname, "cache", `${cmd}_${targetID}.png`);
        fs.writeFileSync(filePath, image);

        api.sendMessage({
            body: `🦅 **RDX VISUALS: ${cmd.toUpperCase()}**`,
            attachment: fs.createReadStream(filePath)
        }, threadID, () => {
            fs.unlinkSync(filePath);
        }, messageID);

    } catch (error) {
        console.error(error);
        api.sendMessage(`❌ Error: ${error.message}`, threadID, messageID);
    }
};
