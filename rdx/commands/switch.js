const fs = require("fs");
const path = require("path");

const statusFile = path.join(__dirname, "../cache/switch_status.json");

// default ON
if (!fs.existsSync(statusFile)) {
  fs.writeFileSync(statusFile, JSON.stringify({ enabled: true }, null, 2));
}

module.exports.config = {
  name: "switch",
  version: "2.0.0",
  hasPermssion: 2,
  credits: "Ahmad Ali Safdar",
  description: "FULL Bot ON / OFF (Global Kill Switch)",
  commandCategory: "system",
  usages: "switch on | switch off | switch status",
  cooldowns: 2
};

// 🔥 GLOBAL PATCH (runs once)
if (!global.__BOT_SWITCH_PATCHED__) {
  global.__BOT_SWITCH_PATCHED__ = true;

  const originalSend = global.api?.sendMessage;

  if (originalSend) {
    global.api.sendMessage = function (...args) {
      try {
        const data = JSON.parse(fs.readFileSync(statusFile));
        if (!data.enabled) return; // ❌ FULL SILENCE
      } catch (e) {}
      return originalSend.apply(this, args);
    };
  }
}

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;

  if (!args[0]) {
    return api.sendMessage(
      "⚙️ Usage:\n#switch on\n#switch off\n#switch status",
      threadID,
      messageID
    );
  }

  let data = JSON.parse(fs.readFileSync(statusFile));
  const action = args[0].toLowerCase();

  if (action === "off") {
    data.enabled = false;
    fs.writeFileSync(statusFile, JSON.stringify(data, null, 2));
    return api.sendMessage("🔴 Bot **FULLY OFF** ho gaya hai.\nAb koi command ka reply nahi aayega.");
  }

  if (action === "on") {
    data.enabled = true;
    fs.writeFileSync(statusFile, JSON.stringify(data, null, 2));
    return api.sendMessage("🟢 Bot **FULLY ON** ho gaya hai.");
  }

  if (action === "status") {
    return api.sendMessage(
      `🤖 Bot Status: ${data.enabled ? "🟢 ON" : "🔴 OFF"}`,
      threadID,
      messageID
    );
  }

  return api.sendMessage("⚠️ Invalid option. Use: on / off / status", threadID, messageID);
};
