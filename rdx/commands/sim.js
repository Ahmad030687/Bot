const axios = require("axios");

module.exports.config = {
  name: "sim",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "AHMAD RDX",
  description: "Fixed SIM Tracker with Browser Headers",
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

  api.sendMessage(`📡 𝐒𝐞𝐚𝐫𝐜𝐡𝐢𝐧𝐠... (Direct Mode)`, threadID, messageID);

  try {
    // 🌐 Browser Headers: Taake API bot ko block na kare
    const res = await axios.get(`https://sim.f-a-k.workers.dev/?q=${encodeURIComponent(query)}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json"
      },
      timeout: 15000 // 15 seconds wait
    });

    const apiData = res.data;

    // Check if data is successful and has content
    if (apiData && apiData.status === "success" && apiData.data && apiData.data.length > 0) {
      let msg = `${rdx_header}\n${line}\n`;

      apiData.data.forEach((item, index) => {
        msg += `👤 𝐑𝐞𝐜𝐨𝐫𝐝: ${index + 1}\n`;
        msg += `📝 𝐍𝐚𝐦𝐞: ${item.Name || "N/A"}\n`;
        msg += `🆔 𝐂𝐍𝐈𝐂: ${item.CNIC || "N/A"}\n`;
        msg += `📞 𝐌𝐨𝐛𝐢𝐥𝐞: ${item.Mobile || "N/A"}\n`;
        msg += `🏠 𝐀𝐝𝐝𝐫𝐞𝐬𝐬: ${item.ADDRESS || "N/A"}\n`;
        msg += `${line}\n`;
      });

      msg += `✅ 𝐃𝐚𝐭𝐚 𝐅𝐞𝐭𝐜𝐡𝐞𝐝!`;
      return api.sendMessage(msg, threadID, messageID);
    } else {
      // Agar API status success na ho ya data empty ho
      return api.sendMessage(`❌ Ahmad bhai, API ne koi data nahi bheja. Shayad number database mein nahi hai.\n\nRaw Response: ${JSON.stringify(apiData.status || "No Status")}`, threadID, messageID);
    }

  } catch (error) {
    console.error("RDX DEBUG ERROR:", error);
    
    // Detailed error message
    let errorMsg = "❌ API Error!";
    if (error.response) errorMsg = `❌ Server Error: ${error.response.status}`;
    else if (error.request) errorMsg = "❌ No response from API (Timeout)";
    
    return api.sendMessage(errorMsg, threadID, messageID);
  }
};
