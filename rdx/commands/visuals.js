const canvacord = require("canvacord");
const fs = require("fs-extra");

module.exports.config = {
    name: "visuals",
    version: "3.0.0",
    hasPermssion: 0,
    credits: "Ahmad RDX",
    description: "Visual Effects Pack (Works with # Prefix)",
    commandCategory: "img",
    usages: "[mention or reply]",
    cooldowns: 5,
    // Ye aliases zaroori hain taake bot in sab commands par react kare
    aliases: ["wanted", "jail", "wasted", "rip", "trash", "trigger"]
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID, body } = event;
    
    // --- PREFIX HANDLING ---
    // args[0] aapka pehla lafz hai (e.g., #jail)
    // .slice(1) ka matlab hai pehla character (#) hata do
    const cmd = args[0].slice(1).toLowerCase();

    // --- TARGET SELECTION LOGIC ---
    let targetID = senderID; // Default: Aap khud (Agar mention/reply na ho)

    if (Object.keys(event.mentions).length > 0) {
        // 1. Agar Mention kiya hai
        targetID = Object.keys(event.mentions)[0];
    } else if (event.type == "message_reply") {
        // 2. Agar Reply kiya hai
        targetID = event.messageReply.senderID;
    }

    // Facebook se HD Avatar uthana
    const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

    // Loading Reaction
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
                image = await canvacord.Canvas.jail(avatarUrl, true); // true = Greyscale (Black & white)
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
                // Agar koi aur command ho toh ignore kare
                return;
        }

        // Image Save karna
        const path = __dirname + `/cache/${cmd}_${targetID}.png`;
        fs.writeFileSync(path, image);

        // Image Bhejna
        api.sendMessage({
            body: `🦅 **RDX VISUALS: ${cmd.toUpperCase()}**`,
            attachment: fs.createReadStream(path)
        }, threadID, () => {
            // Message jaane ke baad file delete (Space bachanay ke liye)
            fs.unlinkSync(path);
        }, messageID);

    } catch (error) {
        console.error(error);
        api.sendMessage(`❌ Error: ${error.message}`, threadID, messageID);
    }
};
                  
