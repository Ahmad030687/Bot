const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const FormData = require("form-data");

module.exports = {
  config: {
    name: "dost",
    prefix: true
  },

  async run({ api, event }) {
    const { senderID, mentions, messageReply, threadID, messageID } = event;

    let uid1 = senderID;
    let uid2 = Object.keys(mentions)[0] || messageReply?.senderID;
    if (!uid2)
      return api.sendMessage("❌ Dost ko mention ya reply karo", threadID, messageID);

    const cache = path.join(__dirname, "cache");
    fs.ensureDirSync(cache);

    const token = "6628568379|c1e620fa708a1d5696fb991c1bde5662";

    const p1 = path.join(cache, `1_${uid1}.jpg`);
    const p2 = path.join(cache, `2_${uid2}.jpg`);

    const download = async (uid, p) => {
      const url = `https://graph.facebook.com/${uid}/picture?type=large&access_token=${token}`;
      const res = await axios.get(url, { responseType: "arraybuffer" });
      fs.writeFileSync(p, res.data);
    };

    await download(uid1, p1);
    await download(uid2, p2);

    const info = await api.getUserInfo([uid1, uid2]);

    const form = new FormData();
    form.append("u1", fs.createReadStream(p1));
    form.append("u2", fs.createReadStream(p2));
    form.append("name1", info[uid1].name);
    form.append("name2", info[uid2].name);

    const res = await axios.post(
      "https://ytdownload-8wpk.onrender.com/api/dost",
      form,
      { headers: form.getHeaders(), responseType: "arraybuffer" }
    );

    const out = path.join(cache, `final_${Date.now()}.png`);
    fs.writeFileSync(out, res.data);

    api.sendMessage(
      { attachment: fs.createReadStream(out) },
      threadID,
      () => fs.unlinkSync(out),
      messageID
    );
  }
};
