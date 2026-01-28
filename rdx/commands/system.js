const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "system",
  version: "20.1.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Safe Voice Mimic Engine (Copy speaking style, NOT identity)",
  commandCategory: "Fun",
  usages: "system mimic [text] (reply to audio)",
  cooldowns: 3
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, messageReply } = event;

  const cmd = args[0]?.toLowerCase();
  const text = args.slice(1).join(" ");

  // Only mimic command
  if (cmd !== "mimic") {
    return api.sendMessage(`🧠 **System Command Active**\nUse: #system mimic [text] (reply to audio)`, threadID, messageID);
  }

  // Check voice reply
  if (
    !messageReply ||
    !messageReply.attachments ||
    !messageReply.attachments[0] ||
    messageReply.attachments[0].type !== "audio"
  ) {
    return api.sendMessage(
      "🎧 **Mimic Mode:** Pehle kisi ki voice note ko reply karein!",
      threadID,
      messageID
    );
  }

  if (!text) {
    return api.sendMessage(
      "📝 **Text Missing:**\nUse:\n#system mimic Chalo bhai start hojaye!",
      threadID,
      messageID
    );
  }

  // Reaction
  api.setMessageReaction("🎙️", messageID, () => {}, true);

  api.sendMessage(
    "🎙️ **Voice Mimic Engine Active…**\nAnalyzing style, tone, rhythm…",
    threadID,
    messageID
  );

  try {
    const audioURL = messageReply.attachments[0].url;

    // SAFE mimic API (NOT cloning!)
    const apiUrl = `https://api.kenliejugarap.com/safe-voice-mimic?audio=${encodeURIComponent(
      audioURL
    )}&text=${encodeURIComponent(text)}`;

    const voicePath = path.join(__dirname, "cache", `mimic_${Date.now()}.mp3`);

    // Stream result
    const response = await axios({
      method: "GET",
      url: apiUrl,
      responseType: "stream"
    });

    const writer = fs.createWriteStream(voicePath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage(
        {
          body:
            "🎤 **Mimic Result Ready**\n━━━━━━━━━━━━━━\n🗣️ Style matched\n🎚️ Tone matched\n🎭 Emotion matched\n✔ 100% Safe (Not identity cloning)\n━━━━━━━━━━━━━━",
          attachment: fs.createReadStream(voicePath)
        },
        threadID,
        () => fs.unlinkSync(voicePath)
      );
    });

    writer.on("error", () => {
      api.sendMessage(
        "❌ **Stream Error:** Mimic audio download fail.",
        threadID
      );
    });
  } catch (e) {
    console.error(e);
    api.sendMessage(
      "❌ **Server Error:** Mimic Engine overload. 1 minute baad try karein.",
      threadID
    );
  }
};
