const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "adc",
  version: "1.1.0",
  hasPermssion: 2,
  credits: "Ahmad Ali Safdar",
  description: "Create or update command LIVE from Messenger",
  commandCategory: "system",
  usages: "#adc filename.js <code>",
  cooldowns: 0
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, body } = event;

  const fileName = args[0];
  if (!fileName || !fileName.endsWith(".js"))
    return api.sendMessage(
      "❌ Filename missing!\nExample:\n#adc test.js\n<code>",
      threadID,
      messageID
    );

  const code = body.split("\n").slice(1).join("\n");
  if (!code.includes("module.exports"))
    return api.sendMessage(
      "❌ Invalid JS command (module.exports missing)",
      threadID,
      messageID
    );

  const cmdPath = path.join(__dirname, fileName);
  const existed = fs.existsSync(cmdPath);

  try {
    // CREATE or UPDATE
    fs.writeFileSync(cmdPath, code, "utf8");

    // HOT RELOAD
    if (require.cache[require.resolve(cmdPath)])
      delete require.cache[require.resolve(cmdPath)];

    require(cmdPath);

    api.sendMessage(
      `✅ COMMAND ${existed ? "UPDATED" : "CREATED"} LIVE\n📁 ${fileName}\n🔥 No restart / no redeploy`,
      threadID,
      messageID
    );

  } catch (err) {
    api.sendMessage(
      `❌ Failed:\n${err.message}`,
      threadID,
      messageID
    );
  }
};
