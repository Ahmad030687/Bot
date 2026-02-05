const axios = require('axios');

module.exports.config = {
    name: "stalk",
    version: "4.0.0",
    hasPermssion: 0,
    credits: "Ahmad RDX",
    description: "Get full Facebook profile details (Name, Gender, RS, Followers, etc.)",
    commandCategory: "Social Intelligence",
    usages: "[mention / reply]",
    cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
    let uid;

    // 1. Reply detection
    if (event.type == "message_reply") {
        uid = event.messageReply.senderID;
    } 
    // 2. Mention detection
    else if (Object.keys(event.mentions).length > 0) {
        uid = Object.keys(event.mentions)[0];
    } 
    // 3. Manual UID or Self
    else {
        uid = args[0] || event.senderID;
    }

    api.sendMessage("🛰️ **Ahmad RDX Intelligence:** Intercepting Meta Data Packets... ⚡", event.threadID, event.messageID);

    try {
        // 🔥 AHMAD BHAI: Ye token sabse important hai.
        // Agar ye expire ho jaye toh details nahi aayengi.
        const token = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662"; 
        
        // Requesting Deep Fields
        const url = `https://graph.facebook.com/${uid}?fields=id,name,first_name,last_name,gender,birthday,relationship_status,subscribers.limit(0).summary(true),significant_other,quotes,about,hometown&access_token=${token}`;
        
        const res = await axios.get(url);
        const d = res.data;

        // Data Processing
        const name = d.name || "N/A";
        const gender = d.gender ? d.gender.charAt(0).toUpperCase() + d.gender.slice(1) : "Hidden/Private";
        const rs = d.relationship_status || "Single / Locked 🔐";
        const bday = d.birthday || "Not Public 🗓️";
        const followers = d.subscribers ? d.subscribers.summary.total_count.toLocaleString() : "Private 👥";
        const hometown = d.hometown ? d.hometown.name : "Unknown 📍";

        // UI Design
        const report = `🦅 **AHMAD RDX STALK REPORT**\n` +
                       `━━━━━━━━━━━━━━━━━━\n` +
                       `✨ **NAME:** ${name}\n` +
                       `🆔 **UID:** ${uid}\n` +
                       `👤 **GENDER:** ${gender}\n` +
                       `🎂 **BIRTHDAY:** ${bday}\n` +
                       `👥 **FOLLOWERS:** ${followers}\n` +
                       `📍 **HOMETOWN:** ${hometown}\n` +
                       `❤️ **RELATION:** ${rs}\n` +
                       `━━━━━━━━━━━━━━━━━━\n` +
                       `*Aura: Intelligence Specialist v4*`;

        // HD Profile Picture (Crystal Clear 1500x1500px)
        const dpUrl = `https://graph.facebook.com/${uid}/picture?width=1500&height=1500&access_token=${token}`;
        const imgStream = await axios.get(dpUrl, { responseType: 'stream' });

        api.sendMessage({
            body: report,
            attachment: imgStream.data
        }, event.threadID, event.messageID);

    } catch (error) {
        console.error(error);
        api.sendMessage("❌ **Ahmad Bhai, Meta Shield Active Hai!**\nUser ne profile boht zyada 'Locked' ki hui hai ya hamara token details fetch nahi kar paa raha.", event.threadID);
    }
};
