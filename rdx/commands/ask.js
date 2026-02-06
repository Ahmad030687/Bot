const axios = require("axios");

module.exports.config = {
  name: "ask",
  version: "2.0.0",
  credits: "Ahmad RDX",
  description: "Direct Answer Search",
  commandCategory: "Info",
  usages: "[query]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const query = args.join(" ");
  if (!query) return api.sendMessage("❓ Kuch poochhein ustad!", threadID);

  api.sendMessage(`🤔 Thinking: "${query}"...`, threadID, messageID);

  try {
    const res = await axios.get(`https://ytdownload-8wpk.onrender.com/api/search?q=${encodeURIComponent(query)}`);
    
    if (res.data.status && res.data.results.length > 0) {
      const topResult = res.data.results[0]; // Sirf sabse pehla result uthayenge
      const secondResult = res.data.results[1];

      // Format aisa banayenge ke ye jawab lage
      let msg = `🦅 **RDX INFORMATION**\n\n`;
      msg += `💡 **Answer:**\n${topResult.description}\n\n`; // Info ko main answer bana diya
      
      if (secondResult) {
        msg += `📖 **More Info:**\n${secondResult.description}\n\n`;
      }

      msg += `🔗 **Source:** ${topResult.link}`; // Link end mein chota sa
      
      return api.sendMessage(msg, threadID, messageID);
    } else {
      return api.sendMessage("❌ Is baray mein koi maloomat nahi mili.", threadID);
    }
  } catch (e) {
    api.sendMessage("❌ Search System Busy.", threadID);
  }
};
