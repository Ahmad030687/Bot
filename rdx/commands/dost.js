const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "dost",
    aliases: ["friendship"],
    credits: "SARDAR RDX",
    category: "Graphics",
    prefix: true
  },

  async run({ api, event }) {
    const { threadID, messageID, senderID, mentions, messageReply } = event;

    let uid1 = senderID;
    let uid2;

    if (Object.keys(mentions).length > 0) {
      uid2 = Object.keys(mentions)[0];
    } else if (messageReply) {
      uid2 = messageReply.senderID;
    } else {
      return api.sendMessage("🚫 Dost ko mention ya reply karo!", threadID, messageID);
    }

    const info = await api.getUserInfo([uid1, uid2]);
    const name1 = info[uid1]?.name || "Friend 1";
    const name2 = info[uid2]?.name || "Friend 2";

    const token = "6628568379|c1e620fa708a1d5696fb991c1bde5662";
    const pfp1 = `https://graph.facebook.com/${uid1}/picture?type=large&access_token=${token}`;
    const pfp2 = `https://graph.facebook.com/${uid2}/picture?type=large&access_token=${token}`;

    const apiURL =
      `https://ytdownload-8wpk.onrender.com/api/dost` +
      `?u1=${encodeURIComponent(pfp1)}` +
      `&u2=${encodeURIComponent(pfp2)}` +
      `&n1=${encodeURIComponent(name1)}` +
      `&n2=${encodeURIComponent(name2)}`;

    const cache = path.join(__dirname, "cache");
    fs.ensureDirSync(cache);

    const imgPath = path.join(cache, `dost_${uid1}_${uid2}.png`);
    const res = await axios.get(apiURL, { responseType: "arraybuffer" });
    fs.writeFileSync(imgPath, res.data);

    await api.sendMessage({
      body: `🦅 DOSTI FRAME\n❤️ ${name1} & ${name2}`,
      attachment: fs.createReadStream(imgPath)
    }, threadID, messageID);

    setTimeout(() => {
      try { fs.unlinkSync(imgPath); } catch {}
    }, 5000);
  }
};
