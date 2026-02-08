const axios = require("axios");

module.exports = {
  config: {
    name: "google",
    aliases: ["ask", "ai", "search"],
    version: "3.5",
    hasPermssion: 0,
    credits: "AHMAD RDX",
    description: "Real-time AI (Render Fix)",
    commandCategory: "ai",
    usages: "[question]",
    cooldowns: 3
  },

  run: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const question = args.join(" ");

    if (!question) return api.sendMessage("❌ Sawal likho Ahmad bhai.", threadID, messageID);

    try {
      api.setMessageReaction("⌛", messageID, () => {}, true);

      // Render Dashboard se key uthayega (Check karein wahan COHERE_API_KEY hi likha hai na?)
      const API_KEY = process.env.COHERE_API_KEY;

      const res = await axios({
        method: 'post',
        url: 'https://api.cohere.ai/v1/chat',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        data: {
          model: "command-r",
          message: question,
          preamble: "Respond in 2-3 lines in Roman Urdu. Use current web info.",
          temperature: 0.3
        },
        timeout: 15000 // Render ke liye 15 sec ka intezar
      });

      const answer = res.data.text || "Jawab nahi mil saka.";

      api.setMessageReaction("✅", messageID, () => {}, true);
      return api.sendMessage(`🦅 **RDX LIVE ENGINE**\n\n${answer.trim()}`, threadID, messageID);

    } catch (e) {
      // --- 🔍 ASLI ERROR YAHA DIKHEGA ---
      let errorMsg = e.message;
      if (e.response && e.response.data) {
        errorMsg = JSON.stringify(e.response.data);
      }
      
      console.log("--- COHERE ERROR LOG ---");
      console.log(errorMsg);
      
      api.setMessageReaction("❌", messageID, () => {}, true);
      
      // Agar 401 hai toh key ka masla hai, agar 429 hai toh limit ka
      return api.sendMessage(`❌ AI fail ho gaya.\nReason: ${e.message}`, threadID, messageID);
    }
  }
};
