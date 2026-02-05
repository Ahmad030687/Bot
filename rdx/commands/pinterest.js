const axios = require('axios');

module.exports.config = {
    name: "pinterest",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "Ahmad RDX",
    description: "Search HD Pinterest images with count (e.g. .pinterest aesthetic-5)",
    commandCategory: "Media Hub",
    usages: "[query] or [query-count]",
    cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
    const input = args.join(" ");
    if (!input) return api.sendMessage("⚠️ **Ahmad Systems:** Kya dhoondna hai boss?\nExample: .pinterest car-5", event.threadID);

    // Logic: Dash (-) se split karna
    let [query, count] = input.split("-");

    // Agar count nahi likha ya number nahi hai, toh default 1
    if (!count || isNaN(count)) {
        count = 1;
    }

    // Limit set karna (Max 10)
    if (count > 10) count = 10;
    if (count < 1) count = 1;

    api.sendMessage(`📥 **Ahmad Media Engine:** Searching ${count} image(s) for "${query.trim()}"... ⚡`, event.threadID, event.messageID);

    try {
        // Aapki Render API URL
        const res = await axios.get(`https://insta-pin-api.onrender.com/pinterest-api?q=${encodeURIComponent(query.trim())}&limit=${count}`);
        const data = res.data;

        if (data.status && data.result.length > 0) {
            let attachments = [];
            
            // Sab images ko stream mein convert karna
            for (let i = 0; i < data.result.length; i++) {
                const imgStream = await axios.get(data.result[i], { responseType: 'stream' });
                attachments.push(imgStream.data);
            }

            const report = `🦅 **PINTEREST HD RESULTS**\n` +
                           `━━━━━━━━━━━━━━━━━━\n` +
                           `🔍 **QUERY:** ${query.trim()}\n` +
                           `📸 **COUNT:** ${data.result.length}\n` +
                           `━━━━━━━━━━━━━━━━━━\n` +
                           `*Aura: Premium Graphics Delivery ⚡*`;

            api.sendMessage({
                body: report,
                attachment: attachments
            }, event.threadID);
        } else {
            api.sendMessage("❌ **Error:** No images found for this query.", event.threadID);
        }

    } catch (e) {
        console.error(e);
        api.sendMessage("❌ **Critical Failure:** API Server is not responding. Check your Render logs.", event.threadID);
    }
};
