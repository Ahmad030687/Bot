const axios = require("axios");

module.exports.config = {
  name: "sim",
  version: "13.0.0",
  hasPermssion: 0,
  credits: "AHMAD RDX",
  description: "Ahmad RDX Ultimate Tracker",
  commandCategory: "Tools",
  usages: "[number]",
  cooldowns: 2
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const num = args[0];

  if (!num) return api.sendMessage("⚠️ Number likho Ahmad bhai!", threadID, messageID);

  const myApiUrl = `https://rdx-sim-api.ahmadalisafdar86.workers.dev/?q=${num}`;

  try {
    const res = await axios.get(myApiUrl);
    // API direct data array bhej sakti hai ya status ke sath
    const dataArray = res.data.data || res.data; 

    if (Array.isArray(dataArray) && dataArray.length > 0) {
      let msg = "🦅 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐒𝐈𝐌 𝐃𝐀𝐓𝐀 🦅\n━━━━━━━━━━━━━━━━━━\n";
      
      dataArray.forEach((item, index) => {
        msg += `👤 𝐑𝐞𝐜𝐨𝐫𝐝: ${index + 1}\n`;
        msg += `📝 𝐍𝐚𝐦𝐞: ${item.Name || item.name || "N/A"}\n`;
        msg += `🆔 𝐂𝐍𝐈𝐂: ${item.CNIC || item.cnic || "N/A"}\n`;
        msg += `📞 𝐌𝐨𝐛𝐢𝐥𝐞: ${item.Mobile || item.number || "N/A"}\n`;
        msg += `🏠 𝐀𝐝𝐝𝐫𝐞𝐬𝐬: ${item.ADDRESS || item.address || "N/A"}\n`;
        msg += `━━━━━━━━━━━━━━━━━━\n`;
      });
      
      return api.sendMessage(msg, threadID, messageID);
    } else {
      return api.sendMessage("❌ Record nahi mila! Shayad ye number database mein mojud nahi.", threadID, messageID);
    }
  } catch (error) {
    return api.sendMessage("❌ Connection Error! Ahmad bhai apna worker check karein.", threadID, messageID);
  }
};
