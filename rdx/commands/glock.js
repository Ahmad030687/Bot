const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Folder aur File Setup
const cacheDir = path.join(__dirname, "cache");
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

const pathData = path.join(cacheDir, "gclock_master.json");

module.exports.config = {
  name: "gclock", // Command ka naam change kar diya
  version: "3.0",
  hasPermssion: 1, // 1 = Admin Only
  credits: "Ahmad & Gemini",
  description: "Locks Group Name, DP, Emoji & Theme",
  commandCategory: "System",
  usages: "[lock/unlock/status]",
  prefix: true,
  cooldowns: 5
};

module.exports.onLoad = () => {
  if (!fs.existsSync(pathData)) fs.writeFileSync(pathData, JSON.stringify({}));
};

// ================== AUTOMATIC GUARD (Event Handler) ==================
module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, logMessageType, logMessageData, author } = event;
  if (author === api.getCurrentUserID()) return; // Bot ko ignore kare

  if (!fs.existsSync(pathData)) return;
  let data = JSON.parse(fs.readFileSync(pathData));

  // Agar Group Locked nahi hai to return ho jaye
  if (!data[threadID]) return;

  const saved = data[threadID];
  const delay = 3000; // 3 Second Delay (Anti-Block)

  // 1. NAME LOCK
  if (logMessageType === "log:thread-name" && saved.name) {
    if (logMessageData.name !== saved.name) {
      console.log(`Name changed in ${threadID}. Reverting...`);
      setTimeout(async () => {
        try {
          await api.setTitle(saved.name, threadID);
          api.sendMessage("🛡️ Group Name Locked hai!", threadID);
        } catch (e) {}
      }, delay);
    }
  }

  // 2. EMOJI LOCK
  if (logMessageType === "log:thread-icon" && saved.emoji) {
    if (logMessageData.thread_icon !== saved.emoji) {
      console.log(`Emoji changed in ${threadID}. Reverting...`);
      setTimeout(async () => {
        try {
          await api.changeThreadEmoji(saved.emoji, threadID);
          api.sendMessage("🛡️ Group Emoji Locked hai!", threadID);
        } catch (e) {}
      }, delay);
    }
  }

  // 3. THEME/COLOR LOCK
  if (logMessageType === "log:thread-color" && saved.color) {
    console.log(`Theme changed in ${threadID}. Reverting...`);
    setTimeout(async () => {
      try {
        await api.changeThreadColor(saved.color, threadID);
        api.sendMessage("🛡️ Group Theme Locked hai!", threadID);
      } catch (e) {}
    }, delay);
  }

  // 4. DP LOCK
  if (logMessageType === "log:thread-image" && saved.imageSrc) {
    console.log(`DP changed in ${threadID}. Reverting...`);
    api.sendMessage("🛡️ Group DP Locked hai! Restore kar raha hu...", threadID);
    
    setTimeout(async () => {
      try {
        const img = await axios.get(saved.imageSrc, { responseType: "stream" });
        api.changeGroupImage(img.data, threadID, (err) => {});
      } catch (e) {
        console.log("DP Restore Error:", e);
      }
    }, delay);
  }
};

// ================== COMMAND HANDLER ==================
module.exports.run = async function ({ api, event, args }) {
  const { threadID } = event;
  const command = args[0]?.toLowerCase();

  let data = JSON.parse(fs.readFileSync(pathData));

  // --- LOCK COMMAND ---
  if (command === "lock") {
    try {
      const info = await api.getThreadInfo(threadID);
      
      // Current Settings Save karein
      data[threadID] = {
        name: info.threadName || "No Name",
        emoji: info.emoji,
        color: info.color, // Note: Kuch modern themes API se detect nahi hoti
        imageSrc: info.imageSrc
      };

      fs.writeFileSync(pathData, JSON.stringify(data, null, 4));
      
      let msg = "╔══════════════════╗\n";
      msg +=    "║   🔒 SECURITY ACTIVE   ║\n";
      msg +=    "╚══════════════════╝\n\n";
      msg += "🛡️ Protected Settings:\n";
      msg += `✓ Name: ${info.threadName || "None"}\n`;
      msg += `✓ Emoji: ${info.emoji || "👍"}\n`;
      msg += `✓ Theme: Locked\n`;
      msg += `✓ DP: ${info.imageSrc ? "Locked" : "No DP Found"}`;

      return api.sendMessage(msg, threadID);
    } catch (e) {
      return api.sendMessage("❌ Error: Main Group Info fetch nahi kar paya.", threadID);
    }
  }

  // --- UNLOCK COMMAND ---
  if (command === "unlock") {
    if (!data[threadID]) return api.sendMessage("⚠️ Group pehle se hi Unlocked hai.", threadID);
    
    delete data[threadID];
    fs.writeFileSync(pathData, JSON.stringify(data, null, 4));
    
    return api.sendMessage("🔓 **Security Disabled:** Ab sab kuch change kiya ja sakta hai.", threadID);
  }

  // --- STATUS COMMAND ---
  if (command === "status") {
    const status = data[threadID] ? "🔒 LOCKED (Active)" : "🔓 UNLOCKED (Inactive)";
    return api.sendMessage(`System Status: ${status}`, threadID);
  }

  return api.sendMessage("⚠️ Usage:\n👉 *gclock lock\n👉 *gclock unlock\n👉 *gclock status", threadID);
};
