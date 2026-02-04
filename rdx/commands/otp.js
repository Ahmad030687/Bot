const axios = require('axios');

module.exports.config = {
    name: "otp",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Ahmad RDX",
    description: "Generated mail ka inbox check karein",
    commandCategory: "utility",
    usages: "[email]",
    cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
    // Yahan apna KOYEB URL lagana mat bhoolna!
    const BASE_URL = "https://extreme-yevette-ahmadsahab-25154971.koyeb.app"; 
    
    const email = args[0];

    if (!email) {
        return api.sendMessage("❌ Aray bhai, email to likho!\nExample: .inbox ahmad@1secmail.com", event.threadID, event.messageID);
    }

    api.sendMessage(`📥 **Inbox Checking:** ${email}...`, event.threadID, event.messageID);

    try {
        const res = await axios.get(`${BASE_URL}/check-mail?email=${email}`);
        const data = res.data;

        // Agar koi nayi mail nahi hai
        if (data.new_mail === false) {
            return api.sendMessage("📭 **Inbox Khali Hai!**\nAbhi tak koi message nahi aaya. 10 second baad dobara check karein.", event.threadID);
        }

        // Agar mail aa gayi hai
        const msg = `📨 **NEW MESSAGE RECIEVED**\n` +
                    `━━━━━━━━━━━━━━━━\n` +
                    `👤 **From:** ${data.from}\n` +
                    `📝 **Subject:** ${data.subject}\n` +
                    `⏰ **Time:** ${data.date}\n` +
                    `━━━━━━━━━━━━━━━━\n\n` +
                    `📜 **Message Body:**\n${data.body}`;

        return api.sendMessage(msg, event.threadID);

    } catch (e) {
        return api.sendMessage("❌ Error: Shayad email ghalat hai ya expire ho gayi.", event.threadID);
    }
};
