const fs = require("fs-extra");
const path = "./src/models/antiban.json"; // Ya jo bhi aapka path hai

module.exports.config = {
  name: "ban",
  version: "1.0.0",
  credits: "Ahmad RDX",
  description: "Ban a user from using bot",
  commandCategory: "Admin",
  usages: "[@mention/reply]",
  cooldowns: 5,
  role: 2 // Admin Only
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID, type, messageReply, mentions } = event;
  let targetID;

  if (type == "message_reply") targetID = messageReply.senderID;
  else if (Object.keys(mentions).length > 0) targetID = Object.keys(mentions)[0];
  else return api.sendMessage("❌ Kisi bande ko reply karein ya mention!", threadID, messageID);

  if (!fs.existsSync(path)) fs.writeJsonSync(path, { bannedUsers: [] });
  let data = fs.readJsonSync(path);

  if (data.bannedUsers.includes(targetID)) {
    return api.sendMessage("⚠️ Ye banda pehle se ban hai.", threadID, messageID);
  }

  data.bannedUsers.push(targetID);
  fs.writeJsonSync(path, data);
  
  return api.sendMessage(`🚫 User ${targetID} ko ban kar diya gaya hai!`, threadID, messageID);
};
