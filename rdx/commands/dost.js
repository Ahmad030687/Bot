const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "dost",
    prefix: true
  },

  async run({ api, event }) {
    const { senderID, mentions, messageReply, threadID, messageID } = event;

    let uid1 = senderID;
    let uid2;

    if (Object.keys(mentions).length > 0) {
      uid2 = Object.keys(mentions)[0];
    } else if (messageReply) {
      uid2 = messageReply.senderID;
    } else {
      return api.sendMessage(
        "❌ Dost ko mention ya reply karo",
        threadID,
        messageID
      );
    }

    const token = "6628568379|c1e620fa708a1d5696fb991c1bde5662";

    const pfp1 = `https://graph.facebook.com/${uid1}/picture?type=large&access_token=${token}`;
    const pfp2 = `https://graph.facebook.com/${uid2}/picture?type=large&access_token=${token}`;

    const apiURL =
      `https://ytdownload-8wpk.onrender.com/api/dost` +
      `?u1=${encodeURIComponent(pfp1)}` +
      `&u2=${encodeURIComponent(pfp2)}`;

    const cacheDir = path.join(__dirname, "cache");
    fs.ensureDirSync(cacheDir);

    const imgPath = path.join(cacheDir, `dost_${uid1}_${uid2}.png`);

    const res = await axios.get(apiURL, { responseType: "arraybuffer" });
    fs.writeFileSync(imgPath, res.data);

    await api.sendMessage({
      body: "❤️ DOSTI FRAME ❤️",
      attachment: fs.createReadStream(imgPath)
    }, threadID, messageID);

    setTimeout(() => {
      try { fs.unlinkSync(imgPath); } catch {}
    }, 5000);
  }
};
