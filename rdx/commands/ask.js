const axios = require("axios");

module.exports.config = {
  name: "ask",
  version: "1.5.0",
  credits: "Ahmad RDX",
  description: "Direct To-The-Point Answer from Ahmad RDX API",
  commandCategory: "Information",
  usages: "[query]",
  cooldowns: 3
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const query = args.join(" ");

  // Agar user kuch na likhe
  if (!query) {
    return api.sendMessage("❓ Ustad ji, sawal to poochein! (e.g. #ask Pakistan kab bana)", threadID, messageID);
  }

  // Chota sa loading message (Optional)
  // api.sendMessage("🔎 Thinking...", threadID, messageID);

  try {
    // 🔗 Aapki API ka link (Render wala)
    const res = await axios.get(`https://ytdownload-8wpk.onrender.com/api/ask?q=${encodeURIComponent(query)}`);
    const data = res.data;

    if (data.status) {
      // 🦅 Sirf Jawab dikhana hai, koi faltu links ya technical data nahi
      const msg = `🦅 **AHMAD RDX ASK**\n\n💡 ${data.answer}`;
      
      return api.sendMessage(msg, threadID, messageID);
    } else {
      // Agar API status false de
      return api.sendMessage(`❌ ${data.answer || "Jawab nahi mila ustad!"}`, threadID, messageID);
    }

  } catch (error) {
    console.error(error);
    return api.sendMessage("❌ API Busy hai ya Server down hai. Dobara try karein!", threadID, messageID);
  }
};
