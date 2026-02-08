const axios = require("axios");

module.exports = {
  config: {
    name: "google",
    aliases: ["ask", "ai", "search"],
    version: "5.0",
    hasPermssion: 0,
    credits: "AHMAD RDX",
    description: "2026 Updated AI Search (v2 API)",
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

      const API_KEY = process.env.COHERE_API_KEY;

      const res = await axios({
        method: 'post',
        // 🔥 Endpoint changed to v2 for 2026 compatibility
        url: 'https://api.cohere.ai/v2/chat', 
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        data: {
          model: "command-r-plus",
          messages: [
            {
              role: "user",
              content: question
            }
          ],
          // 🔥 NEW 2026 WAY: Using tools for web search
          tools: [
            {
              type: "web_search"
            }
          ],
          // Instruction for Roman Urdu
          preamble: "Respond in 2-3 lines in Roman Urdu. Use the provided web search results for the latest info."
        }
      });

      // v2 API ka response structure thora badal gaya hai
      const answer = res.data.message.content[0].text || "Jawab nahi mil saka.";

      api.setMessageReaction("✅", messageID, () => {}, true);
      return api.sendMessage(`🦅 **RDX V2 ENGINE**\n\n${answer.trim()}`, threadID, messageID);

    } catch (e) {
      console.log("--- 2026 API ERROR LOG ---");
      console.log(e.response?.data || e.message);
      
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage(`❌ AI fail ho gaya. API update ho gayi hai.`, threadID, messageID);
    }
  }
};
