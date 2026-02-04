const axios = require('axios');

module.exports.config = {
    name: "otp",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Ahmad RDX",
    description: "Check inbox/OTP for generated mail",
    commandCategory: "utility",
    usages: "[email]",
    cooldowns: 2
};

module.exports.run = async ({ api, event, args }) => {
    // ✅ Ahmad Bhai ki Koyeb URL Integrated
    const KOYEB_URL = "https://extreme-yevette-ahmadsahab-25154971.koyeb.app"; 
    const email = args[0];

    if (!email) return api.sendMessage("⚠️ **MISSING INFO:** Please provide the email to check!\nExample: .inbox example@virgilian.com", event.threadID);

    api.sendMessage(`📥 **ACCESSING INBOX:** ${email}...`, event.threadID, event.messageID);

    try {
        const res = await axios.get(`${KOYEB_URL}/check-mail?email=${email}`);
        const data = res.data;

        if (data.new_mail === false) {
            return api.sendMessage("📭 **EMPTY INBOX:** No new messages found yet. Please wait 10-20 seconds and try again.", event.threadID);
        }

        // Professional Message Layout
        const msg = `📨 **NEW ENCRYPTED MAIL**\n` +
                    `━━━━━━━━━━━━━━━━━━\n` +
                    `👤 **FROM:** ${data.from}\n` +
                    `📝 **SUBJECT:** ${data.subject}\n` +
                    `━━━━━━━━━━━━━━━━━━\n\n` +
                    `📜 **MESSAGE CONTENT:**\n` +
                    `----------------------------------\n` +
                    `${data.body}\n` +
                    `----------------------------------\n\n` +
                    `⏰ **RECEIVED AT:** ${data.date}\n` +
                    `🛡️ **SECURED BY AHMAD RDX**`;

        return api.sendMessage(msg, event.threadID);

    } catch (e) {
        return api.sendMessage("❌ **INBOX ERROR:** Could not retrieve messages. The email might have expired.", event.threadID);
    }
};
