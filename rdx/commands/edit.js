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
      "⚠️ Please reply to an image with your edit prompt!\n\n📝 Usage: edit [prompt]\n\nExample: edit make the cat blue and add sunglasses",
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

    // UPDATED: Fresh cookies from your request formatted as a string
    const cookie = "HSID=As6RI2N9VtlTtG_wA; SSID=AUmJTs8SA3IBG32MK; APISID=kJoi38dXpi617zgJ/A-mo03AzyHQVdg-IJ; SAPISID=LNDiahU7YjO3eITT/A4JCBFbME6zDwTZT7; __Secure-1PAPISID=LNDiahU7YjO3eITT/A4JCBFbME6zDwTZT7; __Secure-3PAPISID=LNDiahU7YjO3eITT/A4JCBFbME6zDwTZT7; AEC=AaJma5vASPcGxMpkR37-chVxIVmv9_MDAnY1m-jrfzIpcI55jHoUhI5kDoM; SEARCH_SAMESITE=CgQI9Z8B; SID=g.a0006AiwL2hukjGc1ZVRNKS5XWaBxI-Fj77QIGyj8Cy21eiI1o1wjWmRXyGckSNQiebYLf5EpgACgYKAVgSARMSFQHGX2MiO0_dneDdrFrNJSf8t1qtCRoVAUF8yKqXONKm2DFycalJCILVjmYu0076; __Secure-1PSID=g.a0006AiwL2hukjGc1ZVRNKS5XWaBxI-Fj77QIGyj8Cy21eiI1o1w0shnpaJpgEyf0phdztRj3AACgYKARwSARMSFQHGX2MiQryCG9kvP0GRC7sq9MTM9RoVAUF8yKp6rtzdOATqvqqqTZ1Zhszw0076; __Secure-3PSID=g.a0006AiwL2hukjGc1ZVRNKS5XWaBxI-Fj77QIGyj8Cy21eiI1o1wNsLYDwfK5-gnM6xL8sbmlgACgYKAYUSARMSFQHGX2Mi1XZWyT5TQqRG3nau4oJXqhoVAUF8yKoT8qoKY8qqh_cGeHt3h7L80076;";
    
    const apiUrl = `https://anabot.my.id/api/ai/geminiOption?prompt=${encodeURIComponent(prompt)}&type=NanoBanana&imageUrl=${encodeURIComponent(imageUrl)}&cookie=${encodeURIComponent(cookie)}&apikey=freeApikey`;

    const response = await axios.get(apiUrl, {
      headers: { 'Accept': 'application/json' },
      timeout: 60000,
      validateStatus: function (status) {
        return status < 600; 
      }
    });

    // FIX: Check if API returned HTML (Error page) instead of JSON
    if (typeof response.data === 'string' && response.data.trim().startsWith('<')) {
        throw new Error("API_HTML_ERROR"); 
    }

    if (response.status === 500 && response.data?.error) {
      throw new Error(`API Error: ${response.data.error} - ${response.data.details || 'Server issue'}`);
    }

    // Handle nested data structures sometimes returned by this API
    const resultUrl = response.data?.result?.url || response.data?.data?.result?.url || response.data?.url;
    
    if (!resultUrl) {
      // Log the actual response for debugging
      console.log("API Response:", JSON.stringify(response.data));
      throw new Error("No edited image URL returned. The API might be busy or the cookie rejected.");
    }

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
        "❌ Failed to download the edited image. Please try again.",
        threadID,
        messageID
      );
    });

  } catch (error) {
    console.error("Error in edit command:", error);
    api.unsendMessage(processingMsg.messageID);
    
    let errorMessage = "❌ An error occurred while editing the image.";
    
    if (error.message === 'API_HTML_ERROR') {
      errorMessage = "❌ API Error: The server returned an HTML error page.\n\n💡 This usually means the cookie is invalid or expired, or the API service is down.";
    } else if (error.message.includes('ENOSPC')) {
      errorMessage = "❌ API server is temporarily unavailable (disk space full).";
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = "❌ Request timeout. The API is taking too long to respond.";
    } else {
      errorMessage += `\n\n📌 Error: ${error.message}`;
    }
    
    api.sendMessage(errorMessage, threadID, messageID);
  }
};
