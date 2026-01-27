const fs = require("fs-extra");

module.exports.config = {
  name: "gclock",
  version: "1.0",
  author: "RDX Stealth System",
  countDown: 2,
  role: 0,
  shortDescription: "Lock or unlock group name, dp & emoji",
  longDescription: "Real-time lock on group name, photo and emoji",
  category: "group",
  guide: {
    en: "{p}gclock on\n{p}gclock off"
  }
};

// File to save lock data
const LOCK_FILE = __dirname + "/cache/gclock_data.json";

if (!fs.existsSync(LOCK_FILE)) fs.writeJsonSync(LOCK_FILE, {});

module.exports.onLoad = () => {
  if (!fs.existsSync(LOCK_FILE)) fs.writeJsonSync(LOCK_FILE, {});
};

module.exports.onEvent = async function ({ api, event }) {
  try {
    const data = fs.readJsonSync(LOCK_FILE);
    const threadID = event.threadID;

    if (!data[threadID] || !data[threadID].locked) return;

    const lock = data[threadID];

    // Lock Name
    if (event.logMessageType === "log:thread-name" && lock.name) {
      await api.setTitle(lock.name, threadID);
    }

    // Lock Emoji
    if (event.logMessageType === "log:thread-icon" && lock.emoji) {
      await api.changeThreadEmoji(lock.emoji, threadID);
    }

    // Lock Group DP
    if (event.logMessageType === "log:thread-image" && lock.dp) {
      await api.changeGroupImage(fs.createReadStream(lock.dp), threadID);
    }

  } catch (e) {}
};

module.exports.run = async function ({ api, event }) {
  const threadID = event.threadID;
  const data = fs.readJsonSync(LOCK_FILE);
  const args = event.body.split(" ");

  // ON command
  if (args[1] === "on") {
    try {
      const info = await api.getThreadInfo(threadID);

      data[threadID] = {
        locked: true,
        name: info.threadName || "",
        emoji: info.emoji || "",
        dp: __dirname + `/cache/dp_${threadID}.jpg`
      };

      // Save DP to file
      if (info.imageSrc) {
        const axios = require("axios");
        const img = await axios.get(info.imageSrc, { responseType: "arraybuffer" });
        fs.writeFileSync(data[threadID].dp, Buffer.from(img.data));
      }

      fs.writeJsonSync(LOCK_FILE, data);

      return api.sendMessage("🔒 GROUP LOCK ENABLED\n\n✔ Name Locked\n✔ DP Locked\n✔ Emoji Locked", threadID);

    } catch (e) {
      return api.sendMessage("❌ Error while enabling lock.", threadID);
    }
  }

  // OFF command
  if (args[1] === "off") {
    data[threadID] = { locked: false };
    fs.writeJsonSync(LOCK_FILE, data);

    return api.sendMessage("🔓 GROUP LOCK DISABLED\n\nGroup Name + DP + Emoji unlocked.", threadID);
  }

  // Help
  return api.sendMessage("🔐 Usage:\n\n• gclock on → Lock name/dp/emoji\n• gclock off → Unlock all", threadID);
};
