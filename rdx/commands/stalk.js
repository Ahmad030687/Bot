const axios = require('axios');
const fs = require('fs-extra');

module.exports.config = {
    name: "stalk",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "Ahmad RDX",
    description: "Get Facebook profile details & HD picture of a user",
    commandCategory: "Social Intelligence",
    usages: "[mention / reply]",
    cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
    let uid;

    // 1. Check if user replied to a message
    if (event.type == "message_reply") {
        uid = event.messageReply.senderID;
    }
    // 2. Check if user mentioned someone
    else if (Object.keys(event.mentions).length > 0) {
        uid = Object.keys(event.mentions)[0];
    }
    // 3. Fallback to user's own ID if nothing provided
    else {
        uid = args[0] || event.senderID;
    }

    if (!uid) return api.sendMessage("⚠️ **Ahmad Systems:** Please mention a user or reply to a message!", event.threadID);

    api.sendMessage("🛰️ **Scanning Facebook Database...**\nIntercepting profile data... ⚡", event.threadID, event.messageID);

    try {
        // Fetching User Details via stable API
        const res = await axios.get(`https://graph.facebook.com/${uid}?fields=id,name,first_name,last_name,link,gender,quotes,about,relationship_status,significant_other,birthday,subscribers.limit(0)&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
        
        const data = res.data;
        const name = data.name || "N/A";
        const link = data.link || `https://facebook.com/${uid}`;
        const gender = data.gender || "Not specified";
        const rs = data.relationship_status || "Single / Hidden";
        
        // HD Profile Picture URL
        const avatarUrl = `https://graph.facebook.com/${uid}/picture?width=1500&height=1500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

        const info = `🦅 **AHMAD RDX STALK REPORT**\n` +
                     `━━━━━━━━━━━━━━━━━━\n` +
                     `✨ **Name:** ${name}\n` +
                     `🆔 **UID:** ${uid}\n` +
                     `👤 **Gender:** ${gender}\n` +
                     `❤️ **Status:** ${rs}\n` +
                     `🔗 **Profile:** ${link}\n` +
                     `━━━━━━━━━━━━━━━━━━\n` +
                     `*Aura: Intelligence Specialist ⚡*`;

        // Profile Picture ko download karke as attachment bhejna
        const imgStream = await axios.get(avatarUrl, { responseType: 'stream' });

        api.sendMessage({
            body: info,
            attachment: imgStream.data
        }, event.threadID, event.messageID);

    } catch (e) {
        console.error(e);
        api.sendMessage("❌ **Critical Error:** Could not fetch details. The user might have a highly private profile.", event.threadID);
    }
};
