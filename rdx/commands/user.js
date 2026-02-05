const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "user",
  version: "1.0.0",
  hasPermssion: 2, // Sirf Admin ke liye
  credits: "SARDAR RDX",
  description: "User ko ban ya unban karein",
  commandCategory: "admin",
  usages: "ban/unban [mention/reply/UID]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID, messageReply, mentions } = event;
  const bannedPath = path.join(__dirname, "../../banned.json");
  let bannedList = JSON.parse(fs.readFileSync(bannedPath, "utf-8"));

  const action = args[0]?.toLowerCase();
  let targetID;

  // 1. Target ID dhoondna (Reply, Mention, ya Direct UID)
  if (messageReply) {
    targetID = messageReply.senderID;
  } else if (Object.keys(mentions).length > 0) {
    targetID = Object.keys(mentions)[0];
  } else if (args[1]) {
    targetID = args[1];
  }

  if (!action || !targetID) {
    return api.sendMessage("❌ Ahmad bhai, sahi tarika: #user ban/unban @mention ya reply karein.", threadID, messageID);
  }

  if (action === "ban") {
    if (bannedList.includes(targetID)) {
      return api.sendMessage("⚠️ Ye user pehle se hi RDX list mein ban hai!", threadID, messageID);
    }
    bannedList.push(targetID);
    fs.writeFileSync(bannedPath, JSON.stringify(bannedList, null, 2));
    return api.sendMessage(`🚫 [𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗] User (${targetID}) ko kamyabi se ban kar diya gaya hai. Ab bot iska reply nahi karega.`, threadID, messageID);
  } 
  
  else if (action === "unban") {
    if (!bannedList.includes(targetID)) {
      return api.sendMessage("⚠️ Ye user ban nahi hai.", threadID, messageID);
    }
    bannedList = bannedList.filter(id => id !== targetID);
    fs.writeFileSync(bannedPath, JSON.stringify(bannedList, null, 2));
    return api.sendMessage(`✅ [SARDAR RDX] User (${targetID}) ko unban kar diya gaya hai.`, threadID, messageID);
  }
};
