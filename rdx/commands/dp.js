const { Jimp } = require("jimp"); // Correct for v1.6.0
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "dp",
  version: "11.6.0",
  credits: "AHMAD RDX",
  description: "Premium 150+ Styles DP Maker for Jimp v1.6.0",
  commandCategory: "Media",
  usages: "[Style No] [Name] - Reply to photo",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, messageReply } = event;

  if (!messageReply || !messageReply.attachments[0] || messageReply.attachments[0].type !== "photo") {
    return api.sendMessage("⚠️ **AHMAD RDX:** Photo par reply karein aur Name likhein!\nExample: #dp 5 HUMA", threadID, messageID);
  }

  const styleNo = parseInt(args[0]) || 1;
  const name = args.slice(1).join(" ").toUpperCase() || "RDX";
  const imgUrl = messageReply.attachments[0].url;
  const cacheDir = path.join(__dirname, "cache");
  const pathImg = path.join(cacheDir, `rdx_dp_${Date.now()}.png`);

  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

  const waitingMsg = await api.sendMessage(`🎨 **AHMAD CREATIONS:** Style #${styleNo} apply ho raha hai...`, threadID);

  try {
    // 1. Image Read (Jimp v1.6.0 Standard)
    const image = await Jimp.read(imgUrl);
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    // 2. Load Fonts
    const fontMain = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE);
    const fontSub = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);

    // 3. --- 🎭 150+ DYNAMIC STYLE LOGIC ---
    // Math formula to generate 150+ unique colors based on style number
    const r = (styleNo * 37) % 256;
    const g = (styleNo * 73) % 256;
    const b = (styleNo * 127) % 256;

    // Create a Text Layer for Shadow/Glow
    const textLayer = new Jimp({ width, height, color: 0x00000000 });

    // Print the Name in Center
    textLayer.print({
      font: fontMain,
      x: 0,
      y: height - 450,
      text: name,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
    }, width, height);

    // Apply Color to Text Layer
    textLayer.color([
      { apply: 'red', params: [r - 255] },
      { apply: 'green', params: [g - 255] },
      { apply: 'blue', params: [b - 255] }
    ]);

    // 4. --- ✨ PREMIUM EFFECTS (GLOW & SHADOW) ---
    // User images (Huma/Ezzah) jaisa look dene ke liye layering
    const shadowLayer = textLayer.clone().blur(12); // Deep blur for glow
    
    // Composite: Pehle Shadow, phir original text
    image.composite(shadowLayer, 6, height - 444); 
    image.composite(textLayer, 0, height - 450);

    // 5. --- ✍️ QUOTES & BRANDING ---
    const quotes = [
      "LOVE IS NOT JUST A WORD",
      "A NIGHT TO REMEMBER FOREVER",
      "ELEGANCE IN EVERY PIXEL",
      "WHISPERS OF THE SOUL",
      "A LEGEND NEVER DIES"
    ];
    const selectedQuote = quotes[styleNo % quotes.length];

    // Quote (Center)
    image.print({
      font: fontSub,
      x: 0,
      y: height - 250,
      text: selectedQuote,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
    }, width);

    // Branding (Bottom Right - Ahmad's Signature)
    image.print({
      font: fontSub,
      x: width - 480,
      y: height - 80,
      text: "*AHMAD CREATIONS*"
    }, width);

    // 6. Final Save & Response
    await image.write(pathImg);
    api.unsendMessage(waitingMsg.messageID);

    api.sendMessage({
      body: `✨ **DP Designed by AHMAD RDX**\n💎 Style Applied: #${styleNo}\n👤 Name: ${name}`,
      attachment: fs.createReadStream(pathImg)
    }, threadID, () => fs.unlinkSync(pathImg), messageID);

  } catch (err) {
    console.error(err);
    api.sendMessage(`❌ **Error:** Jimp v1.6.0 processing fail ho gayi!`, threadID);
  }
};
