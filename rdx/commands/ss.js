const axios = require('axios');

module.exports.config = {
    name: "ss",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Ahmad RDX",
    description: "Take a live HD screenshot of any website",
    commandCategory: "Cyber Hub",
    usages: "[url]",
    cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
    let url = args[0];
    if (!url) return api.sendMessage("⚠️ **Ahmad Systems:** Please provide a URL!\nExample: .ss google.com", event.threadID);

    if (!url.startsWith("http")) url = "https://" + url;

    api.sendMessage("📸 **Capturing Web View...**\nConnecting to remote browser... ⚡", event.threadID, event.messageID);

    try {
        // Professional Screenshot API
        const ssUrl = `https://image.thum.io/get/width/1200/crop/800/noanimate/${url}`;
        
        const stream = await axios.get(ssUrl, { responseType: 'stream' });

        api.sendMessage({
            body: `🦅 **WEB CAPTURE COMPLETE**\n━━━━━━━━━━━━━━━━━━\n🔗 **URL:** ${url}\n🛰️ **Status:** HD Rendered\n━━━━━━━━━━━━━━━━━━\n*Aura: Global Access ⚡*`,
            attachment: stream.data
        }, event.threadID);
    } catch (e) {
        api.sendMessage("❌ **Error:** Could not capture this website. It might be protected.", event.threadID);
    }
};
