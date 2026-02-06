const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const FormData = require("form-data");

module.exports = {
  config: {
    name: "dost",
    aliases: ["friendship", "bestie"],
    description: "Create Friendship Frame with REAL Profile Pictures",
    credits: "SARDAR RDX",
    usage: "dost [mention/reply/uid]",
    category: "Graphics",
    prefix: true
  },

  async run({ api, event }) {
    const { threadID, messageID, senderID } = event;

    let uid1 = senderID;
    let uid2 = null;

    // ✅ 1️⃣ Mention (FIXED)
    if (event.mentions && Object.keys(event.mentions).length > 0) {
      uid2 = Object.keys(event.mentions)[0];
    }

    // ✅ 2️⃣ Reply
    else if (event.messageReply && event.messageReply.senderID) {
      uid2 = event.messageReply.senderID;
    }

    // ✅ 3️⃣ UID fallback from message body
    else if (event.body) {
      const match = event.body.match(/\d{8,20}/);
      if (match) uid2 = match[0];
    }

    // ❌ Agar UID na mile
    if (!uid2) {
      return api.sendMessage(
        "🚫 Dost ko mention karo, reply do ya UID likho!",
        threadID,
        messageID
      );
    }

    api.sendMessage(
      "⏳ SARDAR RDX dosti frame bana raha hai...",
      threadID,
      messageID
    );

    const cacheDir = path.join(__dirname, "cache");
    fs.ensureDirSync(cacheDir);

    const token = "6628568379|c1e620fa708a1d5696fb991c1bde5662";

    const pfp1Path = path.join(cacheDir, `pfp_${uid1}.jpg`);
    const pfp2Path = path.join(cacheDir, `pfp_${uid2}.jpg`);

    try {
      // 🔽 Download REAL profile pictures
      const downloadPFP = async (uid, filePath) => {
        const url = `https://graph.facebook.com/${uid}/picture?type=large&access_token=${token}`;
        const res = await axios.get(url, { responseType: "arraybuffer" });
        fs.writeFileSync(filePath, Buffer.from(res.data));
      };

      await downloadPFP(uid1, pfp1Path);
      await downloadPFP(uid2, pfp2Path);

      // 🔼 Send images to Render API
      const form = new FormData();
      form.append("u1", fs.createReadStream(pfp1Path));
      form.append("u2", fs.createReadStream(pfp2Path));

      const renderURL = "https://ytdownload-8wpk.onrender.com/api/dost";

      const response = await axios.post(renderURL, form, {
        headers: form.getHeaders(),
        responseType: "arraybuffer",
        timeout: 20000
      });

      const finalPath = path.join(
        cacheDir,
        `dost_${uid1}_${uid2}.png`
      );
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
        "❌ Frame generate nahi hua. Render logs check karo.",
        threadID,
        messageID
      );
    }
  }
};
