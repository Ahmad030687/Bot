const axios = require("axios");

module.exports.config = {
  name: "asks",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "AHMAD RDX",
  description: "Anabot se baatein karo",
  commandCategory: "AI",
  usages: "[sawal]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const sawal = args.join(" ");

  if (!sawal) return api.sendMessage("Bhai sawal to poocho?", threadID, messageID);

  api.sendMessage("Soch raha hoon... 🤔", threadID, messageID);

  try {
    // 1. URL banaya (Anabot ka Gemini Text endpoint)
    // Note: Ye endpoint hypothetical hai, apko Anabot ki docs check karni hongi real link ke liye
    const apiUrl = `https://anabot.my.id/api/ai/gemini?prompt=${encodeURIComponent(sawal)}&apikey=freeApikey`;

    // 2. Request bheji
    const res = await axios.get(apiUrl);

    // 3. Jawab nikala (Har API ka structure alag hota hai, console.log karke check karna padta hai)
    // Maan lete hain Anabot { result: "Jawab..." } bhejta hai
    const jawab = res.data.result || res.data.data || "Jawab nahi mila yar.";

    // 4. Bhej diya
    api.sendMessage(jawab, threadID, messageID);

  } catch (error) {
    api.sendMessage("API mar gayi shayad: " + error.message, threadID, messageID);
  }
};
