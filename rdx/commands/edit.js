const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "edit",
  version: "1.3.1",
  hasPermssion: 2,
  credits: "SARDAR RDX & Gemini",
  description: "Edit images using NanoBanana (Anabot) [Fixed Cookies]",
  commandCategory: "Media",
  usages: "[prompt] - Reply to an image",
  prefix: true,
  cooldowns: 10
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, messageReply, type } = event;

  // --- UPDATED COOKIE CONFIGURATION (Extracted from your JSON) ---
  const cookie = "SID=g.a0006AiwL2hukjGc1ZVRNKS5XWaBxI-Fj77QIGyj8Cy21eiI1o1wjWmRXyGckSNQiebYLf5EpgACgYKAVgSARMSFQHGX2MiO0_dneDdrFrNJSf8t1qtCRoVAUF8yKqXONKm2DFycalJCILVjmYu0076; __Secure-1PSID=g.a0006AiwL2hukjGc1ZVRNKS5XWaBxI-Fj77QIGyj8Cy21eiI1o1w0shnpaJpgEyf0phdztRj3AACgYKARwSARMSFQHGX2MiQryCG9kvP0GRC7sq9MTM9RoVAUF8yKp6rtzdOATqvqqqTZ1Zhszw0076; __Secure-3PSID=g.a0006AiwL2hukjGc1ZVRNKS5XWaBxI-Fj77QIGyj8Cy21eiI1o1wNsLYDwfK5-gnM6xL8sbmlgACgYKAYUSARMSFQHGX2Mi1XZWyT5TQqRG3nau4oJXqhoVAUF8yKoT8qoKY8qqh_cGeHt3h7L80076; HSID=As6RI2N9VtlTtG_wA; SSID=AUmJTs8SA3IBG32MK; APISID=kJoi38dXpi617zgJ/A-mo03AzyHQVdg-IJ; SAPISID=LNDiahU7YjO3eITT/A4JCBFbME6zDwTZT7; __Secure-1PAPISID=LNDiahU7YjO3eITT/A4JCBFbME6zDwTZT7; __Secure-3PAPISID=LNDiahU7YjO3eITT/A4JCBFbME6zDwTZT7";

  // --- Command Logic ---
  if (type !== "message_reply" || !messageReply) {
    return api.sendMessage("⚠️ Please reply to an image with your edit prompt!\n\nUsage: edit [prompt]", threadID, messageID);
  }

  if (!messageReply.attachments || messageReply.attachments.length === 0) {
    return api.sendMessage("❌ No image found in the replied message.", threadID, messageID);
  }

  const attachment = messageReply.attachments[0];
  if (attachment.type !== "photo") {
    return api.sendMessage("❌ Please reply to an actual image.", threadID, messageID);
  }

  const prompt = args.join(" ");
  if (!prompt) {
    return api.sendMessage("❌ Please provide instructions!\nExample: edit make the cat red", threadID, messageID);
  }

  const imageUrl = attachment.url;
  const processingMsg = await api.sendMessage("🎨 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 is processing your edit...\n⏳ This might take a few seconds...", threadID);

  try {
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    // Using the 'NanoBanana' type as per your request
    const apiUrl = `https://anabot.my.id/api/ai/geminiOption?prompt=${encodeURIComponent(prompt)}&type=NanoBanana&imageUrl=${encodeURIComponent(imageUrl)}&cookie=${encodeURIComponent(cookie)}&apikey=freeApikey`;

    console.log("Sending request to API..."); 

    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      },
      timeout: 120000 
    });

    if (typeof response.data !== 'object') {
      throw new Error("API returned invalid data.");
    }

    const resultUrl = response.data.result?.url || response.data.data?.result?.url || response.data.url;
    
    if (!resultUrl) {
      console.log("Full API Response:", JSON.stringify(response.data));
      throw new Error("API responded but didn't provide an image URL.");
    }

    const fileName = `edit_${Date.now()}.png`;
    const filePath = path.join(cacheDir, fileName);
    
    const imageResponse = await axios({
      url: resultUrl,
      method: "GET",
      responseType: "stream"
    });

    const writer = fs.createWriteStream(filePath);
    imageResponse.data.pipe(writer);

    writer.on("finish", () => {
      api.unsendMessage(processingMsg.messageID);
      api.sendMessage({
        body: `✨ Edited Successfully!\n📝 Prompt: ${prompt}`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath), messageID);
    });

    writer.on("error", (err) => {
      console.error("Stream error:", err);
      api.unsendMessage(processingMsg.messageID);
      api.sendMessage("❌ Error downloading the edited image.", threadID, messageID);
    });

  } catch (error) {
    console.error("Edit Command Error:", error);
    api.unsendMessage(processingMsg.messageID);
    
    let errorMsg = "❌ Error processing image.";
    if (error.message.includes("400")) errorMsg = "❌ Bad Request: Cookie might be rejected.";
    if (error.message.includes("500")) errorMsg = "❌ Server Error: The API is struggling with the request.";
    
    api.sendMessage(`${errorMsg}\n\nTechnical details: ${error.message}`, threadID, messageID);
  }
};
