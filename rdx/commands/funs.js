const axios = require('axios');

module.exports.config = {
    name: "funs",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Ahmad RDX",
    description: "Create a meme from a replied photo. Use | to separate top and bottom text.",
    commandCategory: "Pro-Designer",
    usages: "[top text] | [bottom text]",
    cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
    const { type, messageReply } = event;
    const text = args.join(" ");

    // Check: Photo reply aur text dono zaroori hain
    if (type !== "message_reply" || !messageReply.attachments[0] || messageReply.attachments[0].type !== "photo") {
        return api.sendMessage("⚠️ **Ahmad Meme Lab:** Kisi photo par reply karein aur text likhein!\nExample: `.meme Jab Ahmad bhai ka | bot reply na kare`", event.threadID);
    }
    if (!text.includes("|")) {
        return api.sendMessage("⚠️ **Format Error:** Top aur Bottom text ko `|` se alag karein.\nExample: `.meme Upar wala text | Neechay wala text`", event.threadID);
    }

    api.sendMessage("🎭 **Cooking Meme...** 🔥", event.threadID, event.messageID);

    try {
        const photoUrl = messageReply.attachments[0].url;
        const [topText, bottomText] = text.split("|").map(t => t.trim()); // Text ko alag karna aur spaces hatana

        // Meme Generator API URL banana
        // Text ko URL-safe banana zaroori hai (spaces ko _ aur special chars ko encode karna)
        const safeTop = encodeURIComponent(topText.replace(/\s/g, "_") || "_");
        const safeBottom = encodeURIComponent(bottomText.replace(/\s/g, "_") || "_");
        
        const memeUrl = `https://api.memegen.link/images/custom/${safeTop}/${safeBottom}.png?background=${encodeURIComponent(photoUrl)}`;

        const stream = await axios.get(memeUrl, { responseType: 'stream' });

        api.sendMessage({
            body: `🎭 **Meme Served!**\n*Created by Ahmad RDX Bot*`,
            attachment: stream.data
        }, event.threadID, event.messageID);

    } catch (e) {
        console.error(e);
        api.sendMessage("❌ **Meme Fail:** Server busy hai, thori dair baad try karein.", event.threadID);
    }
};
