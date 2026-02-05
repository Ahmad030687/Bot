const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "edit",
  version: "1.2.0",
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
      "❌ Please reply to an image, not a " + attachment.type + "!",
      threadID,
      messageID
    );
  }

  const prompt = args.join(" ");
  if (!prompt) {
    return api.sendMessage(
      "❌ Please provide an edit prompt!\n\n📝 Usage: edit [prompt]",
      threadID,
      messageID
    );
  }

  const imageUrl = attachment.url;

  const processingMsg = await api.sendMessage(
    "🎨 Processing your image edit request...\n⏳ This may take a few moments...",
    threadID
  );

  try {
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir);
    }

    // UPDATED: Fresh Cookie String
    const cookie = "HSID=As6RI2N9VtlTtG_wA; SSID=AUmJTs8SA3IBG32MK; APISID=kJoi38dXpi617zgJ/A-mo03AzyHQVdg-IJ; SAPISID=LNDiahU7YjO3eITT/A4JCBFbME6zDwTZT7; __Secure-1PAPISID=LNDiahU7YjO3eITT/A4JCBFbME6zDwTZT7; __Secure-3PAPISID=LNDiahU7YjO3eITT/A4JCBFbME6zDwTZT7; AEC=AaJma5vASPcGxMpkR37-chVxIVmv9_MDAnY1m-jrfzIpcI55jHoUhI5kDoM; SEARCH_SAMESITE=CgQI9Z8B; SID=g.a0006AiwL2hukjGc1ZVRNKS5XWaBxI-Fj77QIGyj8Cy21eiI1o1wjWmRXyGckSNQiebYLf5EpgACgYKAVgSARMSFQHGX2MiO0_dneDdrFrNJSf8t1qtCRoVAUF8yKqXONKm2DFycalJCILVjmYu0076; __Secure-1PSID=g.a0006AiwL2hukjGc1ZVRNKS5XWaBxI-Fj77QIGyj8Cy21eiI1o1w0shnpaJpgEyf0phdztRj3AACgYKARwSARMSFQHGX2MiQryCG9kvP0GRC7sq9MTM9RoVAUF8yKp6rtzdOATqvqqqTZ1Zhszw0076; __Secure-3PSID=g.a0006AiwL2hukjGc1ZVRNKS5XWaBxI-Fj77QIGyj8Cy21eiI1o1wNsLYDwfK5-gnM6xL8sbmlgACgYKAYUSARMSFQHGX2Mi1XZWyT5TQqRG3nau4oJXqhoVAUF8yKoT8qoKY8qqh_cGeHt3h7L80076;";
    
    const apiUrl = `https://anabot.my.id/api/ai/geminiOption?prompt=${encodeURIComponent(prompt)}&type=NanoBanana&imageUrl=${encodeURIComponent(imageUrl)}&cookie=${encodeURIComponent(cookie)}&apikey=freeApikey`;

    // 1. Request as TEXT first to avoid JSON parse errors
    const response = await axios.get(apiUrl, {
      responseType: 'text', // Forces Axios to NOT parse JSON automatically
      timeout: 60000
    });

    // 2. Manual JSON Parsing with Error Check
    let data;
    try {
        data = JSON.parse(response.data);
    } catch (e) {
        // If parsing fails, it's HTML
        if (response.data.includes("<!doctype html>") || response.data.includes("<html>")) {
            throw new Error("API_DOWN_HTML");
        }
        throw new Error("API returned invalid data (Not JSON)");
    }

    // 3. Handle Logical Errors
    if (data.status === 500 || data.error) {
      throw new Error(`API Error: ${data.error || 'Unknown Server Error'}`);
    }

    const resultUrl = data.result?.url || data.data?.result?.url || data.url;
    
    if (!resultUrl) {
      throw new Error("No edited image URL found in API response.");
    }

    // 4. Download Image
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

      api.sendMessage(
        {
          body: `✨ Image edited successfully!\n\n📝 Prompt: ${prompt}\n\n🎨 Powered by NanoBanana AI`,
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        () => {
          fs.unlinkSync(filePath);
        },
        messageID
      );
    });

    writer.on("error", (err) => {
      console.error("Error downloading edited image:", err);
      api.unsendMessage(processingMsg.messageID);
      api.sendMessage(
        "❌ Failed to download the edited image.",
        threadID,
        messageID
      );
    });

  } catch (error) {
    console.error("Error in edit command:", error);
    api.unsendMessage(processingMsg.messageID);
    
    let errorMessage = "❌ An error occurred.";
    
    if (error.message === 'API_DOWN_HTML') {
        errorMessage = "❌ **API Error:** The external server is down and returned a webpage instead of data.\n\n💡 Reason: The API `anabot.my.id` is currently unstable or the cookie was rejected.";
    } else if (error.message.includes('Not JSON')) {
        errorMessage = "❌ **API Error:** The server returned garbled data. Please try again later.";
    } else if (error.code === 'ETIMEDOUT') {
        errorMessage
      
