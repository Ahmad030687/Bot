const canvacord = require("canvacord");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "dost",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Ahmad RDX",
    description: "Interaction Commands (Slap, Spank, Kiss, Bed)",
    commandCategory: "img",
    usages: "[mention or reply]",
    cooldowns: 5,
    // Yeh aliases zaroori hain taake bot in sab commands par react kare
    aliases: ["slap", "spank", "kiss", "bed"]
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID, body } = event;
    
    // --- PREFIX HANDLING ---
    // Command ka naam nikalna (e.g., #slap -> slap)
    const cmd = body.split(" ")[0].slice(1).toLowerCase();

    // --- TARGET SELECTION (Doonra Banda Kaun Hai?) ---
    let targetID;

    if (Object.keys(event.mentions).length > 0) {
        // 1. Agar Mention kiya hai (e.g. #slap @Ali)
        targetID = Object.keys(event.mentions)[0];
    } else if (event.type == "message_reply") {
        // 2. Agar Reply kiya hai
        targetID = event.messageReply.senderID;
    } else {
        // 3. Agar kisi ko select nahi kiya
        return api.sendMessage(`❌ Bhai kisko ${cmd} karna hai? Mention karo ya Reply karo!`, threadID, messageID);
    }

    // Khud ko thappad nahi maar sakte (Optional logic)
    if (targetID === senderID) {
        return api.sendMessage("❌ Pagal ho gaye ho? Khud ko kyu maar rahe ho?", threadID, messageID);
    }

    // --- IMAGES LOAD KARNA ---
    // Image 1: Aap (Sender)
    const avatar1 = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    // Image 2: Dost (Target)
    const avatar2 = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

    // Loading Reaction
    api.setMessageReaction("🤜", messageID, () => {}, true);
    api.sendMessage(`⏳ **Action: ${cmd.toUpperCase()}...**`, threadID, messageID);

    try {
        let image;
        
        // --- ACTION SELECTION ---
        // Canvacord mein pehla avatar 'Action lene wala' hota hai, doosra 'Pitne wala'
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
                // Bed meme (Monster under bed style)
                image = await canvacord.Canvas.bed(avatar1, avatar2);
                break;
            default:
                return api.sendMessage("❌ Unknown action.", threadID, messageID);
        }

        // Image Save karna
        const filePath = path.join(__dirname, "cache", `${cmd}_${senderID}_${targetID}.png`);
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
