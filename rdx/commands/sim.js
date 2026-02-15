const axios = require("axios");

module.exports.config = {
  name: "sim",
  version: "12.0.0",
  hasPermssion: 0,
  credits: "AHMAD RDX",
  description: "Ahmad RDX Private API System",
  commandCategory: "Tools",
  usages: "[number]",
  cooldowns: 2
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const num = args[0];

  if (!num) return api.sendMessage("⚠️ Ahmad bhai, number to likho!\nExample: #sim 03024582854", threadID, messageID);

  // ✅ Your Private Cloudflare Worker Link
  const myApiUrl = `https://rdx-sim-api.ahmadalisafdar86.workers.dev/?q=${num}`;

  api.sendMessage(`📡 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐏𝐑𝐈𝐕𝐀𝐓𝐄 𝐒𝐄𝐑𝐕𝐄𝐑\nScanning: ${num}...`, threadID, messageID);

  try {
    const res = await axios.get(myApiUrl);
    const apiData = res.data;

    if (apiData.status === "success" && apiData.data && apiData.data.length > 0) {
      let msg = "🦅 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐒𝐈𝐌 𝐃𝐀𝐓𝐀 🦅\n━━━━━━━━━━━━━━━━━━\n";
      
      apiData.data.forEach((item, index) => {
        msg += `👤 𝐑𝐞𝐜𝐨𝐫𝐝: ${index + 1}\n`;
        msg += `📝 𝐍𝐚𝐦𝐞: ${item.Name}\n`;
        msg += `🆔 𝐂𝐍𝐈𝐂: ${item.CNIC}\n`;
        msg += `📞 𝐌𝐨𝐛𝐢𝐥𝐞: ${item.Mobile}\n`;
        msg += `🏠 𝐀𝐝𝐝𝐫𝐞𝐬𝐬: ${item.ADDRESS}\n`;
        msg += `━━━━━━━━━━━━━━━━━━\n`;
      });
      
      msg += `✅ Powered by RDX Private Cloud`;
      return api.sendMessage(msg, threadID, messageID);
    } else {
      return api.sendMessage("❌ Ahmad bhai, record nahi mila ya number galat hai.", threadID, messageID);
    }
  } catch (error) {
    console.error(error);
    return api.sendMessage("❌ Server Error! Ahmad bhai apna Worker check karein.", threadID, messageID);
  }
};
