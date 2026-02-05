const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "edit",
  version: "1.5.0",
  hasPermssion: 0,
  credits: "SARDAR RDX",
  description: "Edit images using NanoBanana AI",
  commandCategory: "Media",
  usages: "[prompt] - Reply to an image",
  prefix: true,
  cooldowns: 10
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, messageReply, type } = event;

  if (type !== "message_reply" || !messageReply) {
    return api.sendMessage("⚠️ Please reply to an image with your edit prompt!", threadID, messageID);
  }

  if (!messageReply.attachments || messageReply.attachments.length === 0) {
    return api.sendMessage("❌ The message you replied to doesn't contain any image!", threadID, messageID);
  }

  const attachment = messageReply.attachments[0];
  if (attachment.type !== "photo") {
    return api.sendMessage("❌ Please reply to an image, not a " + attachment.type + "!", threadID, messageID);
  }

  const prompt = args.join(" ");
  if (!prompt) {
    return api.sendMessage("❌ Please provide an edit prompt!", threadID, messageID);
  }

  const processingMsg = await api.sendMessage(
    "🎨 Processing your image edit request...\n⏳ This may take a few moments...",
    threadID
  );

  try {
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    // FIX: Sending ONLY specific essential cookies to avoid conflicts
    // Extracted from your previous data
    const cookieData = {
        "SID": "g.a0006QiwLyYuoTfkKUVNkbYYzc9QRSFaHVYRXTHOmZdf4LcBTeWmcvb4ugiOJ7qPFxXeozSZ9gACgYKATsSARMSFQHGX2Mivx6862AkewAphnDGuxFS5BoVAUF8yKo5px01bMIwGF7rMUnLrxWB0076",
        "__Secure-1PSID": "g.a0006QiwLyYuoTfkKUVNkbYYzc9QRSFaHVYRXTHOmZdf4LcBTeWmtYFGIZFcxBGElmMMkAnM2AACgYKAToSARMSFQHGX2MiMEr6sujisKxyvMSg3hZstRoVAUF8yKrVem0XeaBxpjsCOrrjzpaN0076",
        "__Secure-1PSIDCC": "AKEyXzWXCD75z0WDXdQoC_jqWJrLsK2MadeqeMR_L4pQ_F3MWCac1qS0Leqvcj34Xts_KaTF",
        "__Secure-1PAPISID": "jfGEetuq2LhNFL1O/AFLTbRz0sk_Vmtg7Z"
    };

    // Constructing a cleaner cookie string
    const cookie = Object.entries(cookieData).map(([k, v]) => `${k}=${v}`).join("; ");
    
    const imageUrl = attachment.url;
    const apiUrl = `https://anabot.my.id/api/ai/geminiOption?prompt=${encodeURIComponent(prompt)}&type=NanoBanana&imageUrl=${encodeURIComponent(imageUrl)}&cookie=${encodeURIComponent(cookie)}&apikey=freeApikey`;

    console.log(`[Edit Command] Sending request to API...`);

    const response = await axios.get(apiUrl, {
      responseType: 'text', // Read as text first
      timeout: 90000,
      validateStatus: () => true // Always resolve, never throw on status
    });

    let data;
    try {
        data = JSON.parse(response.data);
    } catch (e) {
        throw new Error(`API returned invalid JSON. Status: ${response.status}. Body: ${response.data.substring(0, 50)}...`);
    }

    if (data.error || !data.success && !data.result) {
        const errDetail = data.details || data.error || "Unknown Error";
        throw new Error(`API Error: ${errDetail}`);
    }

    const resultUrl = data.result?.url || data.data?.result?.url || data.url;
    if (!resultUrl) throw new Error("No image URL in response");

    // Download Result
    const fileName = `edit_${Date.now()}.png`;
    const filePath = path.join(cacheDir, fileName);
    
    const imageResponse = await axios({
      url: resultUrl,
      method: "GET",
      responseType: "stream",
      timeout: 60000
    });

    const writer = fs.createWriteStream(filePath);
    imageResponse.data.pipe(writer);

    writer.on("finish", () => {
      api.unsendMessage(processingMsg.messageID);
      api.sendMessage({
          body: `✨ Image edited successfully!\n\n📝 Prompt: ${prompt}\n\n🎨 Powered by NanoBanana AI`,
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        () => fs.unlinkSync(filePath),
        messageID
      );
    });

    writer.on("error", () => {
        api.unsendMessage(processingMsg.messageID);
        api.sendMessage("❌ Failed to download image.", threadID);
    });

  } catch (error) {
    console.error("Error in edit command:", error.message);
    api.unsendMessage(processingMsg.messageID);
    
    let msg = "❌ Failed to edit image.";
    if (error.message.includes("Unexpected token")) {
        msg = "❌ API Error: The external API is blocked by Google (IP/Cookie mismatch). Cannot fix this from bot side.";
    } else {
        msg = `❌ Error: ${error.message}`;
    }
    api.sendMessage(msg, threadID, messageID);
  }
};
