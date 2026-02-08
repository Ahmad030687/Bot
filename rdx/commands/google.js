const axios = require("axios");

module.exports = {
  config: {
    name: "google",
    aliases: ["ask", "ai"],
    version: "4.0",
    hasPermssion: 0,
    credits: "AHMAD RDX",
    description: "AI question answering in Roman Urdu",
    commandCategory: "ai",
    usages: "[question]",
    cooldowns: 3
  },

  run: async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    const query = args.join(" ");
    if (!query)
      return api.sendMessage("❌ Apna sawal likho.", threadID, messageID);

    const API_KEY = process.env.COHERE_API_KEY;
    if (!API_KEY)
      return api.sendMessage("❌ COHERE_API_KEY ENV me set nahi.", threadID, messageID);

    let waitMsg;

    try {
      api.setMessageReaction("⌛", messageID, () => {}, true);
      waitMsg = await api.sendMessage("🔎 Soch raha hoon...", threadID);

      const response = await axios({
        method: "POST",
        url: "https://api.cohere.ai/v2/chat",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 20000,
        data: {
          model: "command-a",   // ✅ 2026 working
          messages: [
            {
              role: "user",
              content: `Roman Urdu me sirf 2 ya 3 lines me seedha jawab do:\n${query}`
            }
          ],
          temperature: 0.3
        }
      });

      const answer =
        response?.data?.message?.content?.[0]?.text || "Jawab nahi mila.";

      api.setMessageReaction("✅", messageID, () => {}, true);

      return api.sendMessage(
        { body: `🧠 AI Answer:\n\n${answer.trim()}` },
        threadID,
        () => waitMsg && api.unsendMessage(waitMsg.messageID),
        messageID
      );

    } catch (err) {
      console.log("AI ERROR:", err.response?.data || err.message);

      api.setMessageReaction("❌", messageID, () => {}, true);
      if (waitMsg) api.unsendMessage(waitMsg.messageID);

      return api.sendMessage(
        "❌ AI server se reply nahi aya.",
        threadID,
        messageID
      );
    }
  }
};
