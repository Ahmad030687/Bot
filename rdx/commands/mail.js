const axios = require('axios');

module.exports.config = {
    name: "mail",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Ahmad RDX",
    description: "Fake temp mail generate karein",
    commandCategory: "utility",
    usages: "",
    cooldowns: 5
};

module.exports.run = async ({ api, event }) => {
    // Yahan apna KOYEB URL lagana mat bhoolna!
    const BASE_URL = "https://YOUR-APP-NAME.koyeb.app"; 
    
    api.sendMessage("📧 **Generating Ahmad Secure Mail...**", event.threadID, event.messageID);

    try {
        const res = await axios.get(`${BASE_URL}/gen-mail`);
        
        if (res.data.status) {
            const email = res.data.email;
            
            const msg = `🦅 **FAKE MAIL READY**\n` +
                        `━━━━━━━━━━━━━━━━\n` +
                        `📩 **Email:** ${email}\n` +
                        `━━━━━━━━━━━━━━━━\n` +
                        `💡 **Kaise use karein:**\n` +
                        `1. Is email ko copy karke website par dein.\n` +
                        `2. OTP dekhne ke liye likhein:\n` +
                        `👉 \`.inbox ${email}\``;

            return api.sendMessage(msg, event.threadID);
        } else {
            return api.sendMessage("❌ Server error. Dobara try karein.", event.threadID);
        }
    } catch (e) {
        return api.sendMessage("❌ API Down hai boss.", event.threadID);
    }
};
