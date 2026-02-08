const axios = require("axios");

module.exports = {
  config: {
    name: "google",
    aliases: ["ask", "ai", "search"],
    version: "6.0",
    hasPermssion: 0,
    credits: "AHMAD RDX",
    description: "2026 v2 Chat API Fixed",
    commandCategory: "ai",
    usages: "[question]",
    cooldowns: 3
  },

  run: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const question = args.join(" ");

    if (!question) return api.sendMessage("❌ Ahmad bhai, sawal likho!", threadID, messageID);

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
          model: "command-r-plus",
          // 🔥 NEW: 'message' ki jagah 'messages' array use hoga
          messages: [
            {
              role: "user",
              content: question
            }
          ],
          // 🔥 NEW: Tools for internet search
          tools: [{ type: "web_search" }]
        }
      });

      // v2 Response path: res.data.message.content[0].text
      const answer = res.data.message.content[0].text;

      api.setMessageReaction("✅", messageID, () => {}, true);
      return api.sendMessage(`🦅 **RDX V2 LIVE**\n\n${answer.trim()}`, threadID, messageID);

    } catch (e) {
      // 🛠️ BETTER LOGGING: Asli wajah janne ke liye
      const errorDetail = e.response ? JSON.stringify(e.response.data, null, 2) : e.message;
      console.log("--- 🦅 RDX DEBUGGER ---");
      console.log(errorDetail);

      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage(`❌ AI Error: Check Render Logs for detail.`, threadID, messageID);
    }
  }
};
