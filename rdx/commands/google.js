const axios = require("axios");

module.exports = {
  config: {
    name: "google",
    aliases: ["ask", "ai", "search"],
    version: "4.0",
    hasPermssion: 0,
    credits: "AHMAD RDX",
    description: "Latest AI Search (Fixed Model)",
    commandCategory: "ai",
    usages: "[question]",
    cooldowns: 3
  },

  run: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const question = args.join(" ");

    if (!question) return api.sendMessage("❌ Ahmad bhai, sawal toh likho!", threadID, messageID);

    try {
      api.setMessageReaction("⌛", messageID, () => {}, true);

      const API_KEY = process.env.COHERE_API_KEY;

      const res = await axios({
        method: 'post',
        url: 'https://api.cohere.ai/v2/chat',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        data: {
          // 🔥 MODEL UPDATED TO LATEST VERSION
          model: "command-r-plus", 
          message: question,
          preamble: "Respond in 2-3 lines in Roman Urdu. Use current web info. Be precise.",
          temperature: 0.3
        },
        timeout: 20000 
      });

      const answer = res.data.text || "Jawab nahi mil saka.";

      api.setMessageReaction("✅", messageID, () => {}, true);
      return api.sendMessage(`🦅 **RDX LIVE AI**\n\n${answer.trim()}`, threadID, messageID);

    } catch (e) {
      // Debugging for logs
      console.log("--- NEW ERROR LOG ---");
      console.log(e.response?.data || e.message);
      
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage(`❌ AI Error: Model update ki zaroorat hai ya key check karein.`, threadID, messageID);
    }
  }
};
