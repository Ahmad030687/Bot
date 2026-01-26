const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Folder Check & Create (Crash Fix)
const cacheDir = path.join(__dirname, "cache");
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

const nameFile = path.join(cacheDir, "gclock.json");
const dpFile   = path.join(cacheDir, "gcdplock.json");

module.exports.config = {
  name: "glock",
  version: "1.1",
  hasPermssion: 1, // 0=All, 1=Admin, 2=Bot Admin
  credits: "Ahmad & Gemini",
  description: "Group Name + DP Lock System",
  commandCategory: "System",
  usages: "[name/dp] [on/off]",
  prefix: true
};

module.exports.onLoad = () => {
  if (!fs.existsSync(nameFile)) fs.writeFileSync(nameFile, JSON.stringify({}));
  if (!fs.existsSync(dpFile)) fs.writeFileSync(dpFile, JSON.stringify({}));
};

// AUTO RESTORE EVENTS
module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, logMessageType, author, logMessageData } = event;

  // Ignore bot itself
  if (author === api.getCurrentUserID()) return;

  // NAME RESTORE
  if (logMessageType === "log:thread-name") {
    let nameData = JSON.parse(fs.readFileSync(nameFile));
    if (nameData[threadID] && nameData[threadID] !== logMessageData.name) {
      
      // Delay lagaya taaki FB Block na kare
      setTimeout(async () => {
        try {
          await api.setTitle(nameData[threadID], threadID);
          api.sendMessage("🛡️ Group Name Locked hai! Restore kar diya.", threadID);
        } catch (e) {
          console.log(e);
          api.sendMessage("❌ Error: Bot ko Admin banao (Name Restore).", threadID);
        }
      }, 3000); // 3 Seconds Delay
    }
  }

  // DP RESTORE
  if (logMessageType === "log:thread-image") {
    let dpData = JSON.parse(fs.readFileSync(dpFile));
    if (dpData[threadID]) {
      
      api.sendMessage("🛡️ DP Locked hai! Restore kar raha hu...", threadID);
      
      // Delay lagaya taaki FB Block na kare
      setTimeout(async () => {
        try {
          const img = await axios.get(dpData[threadID], { responseType: "stream" });
          api.changeGroupImage(img.data, threadID, (err) => {
            if (err) api.sendMessage("❌ Error: Bot ko Admin banao (DP Restore).", threadID);
          });
        } catch (e) {
          console.log(e);
        }
      }, 3000); // 3 Seconds Delay
    }
  }
};

// COMMAND RUN
module.exports.run = async function ({ api, event, args }) {
  const { threadID } = event;
  const type = args[0]?.toLowerCase();
  const onoff = args[1]?.toLowerCase();

  let nameData = JSON.parse(fs.readFileSync(nameFile));
  let dpData   = JSON.parse(fs.readFileSync(dpFile));

  // ------ NAME LOCK ------
  if (type === "name") {
    if (onoff === "on") {
      const info = await api.getThreadInfo(threadID);
      const newName = info.threadName || "No Name";
      nameData[threadID] = newName;
      fs.writeFileSync(nameFile, JSON.stringify(nameData, null, 4));
      return api.sendMessage(`🔒 Name Lock ON!\nSaved: "${newName}"`, threadID);
    }

    if (onoff === "off") {
      delete nameData[threadID];
      fs.writeFileSync(nameFile, JSON.stringify(nameData, null, 4));
      return api.sendMessage("🔓 Name Lock OFF!", threadID);
    }
  }

  // ------ DP LOCK ------
  if (type === "dp") {
    if (onoff === "on") {
      const info = await api.getThreadInfo(threadID);
      if (!info.imageSrc) return api.sendMessage("❌ Pehle Group DP lagao, phir lock karo.", threadID);

      dpData[threadID] = info.imageSrc;
      fs.writeFileSync(dpFile, JSON.stringify(dpData, null, 4));
      return api.sendMessage("🔒 DP Lock ON!", threadID);
    }

    if (onoff === "off") {
      delete dpData[threadID];
      fs.writeFileSync(dpFile, JSON.stringify(dpData, null, 4));
      return api.sendMessage("🔓 DP Lock OFF!", threadID);
    }
  }

  return api.sendMessage("⚠️ Usage:\n👉 *glock name on\n👉 *glock name off\n\n👉 *glock dp on\n👉 *glock dp off", threadID);
};
