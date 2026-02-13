const os = require("os");

module.exports.config = {
  name: "upt",
  version: "5.0.0",
  hasPermssion: 0,
  credits: "AHMAD RDX",
  description: "Show RDX System uptime and status",
  commandCategory: "system",
  usages: "upt",
  cooldowns: 2
};

// 🦅 RDX TIME FORMATTER
function formatUptime(seconds) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d > 0 ? d + "𝐝 " : ""}${h}𝐡 ${m}𝐦 ${s}𝐬`;
}

// 🦅 MAIN LOGIC
async function sendRDXStatus(api, event) {
  const { threadID, messageID } = event;

  const uptime = process.uptime();
  const now = new Date();
  
  // System Stats
  const usedMem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
  const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);

  const rdx_header = "🦅 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐒𝐘𝐒𝐓𝐄𝐌 🦅";
  const line = "━━━━━━━━━━━━━━━━━━";

  // 🇵🇰 PAKISTAN TIME & DATE
  const time = now.toLocaleTimeString("en-US", { timeZone: "Asia/Karachi", hour12: true, hour: '2-digit', minute: '2-digit' });
  const date = now.toLocaleDateString("en-GB", { timeZone: "Asia/Karachi", day: "2-digit", month: "long", year: "numeric" });
  const day = now.toLocaleDateString("en-US", { timeZone: "Asia/Karachi", weekday: "long" });

  const msg = `${rdx_header}
${line}
🚀 𝐑𝐔𝐍𝐓𝐈𝐌𝐄 ➪ ${formatUptime(uptime)}
⏰ 𝐓𝐈𝐌𝐄      ➪ ${time}
📅 𝐃𝐀𝐓𝐄      ➪ ${date}
🗓️ 𝐃𝐀𝐘       ➪ ${day}
📊 𝐑𝐀𝐌       ➪ ${usedMem} MB / ${totalMem} GB
✨ 𝐒𝐓𝐀𝐓𝐔𝐒   ➪ Premium Active
${line}
🔥 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗`;

  return api.sendMessage(msg, threadID, messageID);
}

// ✅ NO-PREFIX SUPPORT (Agar koi sirf "upt" likhe)
module.exports.handleEvent = async ({ api, event }) => {
  if (!event.body) return;
  if (event.body.trim().toLowerCase() === "upt") {
    return sendRDXStatus(api, event);
  }
};

// ✅ PREFIX SUPPORT (Agar koi "!upt" likhe)
module.exports.run = async ({ api, event }) => {
  return sendRDXStatus(api, event);
};
