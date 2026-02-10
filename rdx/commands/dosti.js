const canvacord = require("canvacord");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "dost",
    version: "7.0.0",
    hasPermssion: 0,
    credits: "Ahmad RDX",
    description: "Slap/Kiss/Bed (Simple Version)",
    commandCategory: "img",
    usages: "[reply or mention]",
    cooldowns: 5,
    aliases: ["slap", "spank", "kiss", "bed"]
};

module.exports.run = async function ({ api, event }) {
    const { threadID, messageID, senderID, body } = event;
    
    // Command Name (e.g. #slap -> slap)
    // Simple tareeka: Body ka pehla lafz lo, # hata do
    const cmd = body.split(" ")[0].replace(/^./, "").toLowerCase();

    // --- TARGET LOGIC (Direct Copy from Friend.js) ---
    let targetID = null;

    if (event.type == "message_reply") {
        targetID = event.messageReply.senderID;
    } else if (Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
    }

    // DEBUGGING LINE (Console check karein agar error aye)
    console.log(`[RDX DEBUG] Sender: ${senderID}, Target: ${targetID}, Cmd: ${cmd}`);

    if (!targetID) {
        return api.sendMessage("🚫 Yar kisi ke msg par Reply karo ya Mention karo!", threadID, messageID);
    }

    if (targetID === senderID) return api.sendMessage("❌ Khud par try mat karo!", threadID, messageID);

    // --- ACTION ---
    api.setMessageReaction("🤜", messageID, () => {}, true);

    try {
        // Avatars
        const avatar1 = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const avatar2 = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

        let image;
        // Commands check
        if (cmd.includes("slap")) image = await canvacord.Canvas.slap(avatar1, avatar2);
        else if (cmd.includes("spank")) image = await canvacord.Canvas.spank(avatar1, avatar2);
        else if (cmd.includes("kiss")) image = await canvacord.Canvas.kiss(avatar1, avatar2);
        else if (cmd.includes("bed")) image = await canvacord.Canvas.bed(avatar1, avatar2);
        else {
             // Agar command naam match na kare to default Slap
             image = await canvacord.Canvas.slap(avatar1, avatar2);
        }

        const filePath = path.join(__dirname, "cache", `dost_action_${senderID}.png`);
        fs.writeFileSync(filePath, image);

        api.sendMessage({
            body: `🦅 **RDX ACTION: ${cmd.toUpperCase()}**`,
            attachment: fs.createReadStream(filePath)
        }, threadID, () => fs.unlinkSync(filePath), messageID);

    } catch (error) {
        console.log(error);
        api.sendMessage(`❌ Error: ${error.message}`, threadID, messageID);
    }
};
