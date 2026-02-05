const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "edit",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "SARDAR RDX (Modified by Gemini)",
  description: "Edit replied photo using Pollinations AI",
  commandCategory: "Media",
  usages: "[reply to image] [prompt]",
  prefix: true,
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, messageReply, type } = event;

  // 1. Check karein ke user ne photo par reply kiya hai ya nahi
  if (type !== "message_reply" || !messageReply) {
    return api.sendMessage(
      "⚠️ Please reply to an image with your edit prompt!\n\n📝 Example: Reply to a photo and type 'edit make him look like a cyyborg'",
      threadID,
      messageID
    );
  }

  if (!messageReply.attachments || messageReply.attachments.length === 0) {
    return api.sendMessage("❌ The message you replied to doesn't contain any image!", threadID, messageID);
  }

  const attachment = messageReply.attachments[0];
  if (attachment.type !== "photo") {
    return api.sendMessage("❌ Please reply to an image, not a " + attachment.type + "!", threadID, messageID);
  }

  // 2. Prompt Check
  const prompt = args.join(" ");
  if (!prompt) {
    return api.sendMessage(
      "❌ Please provide an edit prompt!\nExample: make it anime style",
      threadID,
      messageID
    );
  }

  const processingMsg = await api.sendMessage(
    "🎨 Editing your photo using Flux AI...\n⏳ Please wait...",
    threadID
  );

  try {
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir);
    }

    // 3. Original Image URL nikalein
    const imageUrl = attachment.url;

    // 4. Pollinations URL banayein (Image + Prompt)
    // Hum 'model=flux' use kar rahe hain jo best quality deta hai
    // 'nologo=true' se watermark hat jayega
    const apiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?image=${encodeURIComponent(imageUrl)}&width=1024&height=1024&model=flux&nologo=true`;

    const fileName = `edit_${Date.now()}.jpg`;
    const filePath = path.join(cacheDir, fileName);

    // 5. Download Edited Image
    const response = await axios({
      url: apiUrl,
      method: "GET",
      responseType: "stream",
      timeout: 45000 // 45 seconds timeout for processing
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      api.unsendMessage(processingMsg.messageID);

      api.sendMessage(
        {
          body: `✨ Photo Edited!\n\n📝 Prompt: ${prompt}\n🎨 Powered by Pollinations`,
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
      console.error("Stream Error:", err);
      api.unsendMessage(processingMsg.messageID);
      api.sendMessage("❌ Failed to download the edited image.", threadID, messageID);
    });

  } catch (error) {
    console.error("Error in edit command:", error);
    api.unsendMessage(processingMsg.messageID);
    api.sendMessage(
      `❌ Error: Could not edit the image.\nTry a simpler prompt.`,
      threadID,
      messageID
    );
  }
};
