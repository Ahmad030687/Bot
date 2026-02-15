const fetch = require('node-fetch');

module.exports.config = {
  name: "sim",
  version: "5.0.0",
  hasPermssion: 0,
  credits: "AHMAD RDX",
  description: "Bypass Blocked SIM Tracker",
  commandCategory: "Tools",
  usages: "[number]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const query = args.join("");

  if (!query) return api.sendMessage("⚠️ Ahmad bhai, number to likho!", threadID, messageID);

  const rdx_header = "🦅 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐒𝐈𝐌 𝐓𝐑𝐀𝐂𝐊𝐄𝐑 🦅";
  const line = "━━━━━━━━━━━━━━━━━━";

  api.sendMessage(`📡 𝐁𝐲𝐩𝐚𝐬𝐬𝐢𝐧𝐠 𝐅𝐢𝐫𝐞𝐰𝐚𝐥𝐥... Searching: ${query}`, threadID, messageID);

  try {
    // Fetch use kar rahe hain axios ki jagah bypass ke liye
    const response = await fetch(`https://sim.f-a-k.workers.dev/?q=${query}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://sim.f-a-k.workers.dev/',
        'Origin': 'https://sim.f-a-k.workers.dev/'
      }
    });

    const apiData = await response.json();

    if (apiData.status === "success" && apiData.data && apiData.data.length > 0) {
      let msg = `${rdx_header}\n${line}\n`;

      apiData.data.forEach((item, index) => {
        msg += `👤 𝐑𝐞𝐜𝐨𝐫𝐝: ${index + 1}\n`;
        msg += `📝 𝐍𝐚𝐦𝐞: ${item.Name || "N/A"}\n`;
        msg += `🆔 𝐂𝐍𝐈𝐂: ${item.CNIC || "N/A"}\n`;
        msg += `📞 𝐌𝐨𝐛𝐢𝐥𝐞: ${item.Mobile || "N/A"}\n`;
        msg += `🏠 𝐀𝐝𝐝𝐫𝐞𝐬𝐬: ${item.ADDRESS || "N/A"}\n`;
        msg += `${line}\n`;
      });

      msg += `✅ 𝐃𝐚𝐭𝐚 𝐅𝐨𝐮𝐧𝐝 𝐛𝐲 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗`;
      return api.sendMessage(msg, threadID, messageID);
    } else {
      return api.sendMessage(`❌ Record nahi mila! API Response: ${JSON.stringify(apiData)}`, threadID, messageID);
    }

  } catch (error) {
    console.error(error);
    return api.sendMessage("❌ Connection Failed! Cloudflare ne bot ko block kar diya hai. Try again in 5 mins.", threadID, messageID);
  }
};
