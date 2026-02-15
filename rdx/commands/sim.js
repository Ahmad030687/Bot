const axios = require("axios");

module.exports.config = {
  name: "sim",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "AHMAD RDX",
  description: "Check SIM database details (FAK Official API)",
  commandCategory: "Tools",
  usages: "[number/cnic]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  let query = args[0];

  const rdx_header = "🦅 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐒𝐈𝐌 𝐓𝐑𝐀𝐂𝐊𝐄𝐑 🦅";
  const line = "━━━━━━━━━━━━━━━━━━";

  if (!query) {
    return api.sendMessage(`${rdx_header}\n${line}\n⚠️ Ahmad bhai, number ya CNIC to likho!\nExample: #sim 3001234567`, threadID, messageID);
  }

  api.sendMessage(`📡 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗: Searching database for "${query}"...`, threadID, messageID);

  try {
    const res = await axios.get(`https://sim.f-a-k.workers.dev/?q=${query}`);
    const apiData = res.data;

    // Check for success status and if data exists
    if (apiData.status !== "success" || !apiData.data || apiData.data.length === 0) {
      return api.sendMessage("❌ Ahmad bhai, is query ka koi record nahi mila!", threadID, messageID);
    }

    let msg = `${rdx_header}\n${line}\n`;

    // Loop through each record in the data array
    apiData.data.forEach((item, index) => {
      msg += `👤 𝐑𝐞𝐜𝐨𝐫𝐝: ${index + 1}\n`;
      msg += `📝 𝐍𝐚𝐦𝐞: ${item.Name || "Not Found"}\n`;
      msg += `🆔 𝐂𝐍𝐈𝐂: ${item.CNIC || "Not Found"}\n`;
      msg += `📞 𝐌𝐨𝐛𝐢𝐥𝐞: ${item.Mobile || "Not Found"}\n`;
      msg += `🏠 𝐀𝐝𝐝𝐫𝐞𝐬𝐬: ${item.ADDRESS || "Not Found"}\n`;
      msg += `${line}\n`;
    });

    msg += `✅ 𝐃𝐚𝐭𝐚 𝐅𝐞𝐭𝐜𝐡𝐞𝐝 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲!`;
    
    return api.sendMessage(msg, threadID, messageID);

  } catch (error) {
    console.error(error);
    return api.sendMessage("❌ API Server Error! Shayad Workers down hain.", threadID, messageID);
  }
};
