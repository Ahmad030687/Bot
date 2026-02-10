const canvacord = require("canvacord");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "dosti",
    version: "12.0.0",
    hasPermssion: 0,
    credits: "Ahmad RDX",
    description: "Slap/Kiss/Bed (Visuals Logic Copy)",
    commandCategory: "img",
    usages: "[reply or mention]",
    cooldowns: 5,
    aliases: ["slap", "spank", "kiss", "bed"]
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID, body } = event;

    // --- 1. COMMAND NAME (Visuals.js Style) ---
    // Body: "#slap @Ali" -> split -> "#slap" -> slice(1) -> "slap"
    const cmd = body.split(" ")[0].slice(1).toLowerCase();

    // --- 2. TARGET LOGIC (Exact Copy of Visuals.js) ---
    let targetID;

    // Pehle Mention Check
    if (Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
    } 
    // Phir Reply Check
    else if (event.type == "message_reply") {
        targetID = event.messageReply.senderID;
    } 
    else {
        // Agar dono nahi mile
        return api.sendMessage("❌ Bhai kisi ke message par Reply karo ya Mention karo!", threadID, messageID);
    }

    // Khud par try rokne ke liye
    if (targetID === senderID) return api.sendMessage("❌ Khud par try mat karo!", threadID, messageID);

    // --- 3. REACTION & URLS ---
    api.setMessageReaction("🤜", messageID, () => {}, true);

    try {
        // Direct URLs (Jese Visuals.js mai hain)
        const avatar1 = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const avatar2 = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

        let image;
        
        // --- 4. ACTION ---
        switch (cmd) {
            case "slap":
                image = await canvacord.Canvas.slap(avatar1, avatar2);
                break;
            case "spank":
                image = await canvacord.Canvas.spank(avatar1, avatar2);
                break;
            case "kiss":
                image = await canvacord.Canvas.kiss(avatar1, avatar2);
                break;
            case "bed":
                image = await canvacord.Canvas.bed(avatar1, avatar2);
                break;
            default:
                // Agar ghalati se koi aur command match ho jaye to default Slap
                image = await canvacord.Canvas.slap(avatar1, avatar2);
                break;
        }

        // --- 5. SAVE & SEND ---
        const filePath = path.join(__dirname, "cache", `${cmd}_${senderID}.png`);
        fs.writeFileSync(filePath, image);

        api.sendMessage({
            body: `🦅 **RDX ACTION: ${cmd.toUpperCase()}**`,
            attachment: fs.createReadStream(filePath)
        }, threadID, () => {
            fs.unlinkSync(filePath);
        }, messageID);

    } catch (error) {
        console.error(error);
        api.sendMessage(`❌ Error: ${error.message}`, threadID, messageID);
    }
};
