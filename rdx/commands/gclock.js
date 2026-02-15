const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports.config = {
  name: "lockgroup",
  version: "2.0.0", // RDX Updated
  hasPermssion: 1, // Sirf Admin
  credits: "AHMAD RDX",
  description: "Anti-Change: Lock Group Name & Image",
  commandCategory: "Security",
  usages: "[on/off]",
  cooldowns: 5
};

// Data RAM mein save hoga (Restart hone par reset ho jayega)
const lockData = {}; 

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  if (!args[0]) return api.sendMessage("🦅 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗: Likhain '#lockgroup on' ya 'off'", threadID, messageID);

  if (args[0].toLowerCase() === "on") {
    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const groupName = threadInfo.threadName;
      const groupImageSrc = threadInfo.imageSrc;

      // Current Data Save kar lo
      lockData[threadID] = {
        name: groupName,
        imageSrc: groupImageSrc,
        status: true
      };

      return api.sendMessage(`🔒 𝐆𝐫𝐨𝐮𝐩 𝐋𝐨𝐜𝐤𝐞𝐝!\nName: ${groupName}\nAb koi change nahi kar payega.`, threadID, messageID);
    } catch (err) {
      return api.sendMessage("❌ Error: Main group info nahi le pa raha.", threadID, messageID);
    }
  }

  if (args[0].toLowerCase() === "off") {
    if (!lockData[threadID]) return api.sendMessage("⚠️ Group pehle se unlocked hai.", threadID, messageID);
    
    delete lockData[threadID];
    return api.sendMessage("🔓 𝐆𝐫𝐨𝐮𝐩 𝐔𝐧𝐥𝐨𝐜𝐤𝐞𝐝!", threadID, messageID);
  }
};

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, logMessageType, logMessageData } = event;

  // Agar lock nahi hai to kuch mat karo
  if (!lockData[threadID] || !lockData[threadID].status) return;

  // 🛡️ SECURITY 1: Name Change Detection
  if (logMessageType === "log:thread-name") {
    const newName = logMessageData.name;
    const oldName = lockData[threadID].name;

    if (newName !== oldName) {
      // Wapis Purana Naam Set karo
      api.setTitle(oldName, threadID, (err) => {
        if (!err) {
          api.sendMessage(`⚠️ 𝐀𝐮𝐫𝐚 𝐖𝐚𝐫𝐧𝐢𝐧𝐠!\nNaam badalna mana hai.`, threadID);
        }
      });
    }
  }

  // 🛡️ SECURITY 2: Image Change Detection
  if (logMessageType === "log:thread-image") {
    // Image wapis lagana thora heavy hota hai, isliye hum sirf warn karte hain ya wapis purani lagate hain agar URL saved ho.
    api.sendMessage(`⚠️ 𝐀𝐮𝐫𝐚 𝐖𝐚𝐫𝐧𝐢𝐧𝐠!\nGroup DP change mat karein!`, threadID);
    
    // Note: Auto-Image revert 2026 mai risky hai, isliye sirf Warning best hai.
  }
};
