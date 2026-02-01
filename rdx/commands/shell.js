const { exec } = require("child_process");

module.exports.config = {
  name: "shell",
  version: "1.0.0",
  hasPermssion: 2, // Admin only
  credits: "Ahmad Ali Safdar",
  description: "Execute shell commands & npm installs directly from Messenger",
  commandCategory: "system",
  usages: "#shell <command>",
  cooldowns: 0
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID } = event;
  if(!args[0]) return api.sendMessage("⚠️ Usage: #shell <command>", threadID, messageID);

  const command = args.join(" ");
  api.sendMessage(`💻 Running: ${command}`, threadID, messageID);

  exec(command, { maxBuffer: 1024 * 500 }, (error, stdout, stderr) => {
    if(error) return api.sendMessage(`❌ Error:\n${error.message}`, threadID, messageID);
    if(stderr) return api.sendMessage(`⚠️ Stderr:\n${stderr}`, threadID, messageID);

    // Agar output bohot bada ho to file me save karke bhej dein
    if(stdout.length > 1500) {
      const fs = require("fs");
      const path = require("path");
      const tempPath = path.join(__dirname, `/cache/shell_output_${Date.now()}.txt`);
      fs.writeFileSync(tempPath, stdout, "utf8");
      api.sendMessage({ body: "📄 Output too long, saved in file:", attachment: fs.createReadStream(tempPath)}, threadID, () => fs.unlinkSync(tempPath), messageID);
    } else {
      api.sendMessage(`✅ Output:\n${stdout}`, threadID, messageID);
    }
  });
};
