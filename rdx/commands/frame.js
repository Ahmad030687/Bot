const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const jimp = require("jimp");

module.exports.config = {
  name: "frame",
  version: "1.0",
  hasPermssion: 0,
  credits: "Ahmad",
  description: "Frame with two profile pictures",
  commandCategory: "image",
  usages: "@mention or reply",
  cooldowns: 5
};

// frame background auto download
module.exports.onLoad = async () => {
  const dir = path.join(__dirname, "cache");
  const framePath = path.join(dir, "frame.jpg");

  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (!fs.existsSync(framePath)) {
    const img = (await axios.get("https://i.imgur.com/jcoNOZ2.jpg", {
      responseType: "arraybuffer"
    })).data;
    fs.writeFileSync(framePath, Buffer.from(img));
  }
};

async function circle(imgPath) {
  const img = await jimp.read(imgPath);
  img.circle();
  return await img.getBufferAsync("image/png");
}

async function makeImage(one, two) {
  const dir = path.join(__dirname, "cache");
  const framePath = path.join(dir, "frame.jpg");

  const avatarOne = path.join(dir, `avt_${one}.jpg`);
  const avatarTwo = path.join(dir, `avt_${two}.jpg`);
  const output = path.join(dir, `frame_${one}_${two}.jpg`);

  // avatars download
  const av1 = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512`, { responseType: "arraybuffer" })).data;
  fs.writeFileSync(avatarOne, Buffer.from(av1));

  const av2 = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512`, { responseType: "arraybuffer" })).data;
  fs.writeFileSync(avatarTwo, Buffer.from(av2));

  const base = await jimp.read(framePath);
  const c1 = await jimp.read(await circle(avatarOne));
  const c2 = await jimp.read(await circle(avatarTwo));

  // positions (same style)
  base
    .composite(c1.resize(230, 230), 540, 120)
    .composite(c2.resize(350, 350), 65, 65);

  await base.writeAsync(output);

  fs.unlinkSync(avatarOne);
  fs.unlinkSync(avatarTwo);

  return output;
}

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, senderID } = event;

  const mention = Object.keys(event.mentions);
  let target;

  if (mention[0]) target = mention[0];
  else if (event.type === "message_reply") target = event.messageReply.senderID;
  else {
    return api.sendMessage(
      "❌ Kisi ko mention karo ya uske message ka reply karo.",
      threadID,
      messageID
    );
  }

  try {
    const imgPath = await makeImage(senderID, target);

    return api.sendMessage(
      {
        body: "💜 Here is your frame",
        attachment: fs.createReadStream(imgPath)
      },
      threadID,
      () => fs.unlinkSync(imgPath),
      messageID
    );
  } catch (e) {
    return api.sendMessage("❌ Image banane me error aya.", threadID, messageID);
  }
};
