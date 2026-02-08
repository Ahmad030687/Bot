const axios = require("axios");

module.exports = {
  config: {
    name: "google",
    aliases: ["ask", "ai", "search", "latest"],
    version: "3.0",
    hasPermssion: 0,
    credits: "AHMAD RDX",
    description: "Real-time AI (Last 1 minute knowledge)",
    commandCategory: "ai",
    usages: "[question]",
    cooldowns: 3
  },

  run: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const question = args.join(" ");

    if (!question) return api.sendMessage("❌ Ahmad bhai, kya search karun? Kuch likhein.", threadID, messageID);

    try {
      api.setMessageReaction("⌛", messageID, () => {}, true);

      const API_KEY = process.env.COHERE_API_KEY;

      const res = await axios.post(
        "https://api.cohere.ai/v1/chat",
        {
          model: "command-r",
          message: question,
          // 🔥 Yeh hai asli game changer: Web Search Connector
          connectors: [{ id: "web-search" }], 
          // 🧐 AI ko sakht hidayat ke internet se taaza data uthaye
          preamble: "You are Sardar RDX AI with real-time internet access. Provide the most recent information available from the web, even if it happened minutes ago. Answer in 3-4 short lines in Roman Urdu. Mention the source if it's a very fresh news.",
          temperature: 0.1, // Low temperature taake AI apni taraf se kahani na banaye, sirf facts bole
          prompt_truncation: "AUTO" 
        },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      // AI ka jawab aur references (links) uthana
      const answer = res.data.text;
      const sources = res.data.documents && res.data.documents.length > 0 
                      ? `\n\n🔗 *Source:* ${res.data.documents[0].url}` 
                      : "";

      api.setMessageReaction("✅", messageID, () => {}, true);
      
      return api.sendMessage(
        `🦅 **RDX LIVE ENGINE**\n\n${answer.trim()}${sources}`, 
        threadID, 
        messageID
      );

    } catch (e) {
      console.log(e.response?.data || e.message);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("❌ AI fail ho gaya. Key ya internet ka masla hai.", threadID, messageID);
    }
  }
};
