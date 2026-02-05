const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "edit",
  version: "10.0.0",
  hasPermssion: 0,
  credits: "SARDAR RDX",
  description: "NanoBanana AI - Generative Name Art (Fixed Cookies)",
  commandCategory: "Media",
  usages: "[prompt] - Reply to an image",
  prefix: true,
  cooldowns: 10
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, messageReply } = event;

  if (!messageReply || !messageReply.attachments || messageReply.attachments[0].type !== "photo") {
    return api.sendMessage("⚠️ **AHMAD RDX:** Photo par reply karke prompt likhein!\nExample: edit make it 3d gold name HUMA", threadID, messageID);
  }

  const userPrompt = args.join(" ");
  if (!userPrompt) return api.sendMessage("❌ Prompt likhna zaroori hai!", threadID, messageID);

  const imageUrl = messageReply.attachments[0].url;
  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

  // 🦅 AHMAD RDX: AAPKI LIVE COOKIES YAHAN HAIN
  const PSID = "g.a0006QiwLxrOz1E1hkYJC_PtmpnIyCwSnWi3IAGp_xhu-NMMDqzrkIpV2m0A6jgfY7HQcdYK2gACgYKAQQSARMSFQHGX2MiM0w7wMY_uzcpu5O7D8pvTBoVAUF8yKq0tIsg28IdF1FNZl36QYTP0076"; 
  const PSIDTS = "sidts-CjIB7I_69Gvh0tEUSzCs9WStZTWsWaAxUVCMLswbquomG7r318T_ZSSEEDCuo5D5sgqKWBAA"; 

  const fullCookie = `__Secure-1PSID=${PSID}; __Secure-1PSIDTS=${PSIDTS};`;

  const processingMsg = await api.sendMessage("🎨 **AHMAD CREATIONS:** AI is re-imagining your image... ⏳", threadID);

  try {
    // 🛠️ NANO-BANANA API CALL
    const apiUrl = `https://anabot.my.id/api/ai/geminiOption?prompt=${encodeURIComponent(userPrompt)}&type=NanoBanana&imageUrl=${encodeURIComponent(imageUrl)}&cookie=${encodeURIComponent(fullCookie)}&__Secure-1PSID=${encodeURIComponent(PSID)}&__Secure-1PSIDTS=${encodeURIComponent(PSIDTS)}&apikey=freeApikey`;

    const response = await axios.get(apiUrl, { timeout: 120000 });

    if (!response.data || !response.data.success) {
      throw new Error(response.data?.error?.message || "Gemini Rejected Request");
    }

    const resultUrl = response.data.data?.result?.url;
    const filePath = path.join(cacheDir, `rdx_nano_${Date.now()}.png`);
    
    const imgRes = await axios({ url: resultUrl, method: "GET", responseType: "stream" });
    const writer = fs.createWriteStream(filePath);
    imgRes.data.pipe(writer);

    writer.on("finish", () => {
      api.unsendMessage(processingMsg.messageID);
      api.sendMessage({
          body: `🔥 **RDX GEN-AI EDIT SUCCESS**\n\n✨ **Prompt:** ${userPrompt}\n🦅 **Status:** NanoBanana Engine Online`,
          attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath), messageID);
    });

  } catch (error) {
    console.error(error);
    api.unsendMessage(processingMsg.messageID);
    
    let errorMsg = "❌ **Nano Error:** Session expire ho chuka hai ya Gemini busy hai.";
    if (error.message.includes("400")) errorMsg = "❌ **Cookie Error:** PSIDTS expire ho gayi hai, laptop se dubara nikaalni paregi.";
    
    api.sendMessage(errorMsg, threadID, messageID);
  }
};
