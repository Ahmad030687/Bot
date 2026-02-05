const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "edit",
  version: "3.0.0",
  hasPermssion: 2,
  credits: "Ahmad RDX",
  description: "NanoBanana Editor (Optimized Request)",
  commandCategory: "Media",
  usages: "[prompt] - Reply to an image",
  prefix: true,
  cooldowns: 10
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, messageReply, type } = event;

  // --- 🍪 MANUAL COOKIE CONSTRUCTION (From your provided JSON) ---
  // Sirf kaam ki cookies rakhi hain taake header overflow na ho
  const cookie = [
    "SID=g.a0006AiwL2hukjGc1ZVRNKS5XWaBxI-Fj77QIGyj8Cy21eiI1o1wjWmRXyGckSNQiebYLf5EpgACgYKAVgSARMSFQHGX2MiO0_dneDdrFrNJSf8t1qtCRoVAUF8yKqXONKm2DFycalJCILVjmYu0076",
    "__Secure-1PSID=g.a0006AiwL2hukjGc1ZVRNKS5XWaBxI-Fj77QIGyj8Cy21eiI1o1w0shnpaJpgEyf0phdztRj3AACgYKARwSARMSFQHGX2MiQryCG9kvP0GRC7sq9MTM9RoVAUF8yKp6rtzdOATqvqqqTZ1Zhszw0076",
    "__Secure-3PSID=g.a0006AiwL2hukjGc1ZVRNKS5XWaBxI-Fj77QIGyj8Cy21eiI1o1wNsLYDwfK5-gnM6xL8sbmlgACgYKAYUSARMSFQHGX2Mi1XZWyT5TQqRG3nau4oJXqhoVAUF8yKoT8qoKY8qqh_cGeHt3h7L80076",
    "HSID=As6RI2N9VtlTtG_wA",
    "SSID=AUmJTs8SA3IBG32MK",
    "APISID=kJoi38dXpi617zgJ/A-mo03AzyHQVdg-IJ",
    "SAPISID=LNDiahU7YjO3eITT/A4JCBFbME6zDwTZT7",
    "__Secure-1PAPISID=LNDiahU7YjO3eITT/A4JCBFbME6zDwTZT7",
    "__Secure-3PAPISID=LNDiahU7YjO3eITT/A4JCBFbME6zDwTZT7",
    "SIDCC=AKEyXzUZUQ5pQTrRuysFtGnu_l1wefNjr0ohk_gtyr9KIzfK9ClJKKqwtK07nPTV12tkC6rYgg",
    "__Secure-1PSIDCC=AKEyXzWk7nG-TkZn74QBnMn6DMC0KZFCxJSfnyaeHHtur75WqssGa3AQypzhYh8bcWwbmsLuB9w",
    "__Secure-3PSIDCC=AKEyXzXMjlRP_QK_hYyvDKk0_QGp6JMO6HwyAawfQnJyfW_CX8nDZsYjQNp87ImGZL4e2AhvBUw"
  ].join("; ");

  // --- Command Logic ---
  if (type !== "message_reply" || !messageReply) {
    return api.sendMessage("⚠️ **Format:** Kisi photo par reply karein.\nExample: #edit make him look like a king", threadID, messageID);
  }

  const attachment = messageReply.attachments[0];
  if (!attachment || attachment.type !== "photo") {
    return api.sendMessage("❌ Sirf image par reply karein.", threadID, messageID);
  }

  const prompt = args.join(" ");
  if (!prompt) {
    return api.sendMessage("❌ Prompt missing!\nExample: #edit red hair", threadID, messageID);
  }

  const processingMsg = await api.sendMessage("🎨 **Connecting to NanoBanana Server...**\nCookies Injecting... 💉", threadID);

  try {
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    // URL Encoding (Boht zaroori hai taake link toote na)
    const encodedPrompt = encodeURIComponent(prompt);
    const encodedImage = encodeURIComponent(attachment.url);
    const encodedCookie = encodeURIComponent(cookie);

    // API Call
    const apiUrl = `https://anabot.my.id/api/ai/geminiOption?prompt=${encodedPrompt}&type=NanoBanana&imageUrl=${encodedImage}&cookie=${encodedCookie}&apikey=freeApikey`;

    // Advanced Headers (Server ko fool banane ke liye)
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://anabot.my.id/'
      },
      timeout: 60000 // 1 minute timeout
    });

    // Validating Data
    const data = response.data;
    const resultUrl = data.result?.url || data.data?.result?.url || data.url;

    if (!resultUrl) {
      throw new Error("API ne response diya magar image URL nahi mila.");
    }

    // Downloading Result
    const filePath = path.join(cacheDir, `edit_${Date.now()}.png`);
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
        body: `✨ **Edited via NanoBanana**\n📝: ${prompt}`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath), messageID);
    });

  } catch (error) {
    console.error(error);
    api.unsendMessage(processingMsg.messageID);
    
    let msg = "❌ Error.";
    if (error.response?.status === 500) {
        msg = "❌ **Server Crash (500):** Ahmad bhai, cookies theek hain par Anabot ka server aapki request process nahi kar pa raha. Ye unki side se issue hai.";
    } else {
        msg = `❌ **Error:** ${error.message}`;
    }
    
    api.sendMessage(msg, threadID, messageID);
  }
};
