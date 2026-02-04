const axios = require('axios');

module.exports.config = {
    name: "mail",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Ahmad RDX",
    description: "Generate a premium fake email",
    commandCategory: "utility",
    usages: "",
    cooldowns: 5
};

module.exports.run = async ({ api, event }) => {
    // ✅ Ahmad Bhai ki Koyeb URL Integrated
    const KOYEB_URL = "https://extreme-yevette-ahmadsahab-25154971.koyeb.app"; 
    
    api.sendMessage("📧 **Ahmad RDX Secure Engine:** Initializing private mailbox...", event.threadID, event.messageID);

    try {
        const res = await axios.get(`${KOYEB_URL}/gen-mail`);
        
        if (res.data.status) {
            const { email } = res.data;
            const msg = `🦅 **PREMIUM FAKE MAIL SYSTEM**\n` +
                        `━━━━━━━━━━━━━━━━━━\n` +
                        `📩 **EMAIL:** ${email}\n` +
                        `🔑 **PASS:** AhmadRdxPassword123\n` +
                        `━━━━━━━━━━━━━━━━━━\n` +
                        `💡 **GUIDE:**\n` +
                        `Is email ko copy karke kisi bhi app ya site par dein. Jab OTP sent ho jaye, to niche wali command likhein:\n\n` +
                        `👉 \`#otp ${email}\`\n\n` +
                        `*System Powered by Ahmad RDX Cloud*`;

            return api.sendMessage(msg, event.threadID);
        } else {
            return api.sendMessage("❌ **SYSTEM ERROR:** Koyeb server not responding. Try again later.", event.threadID);
        }
    } catch (e) {
        return api.sendMessage("❌ **CRITICAL ERROR:** API connection failed!", event.threadID);
    }
};
