const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Paths set karein
const cacheDir = path.join(__dirname, "cache");
const pathData = path.join(cacheDir, "gclock_master.json");

module.exports.config = {
  name: "gclock",
  version: "4.0", // Version Updated
  hasPermssion: 1, // 1 = Admin Only
  credits: "Ahmad & Gemini",
  description: "Group Settings Lock (Auto-Fix)",
  commandCategory: "System",
  usages: "[lock/unlock/status]",
  prefix: true,
  cooldowns: 5
};

// --- HELPER FUNCTION: Safely Read Data ---
function loadData() {
  try {
    // 1. Agar folder nahi hai to banao
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    // 2. Agar file nahi hai to banao
    if (!fs.existsSync(pathData)) fs.writeFileSync(pathData, JSON.stringify({}));
    // 3. File read karo
    return JSON.parse(fs.readFileSync(pathData));
  } catch (e) {
    return {}; // Agar koi error aye to empty data return karo
  }
}

module.exports.onLoad = () => {
  loadData(); // Startup pe file check kar lo
};

// ================== AUTOMATIC GUARD ==================
module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, logMessageType, logMessageData, author } = event;
  if (author === api.getCurrentUserID()) return; // Bot ko ignore kare

  // File check (Direct read nahi karenge taaki crash na ho)
  if (!fs.existsSync(pathData)) return;
  
  let data = {};
  try { data = JSON.parse(fs.readFileSync(pathData)); } catch(e) { return; }

  // Agar Group Locked nahi hai to return
  if (!data[threadID]) return;

  const saved = data[threadID];
  const delay = 3000; // 3 Second Delay (Safety)

  // 1. NAME LOCK
  if (logMessageType === "log:thread-name" && saved.name) {
    if (logMessageData.name !== saved.name) {
      console.log(`Name changed detected. Reverting to: ${saved.name}`);
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
      setTimeout(async () => {
        try {
          await api.changeThreadEmoji(saved.emoji, threadID);
          api.sendMessage("🛡️ Group Emoji Locked hai!", threadID);
        } catch (e) {}
      }, delay);
    }
  }

  // 3. THEME LOCK
  if (logMessageType === "log:thread-color" && saved.color) {
    setTimeout(async () => {
      try {
        await api.changeThreadColor(saved.color, threadID);
        api.sendMessage("🛡️ Group Theme Locked hai!", threadID);
      } catch (e) {}
    }, delay);
  }

  // 4. DP LOCK
  if (logMessageType === "log:thread-image" && saved.imageSrc) {
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

// ================== COMMAND RUN ==================
module.exports.run = async function ({ api, event, args }) {
  const { threadID } = event;
  const command = args[0]?.toLowerCase();

  // Data load karo (Safe Tarike se)
  let data = loadData();

  // --- LOCK COMMAND ---
  if (command === "lock") {
    try {
      const info = await api.getThreadInfo(threadID);
      
      // Settings Save
      data[threadID] = {
        name: info.threadName || "No Name",
        emoji: info.emoji,
        color: info.color,
        imageSrc: info.imageSrc
      };

      fs.writeFileSync(pathData, JSON.stringify(data, null, 4));
      
      // Professional Menu Output
      let msg = "╔══════════════════╗\n";
      msg +=    "║   🔒 SECURITY ACTIVE   ║\n";
      msg +=    "╚══════════════════╝\n\n";
      msg += "🛡️ Settings Protected:\n";
      msg += `✓ Name: ${info.threadName || "None"}\n`;
      msg += `✓ Emoji: ${info.emoji || "👍"}\n`;
      msg += `✓ Theme: Secured\n`;
      msg += `✓ DP: ${info.imageSrc ? "Locked" : "No DP Found"}`;

      return api.sendMessage(msg, threadID);

    } catch (e) {
      return api.sendMessage("❌ Error fetching group info: " + e.message, threadID);
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
