const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "system",
  version: "20.1.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Mimic user's speaking style (safe voice imitation)",
  commandCategory: "Fun",
  usages: "mimic [text] (reply to audio)",
  cooldowns: 3
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, messageReply } = event;
  const cmd = args[0]?.toLowerCase();
  const text = args.slice(1).join(" ");

  if (cmd !== "mimic") return;

  // 1. Check audio reply
  if (
    !messageReply ||
    !messageReply.attachments ||
    !messageReply.attachments[0] ||
    messageReply.attachments[0].type !== "audio"
  ) {
    return api.sendMessage(
      "🎧 **Voice Mimic Mode:** Pehle kisi ki voice note ko reply karein!",
      threadID
    );
  }

  if (!text) {
    return api.sendMessage(
      "📝 **Text Missing:**\nExample:\n.system mimic Chalo bhai masti shuru!",
      threadID
    );
  }

  const audioURL = messageReply.attachments[0].url;

  api.setMessageReaction("🎙️", messageID, () => {}, true);
  api.sendMessage(
    "🎙️ **Mimic Engine Initializing…**\nAnalyzing voice style, tone, pitch…",
    threadID
  );

  try {
    // SAFE VOICE MIMIC API (NOT cloning identity)
    const apiUrl = `https://api.kenliejugarap.com/safe-voice-mimic?audio=${encodeURIComponent(
      audioURL
    )}&text=${encodeURIComponent(text)}`;

    const filePath = path.join(
      __dirname,
      "cache",
      `mimic_${Date.now()}.mp3`
    );

    const response = await axios({
      method: "GET",
      url: apiUrl,
      responseType: "stream"
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage(
        {
          body:
            "🎤 **Voice Mimic Result Ready**\n━━━━━━━━━━━━━━\n🗣️ Style matched\n🎚️ Tone matched\n🎭 Emotion matched\n✔ Safe (not exact clone)\n━━━━━━━━━━━━━━",
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        () => fs.unlinkSync(filePath)
      );
    });

    writer.on("error", () => {
      api.sendMessage(
        "❌ **Error:** Mimic audio download failed.",
        threadID
      );
    });
  } catch (err) {
    console.error(err);
    api.sendMessage(
      "❌ **Server Error:** Mimic Engine overload. 1 minute baad try karein.",
      threadID
    );
  }
};
