const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "edit",
  version: "5.0.0",
  hasPermssion: 0, // Sab use kar sakte hain
  credits: "Ahmad RDX",
  description: "High Quality AI Editor (Flux Engine)",
  commandCategory: "Media",
  usages: "[prompt] - Reply to an image",
  prefix: true,
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, messageReply, type } = event;

  // 1. Check Image
  if (type !== "message_reply" || !messageReply) {
    return api.sendMessage("⚠️ **Format:** Photo par reply karein aur likhein.\nExample: #edit make him look like a zombie", threadID, messageID);
  }

  const attachment = messageReply.attachments[0];
  if (!attachment || attachment.type !== "photo") {
    return api.sendMessage("❌ Sirf image par reply karein.", threadID, messageID);
  }

  // 2. Check Prompt
  const prompt = args.join(" ");
  if (!prompt) {
    return api.sendMessage("❌ Batao kya edit karna hai?\nExample: #edit red hair, anime style", threadID, messageID);
  }

  const processingMsg = await api.sendMessage("🎨 **Ahmad RDX:** Creating Magic... ⏳\n(Powered by Flux Engine)", threadID);

  try {
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const originalImage = attachment.url;
    
    // 3. FLUX ENGINE (Better than Nano Banana)
    // Ye API free hai aur image-to-image editing karti hai
    const seed = Math.floor(Math.random() * 10000);
    const apiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed}&model=flux&nologo=true&image=${encodeURIComponent(originalImage)}`;

    // 4. Download Result
    const filePath = path.join(cacheDir, `edit_${Date.now()}.jpg`);
    
    const response = await axios({
      url: apiUrl,
      method: "GET",
      responseType: "stream"
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      api.unsendMessage(processingMsg.messageID);
      api.sendMessage({
        body: `✨ **Edit Complete!**\n🎨 **Model:** Flux Realism\n📝 **Prompt:** ${prompt}`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath), messageID);
    });

    writer.on("error", (err) => {
      console.error(err);
      api.unsendMessage(processingMsg.messageID);
      api.sendMessage("❌ Download Error.", threadID, messageID);
    });

  } catch (error) {
    console.error(error);
    api.unsendMessage(processingMsg.messageID);
    api.sendMessage("❌ **Server Error:** Internet issue or API busy.", threadID, messageID);
  }
};
