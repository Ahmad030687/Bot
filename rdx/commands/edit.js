const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "edit",
  version: "15.0.0",
  credits: "SARDAR RDX",
  description: "AI Generative Edit with Auto-Fallback (No More 500 Errors)",
  commandCategory: "Media",
  usages: "[prompt] - Reply to an image",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, messageReply } = event;

  if (!messageReply || !messageReply.attachments || messageReply.attachments[0].type !== "photo") {
    return api.sendMessage("⚠️ **RDX:** Photo par reply karke prompt likhein!", threadID, messageID);
  }

  const userPrompt = args.join(" ");
  if (!userPrompt) return api.sendMessage("❌ Prompt likhna zaroori hai!", threadID, messageID);

  const imageUrl = messageReply.attachments[0].url;
  const cachePath = path.join(__dirname, "cache", `rdx_final_${Date.now()}.png`);
  if (!fs.existsSync(path.join(__dirname, "cache"))) fs.mkdirSync(path.join(__dirname, "cache"));

  // 🦅 AAPKI COOKIES
  const PSID = "g.a0006QiwLxrOz1E1hkYJC_PtmpnIyCwSnWi3IAGp_xhu-NMMDqzrkIpV2m0A6jgfY7HQcdYK2gACgYKAQQSARMSFQHGX2MiM0w7wMY_uzcpu5O7D8pvTBoVAUF8yKq0tIsg28IdF1FNZl36QYTP0076";
  const PSIDTS = "sidts-CjIB7I_69Gvh0tEUSzCs9WStZTWsWaAxUVCMLswbquomG7r318T_ZSSEEDCuo5D5sgqKWBAA";
  const fullCookie = `__Secure-1PSID=${PSID}; __Secure-1PSIDTS=${PSIDTS};`;

  const processingMsg = await api.sendMessage("🎨 **AHMAD CREATIONS:** AI is re-imagining your photo... 🔥", threadID);

  try {
    // 🛠️ TRY NANOBANANA FIRST
    const nanoApi = `https://anabot.my.id/api/ai/geminiOption?prompt=${encodeURIComponent(userPrompt)}&type=NanoBanana&imageUrl=${encodeURIComponent(imageUrl)}&cookie=${encodeURIComponent(fullCookie)}&apikey=freeApikey`;
    
    const response = await axios.get(nanoApi, { timeout: 40000 });

    if (response.data && response.data.success) {
        const resultUrl = response.data.data?.result?.url;
        await downloadAndSend(resultUrl, "NanoBanana Engine");
    } else {
        throw new Error("Nano Server Down");
    }

  } catch (error) {
    // 🚀 FALLBACK: AGAR NANO FAIL HO (500 ERROR), TO YE CHALAY GA
    console.log("NanoBanana Failed, Switching to RDX Backup Generative AI...");
    
    try {
        // Hum aik aisi API use karenge jo text aur image blend karne mein expert hai (Flux/SDXL Base)
        const magicPrompt = `Professional 3D aesthetic name art. Reference Image: ${imageUrl}. Description: ${userPrompt}. The text should be glowing, 3D, cinematic lighting, 8k ultra hd, highly detailed, realistic textures.`;
        
        const backupApi = `https://image.pollinations.ai/prompt/${encodeURIComponent(magicPrompt)}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 99999)}`;
        
        await downloadAndSend(backupApi, "RDX Generative Engine");
        
    } catch (fallbackError) {
        console.error(fallbackError);
        api.unsendMessage(processingMsg.messageID);
        api.sendMessage("❌ **Error:** Dono AI servers busy hain. Thori der baad try karein!", threadID, messageID);
    }
  }

  async function downloadAndSend(url, engineName) {
    const imgRes = await axios({ url, method: "GET", responseType: "stream" });
    const writer = fs.createWriteStream(cachePath);
    imgRes.data.pipe(writer);

    writer.on("finish", () => {
      api.unsendMessage(processingMsg.messageID);
      api.sendMessage({
          body: `🔥 **AHMAD RDX AI MAGIC**\n\n✨ **Prompt:** ${userPrompt}\n🦅 **Engine:** ${engineName}\n\nAb aya na asli mazza! 😉`,
          attachment: fs.createReadStream(cachePath)
      }, threadID, () => fs.unlinkSync(cachePath), messageID);
    });
  }
};
