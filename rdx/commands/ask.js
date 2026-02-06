const axios = require("axios");

module.exports.config = {
  name: "ask",
  version: "1.0.0",
  credits: "Ahmad RDX",
  description: "Premium Real-time Search Engine",
  commandCategory: "Information",
  usages: "[query]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const query = args.join(" ");

  if (!query) {
    return api.sendMessage("🔍 Ustad ji, kuch likhein toh sahi dhoondne ke liye!", threadID, messageID);
  }

  api.sendMessage(`🔎 **Searching:** "${query}"...`, threadID, messageID);

  try {
    const res = await axios.get(`https://ytdownload-8wpk.onrender.com/api/search?q=${encodeURIComponent(query)}`);
    const data = res.data;

    if (data.status && data.results.length > 0) {
      let msg = `🦅 **AHMAD RDX SEARCH ENGINE**\n\n`;
      
      // Top 3 Results dikhayenge taake message zyada lamba na ho
      data.results.slice(0, 3).forEach((item, index) => {
        msg += `Title: ${item.title}\n`;
        msg += `Link: ${item.link}\n`;
        msg += `Info: ${item.description}\n\n〰️〰️〰️〰️〰️\n\n`;
      });

      msg += `✨ Powered by Ahmad RDX AI`;
      
      return api.sendMessage(msg, threadID, messageID);
    } else {
      return api.sendMessage("❌ Koi result nahi mila ustad ji.", threadID, messageID);
    }

  } catch (error) {
    console.error(error);
    return api.sendMessage("❌ Search API mein koi masla aa gaya hai.", threadID, messageID);
  }
};
