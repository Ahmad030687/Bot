module.exports.config = {
  name: "adc",
  version: "1.6.0",
  hasPermssion: 2, 
  credits: "Ahmad Ali",
  description: "Messenger se commands folder mein file add/update karein",
  commandCategory: "system",
  usages: "adc [filename.js] [code]",
  cooldowns: 0
};

module.exports.run = async ({ api, event, args }) => {
  const fs = require('fs-extra');
  const path = require('path');
  const { threadID, messageID, senderID } = event;

  // Admin Check
  if (!global.config.ADMINBOT.includes(senderID)) {
    return api.sendMessage("❌ Sirf Ahmad Ali bhai ye command use kar sakte hain!", threadID, messageID);
  }

  const fileName = args[0];
  const content = args.slice(1).join(" ");

  if (!fileName || !content) {
    return api.sendMessage("⚠️ Sahi tarika: #adc filename.js [code]", threadID, messageID);
  }

  // Sirf commands folder ka path
  const filePath = path.join(__dirname, '..', 'commands', fileName);

  try {
    // File likhna (Create ya Update)
    fs.writeFileSync(filePath, content, "utf-8");

    api.sendMessage(`💾 **File Saved in Commands!**\n📂 Name: ${fileName}\n🔄 Loading...`, threadID, () => {
      // Nayi file ko system mein load karna
      try {
        delete require.cache[require.resolve(filePath)];
        const newCommand = require(filePath);
        if (newCommand.config && newCommand.config.name) {
          global.client.commands.set(newCommand.config.name, newCommand);
          api.sendMessage(`✅ **Done!** Command '${newCommand.config.name}' ab kaam kar rahi hai.`, threadID, messageID);
        }
      } catch (e) {
        api.sendMessage(`⚠️ File save ho gayi par load nahi hui: ${e.message}`, threadID, messageID);
      }
    }, messageID);

  } catch (error) {
    return api.sendMessage(`❌ Error: ${error.message}`, threadID, messageID);
  }
};
