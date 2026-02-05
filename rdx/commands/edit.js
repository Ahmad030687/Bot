const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "edit",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "SARDAR RDX (Gemini Official API)",
  description: "Edit images using Official Google Gemini API (Stable)",
  commandCategory: "Media",
  usages: "[prompt] (reply to an image)",
  prefix: true,
  cooldowns: 15
};

// 🔑 OFFICIAL GEMINI API KEY
const GEMINI_API_KEY = "AIzaSyBxygOjI1sPUkpxSEtuNOYOk2LutRX2Nag";

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, messageReply, type } = event;

  if (type !== "message_reply" || !messageReply?.attachments?.length) {
    return api.sendMessage(
      "⚠️ Image par reply kar ke edit prompt likho.\n\nExample:\nedit make this image cinematic",
      threadID,
      messageID
    );
  }

  const attachment = messageReply.attachments[0];
  if (attachment.type !== "photo") {
    return api.sendMessage(
      "❌ Sirf image par reply karo.",
      threadID,
      messageID
    );
  }

  const prompt = args.join(" ");
  if (!prompt) {
    return api.sendMessage(
      "❌ Edit prompt missing hai.\n\nExample:\nedit add sunglasses and blue background",
      threadID,
      messageID
    );
  }

  const processing = await api.sendMessage(
    "🎨 Image edit ho rahi hai...\n⏳ Please wait",
    threadID
  );

  try {
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    // 1️⃣ Download original image
    const imagePath = path.join(cacheDir, `input_${Date.now()}.jpg`);
    const imgRes = await axios.get(attachment.url, {
      responseType: "arraybuffer"
    });
    fs.writeFileSync(imagePath, imgRes.data);

    const imageBase64 = fs.readFileSync(imagePath, {
      encoding: "base64"
    });

    // 2️⃣ Gemini API request
    const geminiUrl =
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" +
      GEMINI_API_KEY;

    const geminiRes = await axios.post(geminiUrl, {
      contents: [
        {
          role: "user",
          parts: [
            { text: `Edit this image: ${prompt}` },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: imageBase64
              }
            }
          ]
        }
      ]
    }, {
      timeout: 60000
    });

    const parts =
      geminiRes.data?.candidates?.[0]?.content?.parts;

    const imagePart = parts?.find(p => p.inlineData);

    if (!imagePart) {
      throw new Error("No image returned from Gemini");
    }

    // 3️⃣ Save edited image
    const outputPath = path.join(cacheDir, `edit_${Date.now()}.png`);
    fs.writeFileSync(
      outputPath,
      Buffer.from(imagePart.inlineData.data, "base64")
    );

    api.unsendMessage(processing.messageID);

    api.sendMessage(
      {
        body:
          "✨ Image edited successfully!\n\n" +
          "📝 Prompt: " + prompt + "\n" +
          "🤖 Powered by Gemini AI",
        attachment: fs.createReadStream(outputPath)
      },
      threadID,
      () => {
        fs.unlinkSync(imagePath);
        fs.unlinkSync(outputPath);
      },
      messageID
    );

  } catch (err) {
    console.error("EDIT ERROR:", err.message);

    api.unsendMessage(processing.messageID);

    api.sendMessage(
      "❌ Image edit failed.\n\n📌 Reason:\n" + err.message,
      threadID,
      messageID
    );
  }
};
