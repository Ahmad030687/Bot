const axios = require("axios");

module.exports.config = {
  name: "google",
  version: "8.0.0",
  hasPermssion: 0,
  credits: "AHMAD RDX",
  description: "Sirf Jawab (Max 3-4 Lines)",
  commandCategory: "Education",
  usages: "[sawal]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const query = args.join(" ");

  if (!query) return api.sendMessage("❓ Bhai, sawal to likho taake jawab doon.", threadID, messageID);

  try {
    // 🔗 Aapka Apna RDX Backend (HTML Scraper)
    const res = await axios.get(`https://yt-api-7mfm.onrender.com/api/search?q=${encodeURIComponent(query)}`);

    if (res.data.status && res.data.results.length > 0) {
      
      // 🧠 Logic: Sirf pehla result uthao
      let answer = res.data.results[0].snippet;

      // ✂️ Cutting Logic: Agar jawab 350 words se bara ho to kaat do (3-4 lines)
      if (answer.length > 350) {
        answer = answer.substring(0, 350) + "...";
      }

      // 🦅 Sirf Jawab Bhejna (Roman Urdu Header ke sath)
      return api.sendMessage(`🦅 **AHMAD RDX JAWAB:**\n━━━━━━━━━━━━━━━\n${answer}\n━━━━━━━━━━━━━━━`, threadID, messageID);

    } else {
      return api.sendMessage("❌ Iska jawab nahi mila.", threadID, messageID);
    }
  } catch (e) {
    return api.sendMessage(`❌ Error: ${e.message}`, threadID, messageID);
  }
};
