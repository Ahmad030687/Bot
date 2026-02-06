const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const FormData = require("form-data");

module.exports = {
  config: {
    name: "dost",
    aliases: ["friendship", "bestie"],
    description: "Create Friendship Frame with real PFPs",
    credits: "SARDAR RDX",
    usage: "dost [mention/reply]",
    category: "Graphics",
    prefix: true
  },

  async run({ api, event }) {
    const { threadID, messageID, senderID, mentions, messageReply } = event;

    let uid1 = senderID;
    let uid2;

    // ✅ Mention / Reply detect (SAFE)
    if (mentions && Object.keys(mentions).length > 0) {
      uid2 = Object.keys(mentions)[0];
    } else if (messageReply) {
      uid2 = messageReply.senderID;
    } else {
      return api.sendMessage(
        "🚫 Dost ko mention ya uske message pe reply karo!",
        threadID,
        messageID
      );
    }

    api.sendMessage("⏳ Dostana frame ban raha hai...", threadID, messageID);

    const cacheDir = path.join(__dirname, "cache");
    fs.ensureDirSync(cacheDir);

    try {
      // ✅ USER INFO (names SAFE)
      const info = await api.getUserInfo([uid1, uid2]);
      const name1 = info[uid1]?.name || "You";
      const name2 = info[uid2]?.name || "Friend";

      // ✅ Facebook token (same as user.js)
      const token = "6628568379|c1e620fa708a1d5696fb991c1bde5662";

      const pfp1Path = path.join(cacheDir, `pfp_${uid1}.jpg`);
      const pfp2Path = path.join(cacheDir, `pfp_${uid2}.jpg`);

      const download = async (uid, filePath) => {
        const url = `https://graph.facebook.com/${uid}/picture?type=large&access_token=${token}`;
        const res = await axios.get(url, { responseType: "arraybuffer" });
        fs.writeFileSync(filePath, Buffer.from(res.data));
      };

      // ✅ Always downloads (locked IDs bhi)
      await download(uid1, pfp1Path);
      await download(uid2, pfp2Path);

      // ✅ Send to Render API
      const form = new FormData();
      form.append("u1", fs.createReadStream(pfp1Path));
      form.append("u2", fs.createReadStream(pfp2Path));
      form.append("n1", name1);
      form.append("n2", name2);

      const renderURL = "https://ytdownload-8wpk.onrender.com/api/dost";

      const response = await axios.post(renderURL, form, {
        headers: form.getHeaders(),
        responseType: "arraybuffer"
      });

      const finalPath = path.join(cacheDir, `dost_${uid1}_${uid2}.png`);
      fs.writeFileSync(finalPath, Buffer.from(response.data));

      await api.sendMessage(
        {
          body: "🦅 SARDAR RDX DOSTI FRAME 🦅",
          attachment: fs.createReadStream(finalPath)
        },
        threadID,
        messageID
      );

      // 🧹 Cleanup
      setTimeout(() => {
        [pfp1Path, pfp2Path, finalPath].forEach(f => {
          try { fs.unlinkSync(f); } catch {}
        });
      }, 5000);

    } catch (err) {
      console.error(err);
      return api.sendMessage(
        "❌ Frame generate nahi hua. Ab error crash nahi karega.",
        threadID,
        messageID
      );
    }
  }
};
