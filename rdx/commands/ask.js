const axios = require("axios");

module.exports.config = {
  name: "ask",
  version: "5.5.0",
  hasPermssion: 0,
  credits: "AHMAD RDX",
  description: "Urdu short answers AI",
  commandCategory: "ai",
  usages: "[sawal]",
  cooldowns: 2
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const prompt = args.join(" ");
  if (!prompt) return api.sendMessage("🦅 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗: سوال لکھیں احمد بھائی!", threadID, messageID);

  try {
    const res = await axios.get(`https://anabot.my.id/api/ai/chatgpt?prompt=${encodeURIComponent("Give a very short answer in Urdu: " + prompt)}&apikey=freeApikey`);
    const answer = res.data.data.result.chat;
    api.sendMessage(`🦅 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐀𝐈 🦅\n━━━━━━━━━━━━━━━━━━\n${answer}\n━━━━━━━━━━━━━━━━━━`, threadID, messageID);
  } catch (error) {
    api.sendMessage("❌ اے پی آئی میں مسئلہ ہے، دوبارہ کوشش کریں۔", threadID, messageID);
  }
};
