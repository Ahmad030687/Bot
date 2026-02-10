const Canvas = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "dost",
    version: "5.0.0", // Version update
    hasPermssion: 0,
    credits: "Ahmad RDX",
    description: "Royal Friendship Frame",
    commandCategory: "img",
    usages: "[mention or reply]",
    cooldowns: 5,
    aliases: ["bff", "dosti"]
};

module.exports.run = async function ({ api, event }) {
    const { threadID, messageID, senderID } = event;
    let targetID;

    // --- TARGET LOGIC ---
    // 1. Pehle Reply Check
    if (event.type == "message_reply") {
        targetID = event.messageReply.senderID;
    } 
    // 2. Phir Mention Check
    else if (Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
    } 
    else {
        return api.sendMessage("❌ Kisi dost ko Mention karo ya Reply karo!", threadID, messageID);
    }

    if (targetID === senderID) return api.sendMessage("❌ Khud par try mat karo!", threadID, messageID);

    api.setMessageReaction("💖", messageID, () => {}, true);
    api.sendMessage("✨ **Designing Your Royal Frame...**", threadID, messageID);

    try {
        // --- 1. LOAD THE FRAME & SETUP CANVAS ---
        // Yeh wo tasveer hai jo humne abhi banai hai
        const frameImageUrl = "https://i.postimg.cc/8PZkmmJG/1770355527236.png"; // Agar ye link kaam na kare to batana
        const frameBg = await Canvas.loadImage(frameImageUrl);
        
        // Canvas ka size frame ki tasveer ke barabar hoga
        const canvas = Canvas.createCanvas(frameBg.width, frameBg.height);
        const ctx = canvas.getContext("2d");

        // Sabse pehle Frame ko background ke taur par draw karte hain
        ctx.drawImage(frameBg, 0, 0, canvas.width, canvas.height);

        // --- 2. LOAD USER AVATARS ---
        const avatar1Url = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const avatar2Url = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

        const avatar1 = await Canvas.loadImage(avatar1Url);
        const avatar2 = await Canvas.loadImage(avatar2Url);

        // --- 3. FIT IMAGES INTO FRAMES ---
        // Maine frames ke coordinates aur size ka andaza lagaya hai.
        
        // Left (Gold) Frame: (Aapki Tasveer)
        // x=145, y=185, width=265, height=360 (Approx)
        ctx.drawImage(avatar1, 145, 185, 265, 360); 

        // Right (Silver) Frame: (Dost ki Tasveer)
        // x=645, y=185, width=265, height=360 (Approx)
        ctx.drawImage(avatar2, 645, 185, 265, 360);

        // --- 4. OPTIONAL: FRAME OVERLAY ---
        // Agar tasveerain frame ke kinaron se bahar nikal rahi hon, 
        // to frame ko dubara upar se draw kar dein.
        // ctx.drawImage(frameBg, 0, 0, canvas.width, canvas.height);

        // --- 5. SAVE & SEND ---
        const filePath = path.join(__dirname, "cache", `friend_royal_${senderID}.png`);
        fs.writeFileSync(filePath, canvas.toBuffer());

        api.sendMessage({
            body: `💖 **SIDE-BY-SIDE ON THE JOURNEY** 💖`,
            attachment: fs.createReadStream(filePath)
        }, threadID, () => fs.unlinkSync(filePath), messageID);

    } catch (e) {
        console.error(e);
        api.sendMessage(`❌ Error: ${e.message}`, threadID, messageID);
    }
};
