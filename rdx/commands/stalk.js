const axios = require('axios');

module.exports.config = {
    name: "stalk",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Ahmad RDX",
    description: "Get FB Profile Details",
    commandCategory: "Social Intelligence",
    usages: "[mention/reply]",
    cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
    // threadID ko event se nikalna hai, message se nahi
    const { threadID, messageID, senderID, mentions, type, messageReply } = event;
    
    let uid;
    if (type == "message_reply") {
        uid = messageReply.senderID;
    } else if (Object.keys(mentions).length > 0) {
        uid = Object.keys(mentions)[0];
    } else {
        uid = args[0] || senderID;
    }

    api.sendMessage("🛰️ **Scanning...**", threadID, messageID);

    try {
        const res = await axios.get(`https://graph.facebook.com/${uid}?fields=id,name,first_name,last_name,link,gender,relationship_status,subscribers.limit(0).summary(true)&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
        const d = res.data;

        const info = `🦅 **STALK REPORT**\n━━━━━━━━━━━━━━\n✨ **Name:** ${d.name}\n🆔 **UID:** ${uid}\n👤 **Gender:** ${d.gender || "N/A"}\n👥 **Followers:** ${d.subscribers ? d.subscribers.summary.total_count : "Private"}\n━━━━━━━━━━━━━━`;
        
        const img = `https://graph.facebook.com/${uid}/picture?width=1500&height=1500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const stream = await axios.get(img, { responseType: 'stream' });

        return api.sendMessage({ body: info, attachment: stream.data }, threadID, messageID);
    } catch (e) {
        return api.sendMessage("❌ Error: Profile is too private or token expired.", threadID, messageID);
    }
};
