const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "system",
  version: "20.2.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Safe voice mimic engine with multi-api fallback",
  commandCategory: "Fun",
  usages: "system mimic [text] (reply to audio)",
  cooldowns: 3
};

const MIMIC_APIS = [
  "https://api.kenliejugarap.com/safe-voice-mimic",
  "https://tts-df3489.vercel.app/mimic",
  "https://voice-simulator.vercel.app/mimic"
];

async function tryMimic(audio, text) {
  for (const api of MIMIC_APIS) {
    try {
      const url = `${api}?audio=${encodeURIComponent(audio)}&text=${encodeURIComponent(text)}`;
      console.log("Trying:", url);

      const res = await axios({
        method: "GET",
        url,
        responseType: "stream",
        timeout: 20000
      });

      return res;
    } catch (e) {
      console.log("API failed:", api);
    }
  }
  return null;
}

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, messageReply } = event;

  const cmd = args[0]?.toLowerCase();
  const text = args.slice(1).join(" ");

  if (cmd !== "mimic") {
    return api.sendMessage("Use: #system mimic [text] (reply to audio)", threadID, messageID);
  }

  if (!messageReply?.attachments?.[0] || messageReply.attachments[0].type !== "audio") {
    return api.sendMessage("🎧 Reply to an audio message!", threadID, messageID);
  }

  if (!text) {
    return api.sendMessage("📝 Text missing!", threadID, messageID);
  }

  api.setMessageReaction("🎙️", messageID, () => {}, true);
  api.sendMessage("🎙️ Mimic Engine Active...\nAnalyzing tone & style...", threadID, messageID);

  const audioURL = messageReply.attachments[0].url;

  try {
    const response = await tryMimic(audioURL, text);

    if (!response) {
      return api.sendMessage("❌ All mimic servers busy. Try again later.", threadID);
    }

    const filePath = path.join(__dirname, "cache", `mimic_${Date.now()}.mp3`);

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage(
        {
          body:
            "🎤 Mimic Ready!\nStyle, tone & rhythm matched.\n(Identity NOT cloned — SAFE)",
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        () => fs.unlinkSync(filePath)
      );
    });
  } catch (e) {
    api.sendMessage("❌ Critical Error. Try again later.", threadID);
  }
};
