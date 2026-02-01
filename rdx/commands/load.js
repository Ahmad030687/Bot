/**
 * load.js - Hot Reload Command Loader
 * Credits: Ahmad Ali Safdar
 */

const path = require("path");

module.exports.config = {
  name: "load",
  version: "1.0.0",
  hasPermssion: 2, // Admin only
  credits: "Ahmad Ali Safdar",
  description: "Load or reload an existing command instantly",
  commandCategory: "system",
  usages: "#load <command_name.js>",
  cooldowns: 0
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  if (!args[0] || !args[0].endsWith(".js"))
    return api.sendMessage("⚠️ Usage: #load <command_name.js>", threadID, messageID);

  const cmdPath = path.join(__dirname, args[0]);

  try {
    const fs = require("fs");
    if (!fs.existsSync(cmdPath))
      return api.sendMessage(`❌ Command file ${args[0]} not found!`, threadID, messageID);

    // Hot reload
    if (require.cache[require.resolve(cmdPath)])
      delete require.cache[require.resolve(cmdPath)];

    require(cmdPath);

    return api.sendMessage(
      `✅ Command loaded successfully: ${args[0]}\n🔥 Ab turant use kar sakte ho!`,
      threadID,
      messageID
    );
  } catch (err) {
    return api.sendMessage(`❌ Failed to load command: ${err.message}`, threadID, messageID);
  }
};
