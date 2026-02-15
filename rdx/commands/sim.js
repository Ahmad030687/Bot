const axios = require("axios");

module.exports.config = {
  name: "sim",
  version: "25.0.0",
  hasPermssion: 0,
  credits: "AHMAD RDX",
  description: "Final Fixed SIM Tracker",
  commandCategory: "Tools",
  usages: "[number]",
  cooldowns: 2
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  let num = args.join("");

  if (!num) return api.sendMessage("🦅 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗: Number to likho Ahmad bhai!", threadID, messageID);

  // 🛠️ Step 1: Number ko clean karein (Sirf digits rakhein)
  let cleanNum = num.replace(/\D/g, "");

  // 🛠️ Step 2: Agar number 0 se shuru ho raha hai to 0 hata dein (Qunke API 0 ke baghair result deti hai)
  if (cleanNum.startsWith("0")) {
    cleanNum = cleanNum.substring(1);
  } else if (cleanNum.startsWith("92")) {
    cleanNum = cleanNum.substring(2);
  }

  // 🔗 Aapki working API ka link
  const myApiUrl = `https://rdx-sim-api.ahmadalisafdar86.workers.dev/?q=${cleanNum}`;

  api.sendMessage(`📡 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐒𝐘𝐒𝐓𝐄𝐌\nSearching for: ${cleanNum}...`, threadID, messageID);

  try {
    const res = await axios.get(myApiUrl);
    
    // Cloudflare Worker se jo data aa raha hai usay check karein
    const responseData = res.data;
    const records = responseData.data || responseData;

    if (Array.isArray(records) && records.length > 0) {
      let msg = "🦅 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐃𝐀𝐓𝐀 𝐅𝐎𝐔𝐍𝐃 🦅\n━━━━━━━━━━━━━━━━━━\n";
      
      records.forEach((item, index) => {
        msg += `👤 𝐑𝐞𝐜𝐨𝐫𝐝: ${index + 1}\n`;
        msg += `📝 𝐍𝐚𝐦𝐞: ${item.Name || item.name || "N/A"}\n`;
        msg += `🆔 𝐂𝐍𝐈𝐂: ${item.CNIC || item.cnic || "N/A"}\n`;
        msg += `📞 𝐌𝐨𝐛𝐢𝐥𝐞: ${item.Mobile || item.number || cleanNum}\n`;
        msg += `🏠 𝐀𝐝𝐝𝐫𝐞𝐬𝐬: ${item.ADDRESS || item.address || "N/A"}\n`;
        msg += `━━━━━━━━━━━━━━━━━━\n`;
      });
      
      msg += `✅ 𝐒𝐞𝐚𝐫𝐜𝐡 𝐂𝐨𝐦𝐩𝐥𝐞𝐭𝐞𝐝`;
      return api.sendMessage(msg, threadID, messageID);
    } else {
      return api.sendMessage(`❌ Ahmad bhai, is number (${cleanNum}) ka data database mein nahi mila.\n\nType: #sim [Dusra Number]`, threadID, messageID);
    }

  } catch (error) {
    return api.sendMessage("⚠️ API Server Busy! Ahmad bhai, apna Worker dashboard check karein.", threadID, messageID);
  }
};
