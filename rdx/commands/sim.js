const axios = require("axios");

module.exports.config = {
  name: "sim",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "AHMAD RDX",
  description: "Advanced SIM Tracker (Auto-Fix Format)",
  commandCategory: "Tools",
  usages: "[number]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  let query = args.join(" ");

  const rdx_header = "🦅 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐒𝐈𝐌 𝐓𝐑𝐀𝐂𝐊𝐄𝐑 🦅";
  const line = "━━━━━━━━━━━━━━━━━━";

  if (!query) {
    return api.sendMessage(`${rdx_header}\n${line}\n⚠️ Ahmad bhai, number likhein!\nExample: #sim 03024582854`, threadID, messageID);
  }

  // 🛠️ Auto-Fix Number Format for Pakistan
  // Step 1: Remove spaces, dashes, or plus signs
  let cleanQuery = query.replace(/[^0-9]/g, "");

  // Step 2: Convert 03xx to 923xx
  if (cleanQuery.startsWith("03")) {
    cleanQuery = "92" + cleanQuery.substring(1);
  } else if (cleanQuery.startsWith("3")) {
    cleanQuery = "92" + cleanQuery;
  }
  // Agar CNIC hai (13 digits) to usay wese hi rehne do
  if (cleanQuery.length === 13) {
    // CNIC logic (No change needed usually)
  }

  api.sendMessage(`📡 𝐒𝐞𝐚𝐫𝐜𝐡𝐢𝐧𝐠: ${cleanQuery} ...`, threadID, messageID);

  try {
    const res = await axios.get(`https://sim.f-a-k.workers.dev/?q=${cleanQuery}`);
    
    // Check Status
    if (res.data.status !== "success" || !res.data.data) {
      // Agar 92 se nahi mila, to simple format try karein (Backup Plan)
       if (cleanQuery.startsWith("92")) {
          const backupQuery = cleanQuery.substring(2); // Remove 92
          try {
             const backupRes = await axios.get(`https://sim.f-a-k.workers.dev/?q=${backupQuery}`);
             if (backupRes.data.status === "success" && backupRes.data.data) {
                return sendData(backupRes.data.data, api, threadID, messageID, rdx_header, line);
             }
          } catch(e) {}
       }
       return api.sendMessage("❌ Ahmad bhai, is number ka record database mein nahi hai.", threadID, messageID);
    }

    sendData(res.data.data, api, threadID, messageID, rdx_header, line);

  } catch (error) {
    console.error(error);
    api.sendMessage("❌ API Error! Server response nahi de raha.", threadID, messageID);
  }
};

// Helper function to send data
function sendData(data, api, threadID, messageID, header, line) {
    let msg = `${header}\n${line}\n`;
    
    data.forEach((item, index) => {
      msg += `👤 𝐑𝐞𝐜𝐨𝐫𝐝: ${index + 1}\n`;
      msg += `📝 𝐍𝐚𝐦𝐞: ${item.Name || "Unknown"}\n`;
      msg += `🆔 𝐂𝐍𝐈𝐂: ${item.CNIC || "Unknown"}\n`;
      msg += `📞 𝐌𝐨𝐛𝐢𝐥𝐞: ${item.Mobile || "Unknown"}\n`;
      msg += `🏠 𝐀𝐝𝐝𝐫𝐞𝐬𝐬: ${item.ADDRESS || "Unknown"}\n`;
      msg += `${line}\n`;
    });

    msg += `✅ 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐒𝐘𝐒𝐓𝐄𝐌`;
    api.sendMessage(msg, threadID, messageID);
}
