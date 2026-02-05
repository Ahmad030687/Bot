const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "edit",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "SARDAR RDX (Fixed by Gemini)",
  description: "Edit images using NanoBanana AI",
  commandCategory: "Media",
  usages: "[prompt] - Reply to an image",
  prefix: true,
  cooldowns: 10
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, messageReply, type } = event;

  if (type !== "message_reply" || !messageReply) {
    return api.sendMessage(
      "⚠️ Please reply to an image with your edit prompt!\n\n📝 Usage: edit [prompt]",
      threadID,
      messageID
    );
  }

  if (!messageReply.attachments || messageReply.attachments.length === 0) {
    return api.sendMessage(
      "❌ The message you replied to doesn't contain any image!",
      threadID,
      messageID
    );
  }

  const attachment = messageReply.attachments[0];
  if (attachment.type !== "photo") {
    return api.sendMessage(
      "❌ Please reply to an image only!",
      threadID,
      messageID
    );
  }

  const prompt = args.join(" ");
  if (!prompt) {
    return api.sendMessage(
      "❌ Please provide an edit prompt!",
      threadID,
      messageID
    );
  }

  const imageUrl = attachment.url;

  const processingMsg = await api.sendMessage(
    "🎨 Processing your image edit request...\n⏳ Please wait...",
    threadID
  );

  try {
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    // ✅ UPDATED COOKIE (FROM YOUR JSON – CLEAN & CORRECT)
    const cookie =
      "HSID=As6RI2N9VtlTtG_wA;" +
      "SSID=AUmJTs8SA3IBG32MK;" +
      "APISID=kJoi38dXpi617zgJ/A-mo03AzyHQVdg-IJ;" +
      "SAPISID=LNDiahU7YjO3eITT/A4JCBFbME6zDwTZT7;" +
      "SID=g.a0006AiwL2hukjGc1ZVRNKS5XWaBxI-Fj77QIGyj8Cy21eiI1o1wjWmRXyGckSNQiebYLf5EpgACgYKAVgSARMSFQHGX2MiO0_dneDdrFrNJSf8t1qtCRoVAUF8yKqXONKm2DFycalJCILVjmYu0076;" +
      "__Secure-1PSID=g.a0006AiwL2hukjGc1ZVRNKS5XWaBxI-Fj77QIGyj8Cy21eiI1o1w0shnpaJpgEyf0phdztRj3AACgYKARwSARMSFQHGX2MiQryCG9kvP0GRC7sq9MTM9RoVAUF8yKp6rtzdOATqvqqqTZ1Zhszw0076;" +
      "__Secure-3PSID=g.a0006AiwL2hukjGc1ZVRNKS5XWaBxI-Fj77QIGyj8Cy21eiI1o1wNsLYDwfK5-gnM6xL8sbmlgACgYKAYUSARMSFQHGX2Mi1XZWyT5TQqRG3nau4oJXqhoVAUF8yKoT8qoKY8qqh_cGeHt3h7L80076;" +
      "AEC=AaJma5vASPcGxMpkR37-chVxIVmv9_MDAnY1m-jrfzIpcI55jHoUhI5kDoM;" +
      "SEARCH_SAMESITE=CgQI9Z8B";

    const apiUrl = `https://anabot.my.id/api/ai/geminiOption?prompt=${encodeURIComponent(
      prompt
    )}&type=NanoBanana&imageUrl=${encodeURIComponent(
      imageUrl
    )}&cookie=${encodeURIComponent(cookie)}&apikey=freeApikey`;

    const response = await axios.get(apiUrl, {
      timeout: 60000,
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0"
      },
      validateStatus: () => true
    });

    // ❌ HTML response = cookie blocked / expired
    if (typeof response.data === "string" && response.data.trim().startsWith("<")) {
      throw new Error("API_HTML_ERROR");
    }

    const resultUrl =
      response.data?.result?.url ||
      response.data?.data?.result?.url ||
      response.data?.url;

    if (!resultUrl) {
      throw new Error("No edited image URL returned");
    }

    const filePath = path.join(cacheDir, `edit_${Date.now()}.png`);
    const img = await axios.get(resultUrl, { responseType: "stream" });

    const writer = fs.createWriteStream(filePath);
    img.data.pipe(writer);

    writer.on("finish", () => {
      api.unsendMessage(processingMsg.messageID);
      api.sendMessage(
        {
          body: `✨ Image edited successfully!\n\n📝 Prompt: ${prompt}`,
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        () => fs.unlinkSync(filePath),
        messageID
      );
    });

  } catch (err) {
    api.unsendMessage(processingMsg.messageID);
    api.sendMessage(
      "❌ Image edit failed.\n\nReason: Cookie expired / API blocked",
      threadID,
      messageID
    );
  }
};
