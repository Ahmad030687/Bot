const axios = require("axios");

module.exports = {
  config: {
    name: "google",
    aliases: ["ask", "ai"],
    version: "1.2",
    hasPermssion: 0,
    credits: "AHMAD RDX",
    description: "Roman Urdu AI with Live Web Search",
    commandCategory: "ai",
    usages: "[question]",
    cooldowns: 3
  },

  run: async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    const question = args.join(" ");
    if (!question)
      return api.sendMessage("❌ Ahmad bhai, sawal toh likho.", threadID, messageID);

    try {
      api.setMessageReaction("⌛", messageID, () => {}, true);

      // --- 🔑 Apni Key Yahan Dalein ---
      const COHERE_API_KEY = "cYfX7zC87MN6OOF56kvOaJdHt0dC2Qxmx6asfg6A"; 

      const response = await axios.post(
        "https://api.cohere.ai/v1/chat",
        {
          model: "command-r", // Best for Search & Urdu
          message: question,
          // 🧐 Yeh preamble AI ko Roman Urdu aur search karne par majboor karega
          preamble: "You are Sardar RDX AI. Respond in 2-3 short lines in Roman Urdu. Use a friendly Pakistani style. Always use the web search results provided to you.",
          connectors: [{ id: "web-search" }], // 🌐 Yeh line dunya bhar ki info layegi
          temperature: 0.3
        },
        {
          headers: {
            Authorization: `Bearer ${COHERE_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      const answer = response.data.text || "Jawab nahi mil saka, ustad ji.";

      api.setMessageReaction("✅", messageID, () => {}, true);

      return api.sendMessage(
        `🦅 **SARDAR RDX AI**\n\n${answer.trim()}`,
        threadID,
        messageID
      );
    } catch (err) {
      console.log(err.response?.data || err.message);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage(
        "❌ Server busy hai ya API key expire ho gayi hai.",
        threadID,
        messageID
      );
    }
  }
};
