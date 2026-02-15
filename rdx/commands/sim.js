const axios = require("axios");

module.exports.config = {
  name: "sim",
  version: "15.0.0",
  hasPermssion: 0,
  credits: "AHMAD RDX",
  description: "New 2026 Sim Tracker (Multi-Source)",
  commandCategory: "Tools",
  usages: "[number]",
  cooldowns: 2
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  let num = args[0];

  if (!num) return api.sendMessage("🦅 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗: Number likho bhai!", threadID, messageID);

  // Auto-format: Remove 0 or 92 from start for this new API
  let cleanNum = num.replace(/^0|^92/, "");

  api.sendMessage(`🚀 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗: Scanning New Database for ${cleanNum}...`, threadID, messageID);

  try {
    // 🛡️ Source 1: New 2026 Public DB
    const res = await axios.get(`https://api.v-p-n.workers.dev/sim?q=${cleanNum}`);
    
    // Agar ye API data de rahi hai
    if (res.data && res.data.length > 0) {
      let msg = "🦅 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐅𝐎𝐔𝐍𝐃 𝐃𝐀𝐓𝐀 🦅\n━━━━━━━━━━━━━━━━━━\n";
      
      res.data.forEach((item, index) => {
        msg += `👤 𝐑𝐞𝐜𝐨𝐫𝐝: ${index + 1}\n`;
        msg += `📝 𝐍𝐚𝐦𝐞: ${item.name || "N/A"}\n`;
        msg += `🆔 𝐂𝐍𝐈𝐂: ${item.cnic || "N/A"}\n`;
        msg += `📞 𝐍𝐮𝐦𝐛𝐞𝐫: ${item.number || cleanNum}\n`;
        msg += `🏠 𝐀𝐝𝐝𝐫𝐞𝐬𝐬: ${item.address || "N/A"}\n`;
        msg += `━━━━━━━━━━━━━━━━━━\n`;
      });
      
      return api.sendMessage(msg, threadID, messageID);
    } 
    
    // 🛡️ Source 2: Backup Source (If Source 1 fails)
    else {
        const backupRes = await axios.get(`https://tool-api.com/sim?number=${cleanNum}`);
        if(backupRes.data.success) {
            // Display backup data logic...
            return api.sendMessage("✅ Backup Data Found!", threadID);
        }
    }

    return api.sendMessage("❌ Ahmad bhai, ye number kisi bhi latest database mein nahi mila. Shayad fresh sim hai.", threadID, messageID);

  } catch (error) {
    return api.sendMessage("⚠️ System Busy! Dusri command try karein ya thori der baad.", threadID, messageID);
  }
};
