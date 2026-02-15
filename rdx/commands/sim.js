const axios = require("axios");

module.exports.config = {
  name: "sim",
  version: "60.0.0",
  hasPermssion: 0,
  credits: "AHMAD RDX",
  description: "Bypass VPN Detection Security",
  commandCategory: "Tools",
  usages: "[number]",
  cooldowns: 2
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  let num = args.join("").replace(/\D/g, "");

  if (!num) return api.sendMessage("🦅 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗: Number to likho!", threadID, messageID);
  if (num.startsWith("0")) num = num.substring(1);

  api.sendMessage(`📡 𝐒𝐜𝐚𝐧𝐧𝐢𝐧𝐠 𝐃𝐚𝐭𝐚... (${num})`, threadID, messageID);

  try {
    // 🛡️ Hum direct worker link use nahi karenge, balki aik Proxy use karenge
    // Ye proxy website ko dhoka degi ke request VPN se nahi aa rahi
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://sim.f-a-k.workers.dev/?q=${num}`)}`;

    const res = await axios.get(proxyUrl);
    const data = JSON.parse(res.data.contents); // Proxy data ko parse karna parhta hai

    if (data.status === "success" && data.data && data.data.length > 0) {
      let msg = "🦅 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐃𝐀𝐓𝐀 𝐅𝐎𝐔𝐍𝐃 🦅\n━━━━━━━━━━━━━━━━━━\n";
      data.data.forEach((item, index) => {
        msg += `👤 𝐑𝐞𝐜𝐨𝐫𝐝: ${index + 1}\n📝 𝐍𝐚𝐦𝐞: ${item.Name}\n🆔 𝐂𝐍𝐈𝐂: ${item.CNIC}\n🏠 𝐀𝐝𝐝𝐫𝐞𝐬𝐬: ${item.ADDRESS}\n━━━━━━━━━━━━━━━━━━\n`;
      });
      return api.sendMessage(msg, threadID, messageID);
    } else {
      // Agar wo VPN detect kar le to ye msg show hoga
      if(data.message && data.message.includes("VPN")) {
          return api.sendMessage("⚠️ Security Block: Wo website bots ko allow nahi kar rahi. Main naya rasta dhund raha hoon...", threadID, messageID);
      }
      return api.sendMessage("❌ Record nahi mila!", threadID, messageID);
    }

  } catch (error) {
    return api.sendMessage("❌ API Server Down! Thori der baad try karein.", threadID, messageID);
  }
};
