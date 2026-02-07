const axios = require("axios");

module.exports.config = {
  name: "google",
  version: "21.0.0",
  hasPermssion: 0,
  credits: "AHMAD RDX",
  description: "RapidAPI stable search with Urdu translation",
  commandCategory: "Education",
  usages: "[aapka sawal]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const query = args.join(" ");

  // 1. Check if query is empty
  if (!query) {
    return api.sendMessage("❓ Ustad ji, kuch toh poochein! (Maslan: #google What is Bitcoin)", threadID, messageID);
  }

  // 2. Initial response (Bot is thinking)
  // Note: Typing indicator listen.js se pehle hi on ho chuka hoga
  api.sendMessage("🦅 **AHMAD RDX** maloomat ikathi kar raha hai...", threadID, messageID);

  try {
    // 3. Render API Call
    // Aapki stable API ka endpoint
    const res = await axios.get(`https://yt-api-7mfm.onrender.com/api/smart-urdu?q=${encodeURIComponent(query)}`);

    if (res.data.status) {
      const urduAnswer = res.data.translated;
      const englishOriginal = res.data.original;

      // 4. Final Formatting
      const responseMessage = 
        `🦅 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐀𝐍𝐒𝐖𝐄𝐑**\n` +
        `━━━━━━━━━━━━━━━\n\n` +
        `${urduAnswer}\n\n` +
        `━━━━━━━━━━━━━━━\n` +
        `🔍 *Original Info:* ${englishOriginal.substring(0, 100)}...`;

      return api.sendMessage(responseMessage, threadID, messageID);

    } else {
      // Agar API ke pas jawab na ho
      return api.sendMessage("❌ Maaf kijiye, is sawal ka jawab database mein nahi mila.", threadID, messageID);
    }

  } catch (error) {
    // Error handling
    console.error("Google Command Error:", error);
    return api.sendMessage("❌ Server Error: API connect nahi ho saki. Render check karein!", threadID, messageID);
  }
};
