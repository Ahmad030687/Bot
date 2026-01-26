const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Folder Check (Crash Proof)
const cacheDir = path.join(__dirname, "cache");
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

const nameFile = path.join(cacheDir, "gclock.json");
const dpFile   = path.join(cacheDir, "gcdplock.json");

module.exports.config = {
  name: "glock",
  version: "2.0",
  hasPermssion: 1, // 0=All, 1=Admin, 2=Bot Admin
  credits: "Ahmad & Gemini",
  description: "Lock Group Name & DP (Fixed)",
  commandCategory: "System",
  usages: "[name/dp] [on/off]",
  prefix: true,
  cooldowns: 5
};

module.exports.onLoad = () => {
  if (!fs.existsSync(nameFile)) fs.writeFileSync(nameFile, JSON.stringify({}));
  if (!fs.existsSync(dpFile)) fs.writeFileSync(dpFile, JSON.stringify({}));
};

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, logMessageType, author, logMessageData } = event;
  if (author === api.getCurrentUserID()) return; // Ignore Bot's own actions

  // --- NAME RESTORE ---
  if (logMessageType === "log:thread-name") {
    try {
      let nameData = JSON.parse(fs.readFileSync(nameFile));
      if (nameData[threadID] && nameData[threadID] !== logMessageData.name) {
        
        console.log(`Name changed detected in ${threadID}. Reverting...`);
        
        // 3 Seconds Delay (Safety)
        setTimeout(async () => {
          try {
            // Sahi Function: setTitle
            await api.setTitle(nameData[threadID], threadID);
            api.sendMessage("🛡️ Group Name Locked hai! Wapis set kar diya.", threadID);
          } catch (e) {
            console.error("Name Restore Error:", e);
          }
        }, 3000);
      }
    } catch (err) { console.error(err); }
  }

  // --- DP RESTORE ---
  if (logMessageType === "log:thread-image") {
    try {
      let dpData = JSON.parse(fs.readFileSync(dpFile));
      if (dpData[threadID]) {
        
        console.log(`DP changed detected in ${threadID}. Reverting...`);
        api.sendMessage("🛡️ DP Locked hai! Restore kar raha hu...", threadID);

        // 3 Seconds Delay (Safety)
        setTimeout(async () => {
          try {
            const img = await axios.get(dpData[threadID], { responseType: "stream" });
            
            // Sahi Function: changeGroupImage
            api.changeGroupImage(img.data, threadID, (err) => {
              if (err) console.error("DP Restore API Error:", err);
            });
          } catch (e) {
            console.error("DP Download Error:", e);
          }
        }, 3000);
      }
    } catch (err) { console.error(err); }
  }
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID } = event;
  const type = args[0]?.toLowerCase();
  const onoff = args[1]?.toLowerCase();

  // Load Data
  let nameData = {};
  let dpData = {};
  
  try { nameData = JSON.parse(fs.readFileSync(nameFile)); } catch {}
  try { dpData = JSON.parse(fs.readFileSync(dpFile)); } catch {}

  // --- NAME COMMANDS ---
  if (type === "name") {
    if (onoff === "on") {
      const info = await api.getThreadInfo(threadID);
      const newName = info.threadName || "No Name";
      
      nameData[threadID] = newName;
      fs.writeFileSync(nameFile, JSON.stringify(nameData, null, 4));
      return api.sendMessage(`🔒 Name Lock ON!\nSaved Name: "${newName}"`, threadID);
    }
    if (onoff === "off") {
      delete nameData[threadID];
      fs.writeFileSync(nameFile, JSON.stringify(nameData, null, 4));
      return api.sendMessage("🔓 Name Lock OFF!", threadID);
    }
  }

  // --- DP COMMANDS ---
  if (type === "dp") {
    if (onoff === "on") {
      const info = await api.getThreadInfo(threadID);
      if (!info.imageSrc) return api.sendMessage("❌ Error: Is group ki koi DP nahi hai.", threadID);

      dpData[threadID] = info.imageSrc;
      fs.writeFileSync(dpFile, JSON.stringify(dpData, null, 4));
      return api.sendMessage("🔒 DP Lock ON! Current DP save kar li gayi hai.", threadID);
    }
    if (onoff === "off") {
      delete dpData[threadID];
      fs.writeFileSync(dpFile, JSON.stringify(dpData, null, 4));
      return api.sendMessage("🔓 DP Lock OFF!", threadID);
    }
  }

  return api.sendMessage("⚠️ Wrong Format! Use:\n*glock name on/off\n*glock dp on/off", threadID);
};
        
