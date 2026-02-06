const axios = require("axios");

module.exports.config = {
  name: "ask",
  version: "4.0.0",
  credits: "Ahmad RDX",
  description: "To-The-Point Answer",
  commandCategory: "Information",
  usages: "[sawal]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const query = args.join(" ");

  if (!query) return api.sendMessage("❓ Sawal likhein ustad!", threadID, messageID);

  try {
    // Apni Render App ka Link Lagayen
    const res = await axios.get(`https://YOUR-APP-NAME.onrender.com/api/search?q=${encodeURIComponent(query)}`);
    const data = res.data;

    if (data.status && data.answer) {
      // Sirf Jawab (No 'More Info', No Links)
      return api.sendMessage(`💡 ${data.answer}`, threadID, messageID);
    } else {
      return api.sendMessage("❌ Jawab nahi mila.", threadID, messageID);
    }

  } catch (error) {
    return api.sendMessage("❌ API Error.", threadID, messageID);
  }
};
