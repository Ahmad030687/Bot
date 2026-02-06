const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "dost",
    aliases: ["friendship", "bestie"],
    description: "Create Friendship Frame with real FB PFPs",
    credits: "SARDAR RDX",
    usage: "dost [mention/reply]",
    category: "Graphics",
    prefix: true
  },

  async run({ api, event }) {
    const { threadID, messageID, senderID, mentions, messageReply } = event;

    let uid1 = senderID;
    let uid2;

    // ✅ Mention / Reply (SAFE)
    if (mentions && Object.keys(mentions).length > 0) {
      uid2 = Object.keys(mentions)[0];
    } else if (messageReply) {
      uid2 = messageReply.senderID;
    } else {
      return api.sendMessage(
        "🚫 Kisi dost ko mention ya reply karo!",
        threadID,
        messageID
      );
    }

    api.sendMessage("⏳ Dostana frame ban raha hai...", threadID, messageID);

    try {
      // ✅ SAME token as user.js (locked IDs bhi)
      const token = "6628568379|c1e620fa708a1d5696fb991c1bde5662";

      // ✅ Direct FB image URLs (NO download)
      const pfp1 = `https://graph.facebook.com/${uid1}/picture?type=large&access_token=${token}`;
      const pfp2 = `https://graph.facebook.com/${uid2}/picture?type=large&access_token=${token}`;

      // ✅ API expects GET + URLs
      const apiUrl =
        `https://ytdownload-8wpk.onrender.com/api/dost` +
        `?u1=${encodeURIComponent(pfp1)}` +
        `&u2=${encodeURIComponent(pfp2)}`;

      const res = await axios.get(apiUrl, {
        responseType: "arraybuffer",
        timeout: 20000
      });

      const cacheDir = path.join(__dirname, "cache");
      fs.ensureDirSync(cacheDir);

      const outPath = path.join(
        cacheDir,
        `dost_${uid1}_${uid2}.png`
      );

      fs.writeFileSync(outPath, Buffer.from(res.data));

      await api.sendMessage(
        {
          body: "🦅 SARDAR RDX DOSTI FRAME 🦅",
          attachment: fs.createReadStream(outPath)
        },
        threadID,
        messageID
      );

      setTimeout(() => {
        try { fs.unlinkSync(outPath); } catch {}
      }, 5000);

    } catch (err) {
      console.error(err);
      return api.sendMessage(
        "❌ Image load nahi hui. Ab blank frame nahi aana chahiye.",
        threadID,
        messageID
      );
    }
  }
};
