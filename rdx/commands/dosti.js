const canvacord = require("canvacord");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "dosti",
    version: "3.1.0", // Same version logic as visuals
    hasPermssion: 0,
    credits: "Ahmad RDX",
    description: "Interaction Commands (Visuals Logic)",
    commandCategory: "img",
    usages: "[mention or reply]",
    cooldowns: 5,
    aliases: ["slap", "spank", "kiss", "bed"]
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID, body } = event;
    
    // --- 1. COMMAND LOGIC (SAME AS VISUALS.JS) ---
    // Body se command nikalna: #slap -> slap
    // Visuals.js wala exact tareeka
    const cmd = body.split(" ")[0].slice(1).toLowerCase();

    // --- 2. TARGET SELECTION LOGIC (SAME AS VISUALS.JS) ---
    let targetID;

    if (Object.keys(event.mentions).length > 0) {
        // 1. Mention Check
        targetID = Object.keys(event.mentions)[0];
    } else if (event.type == "message_reply") {
        // 2. Reply Check
        targetID = event.messageReply.senderID;
    } else {
        // Visuals main default 'senderID' hota hai, lekin yahan 2 log chahiye.
        // Agar koi nahi mila to error dena parega.
        return api.sendMessage("❌ Bhai kisi ko Mention karo ya Reply karo!", threadID, messageID);
    }

    // Khud par try rokne ke liye
    if (targetID === senderID) return api.sendMessage("❌ Khud par try mat karo!", threadID, messageID);

    // --- 3. AVATAR URLS (SAME AS VISUALS.JS) ---
    // Hum wohi link use kar rahe hain jo visuals.js mai 100% work kar raha hai
    const avatar1 = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const avatar2 = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

    api.setMessageReaction("🤜", messageID, () => {}, true);
    // api.sendMessage(`⏳ **Applying ${cmd.toUpperCase()}...**`, threadID, messageID); // Optional Message

    try {
        let image;
        
        // --- 4. EFFECT SELECTION ---
        // Canvacord ko direct URL de rahe hain (Visuals style)
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
                // Fallback (Agar command match na ho to Slap)
                image = await canvacord.Canvas.slap(avatar1, avatar2);
                break;
        }

        // Image Save karna
        const filePath = path.join(__dirname, "cache", `${cmd}_${senderID}.png`);
        fs.writeFileSync(filePath, image);

        // Image Bhejna
        api.sendMessage({
            body: `🦅 **RDX ACTION: ${cmd.toUpperCase()}**`,
            attachment: fs.createReadStream(filePath)
        }, threadID, () => {
            // Message jaane ke baad file delete
            fs.unlinkSync(filePath);
        }, messageID);

    } catch (error) {
        console.error(error);
        api.sendMessage(`❌ Error: ${error.message}`, threadID, messageID);
    }
};
