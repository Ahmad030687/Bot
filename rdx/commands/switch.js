const fs = require("fs");
const path = require("path");

const statusFile = path.join(__dirname, "../cache/switch_status.json");

// default ON
if (!fs.existsSync(statusFile)) {
  fs.writeFileSync(statusFile, JSON.stringify({ enabled: true }, null, 2));
}

module.exports.config = {
  name: "switch",
  aliases: ["bot"], // ✅ #bot bhi kaam karega
  version: "2.1.0",
  hasPermssion: 2,
  credits: "Ahmad Ali Safdar",
  description: "FULL Bot ON / OFF (Real-Time Kill Switch)",
  commandCategory: "system",
  usages: "switch/bot on | off | status",
  cooldowns: 2
};

// 🔥 GLOBAL PATCH (sirf aik dafa)
if (!global.__BOT_SWITCH_PATCHED__) {
  global.__BOT_SWITCH_PATCHED__ = true;

  const originalSend = global.api?.sendMessage;

  if (originalSend) {
    global.api.sendMessage = function (...args) {
      try {
        const data = JSON.parse(fs.readFileSync(statusFile));
        if (!data.enabled) return; // 🔇 FULL SILENCE
      } catch (e) {}
      return originalSend.apply(this, args);
    };
  }
}

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;

  if (!args[0]) {
    return api.sendMessage(
      "⚙️ Usage:\n#bot on\n#bot off\n#bot status",
      threadID,
      messageID
    );
  }

  let data = JSON.parse(fs.readFileSync(statusFile));
  const action = args[0].toLowerCase();

  if (action === "off") {
    data.enabled = false;
    fs.writeFileSync(statusFile, JSON.stringify(data, null, 2));
    return api.sendMessage(
      "🔴 Bot **COMPLETELY OFF** ho gaya.\nAb koi reply nahi aayega.",
      threadID,
      messageID
    );
  }

  if (action === "on") {
    data.enabled = true;
    fs.writeFileSync(statusFile, JSON.stringify(data, null, 2));
    return api.sendMessage(
      "🟢 Bot **COMPLETELY ON** ho gaya.",
      threadID,
      messageID
    );
  }

  if (action === "status") {
    return api.sendMessage(
      `🤖 Bot Status: ${data.enabled ? "🟢 ON" : "🔴 OFF"}`,
      threadID,
      messageID
    );
  }

  return api.sendMessage(
    "⚠️ Invalid option.\nUse: on / off / status",
    threadID,
    messageID
  );
};
