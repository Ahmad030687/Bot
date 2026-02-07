const axios = require("axios");

module.exports.config = {
  name: "google",
  version: "25.0.0",
  hasPermssion: 0,
  credits: "AHMAD RDX",
  description: "Real Google Search with Urdu translation",
  commandCategory: "Education",
  usages: "[sawal]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const query = args.join(" ");

  if (!query) return api.sendMessage("❓ Ustad ji, Google par kya dhoondna hai?", threadID, messageID);

  api.sendMessage("🦅 **AHMAD RDX** Google se dhoond raha hai...", threadID, messageID);

  try {
    const res = await axios.get(`https://yt-api-7mfm.onrender.com/api/smart-urdu?q=${encodeURIComponent(query)}`);

    if (res.data.status) {
      const answer = res.data.translated;
      return api.sendMessage(`🦅 **𝐆𝐎𝐎𝐆𝐋𝐄 𝐒𝐄𝐀𝐑𝐂𝐇 𝐑𝐄𝐒𝐔𝐋𝐓:**\n━━━━━━━━━━━━━━━\n${answer}\n━━━━━━━━━━━━━━━`, threadID, messageID);
    } else {
      return api.sendMessage("❌ Google par koi maloomat nahi mili.", threadID, messageID);
    }
  } catch (e) {
    return api.sendMessage("❌ Server Error: Render API check karein.", threadID, messageID);
  }
};
