const { Jimp } = require("jimp"); // Fixed Import for new Jimp versions
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "dp",
  version: "9.0.0",
  credits: "AHMAD RDX",
  description: "Fixed Jimp DP Maker with 150+ Styles",
  commandCategory: "Media",
  usages: "[Style No] [Name] - Reply to Photo",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, messageReply } = event;

  if (!messageReply || !messageReply.attachments[0]) {
    return api.sendMessage("⚠️ **AHMAD RDX:** Photo par reply karein!\nExample: #dp 7 HUMA", threadID, messageID);
  }

  const styleNo = parseInt(args[0]) || 1;
  const name = args.slice(1).join(" ").toUpperCase() || "AHMAD";
  const imgUrl = messageReply.attachments[0].url;
  const pathImg = path.join(__dirname, "cache", `dp_fixed_${Date.now()}.png`);

  if (!fs.existsSync(path.join(__dirname, "cache"))) fs.mkdirSync(path.join(__dirname, "cache"));

  api.sendMessage(`🎨 **AHMAD CREATIONS:** Applying Style #${styleNo}...`, threadID);

  try {
    // 🛠️ FIX: New Jimp reading method
    const image = await Jimp.read(imgUrl);
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    // Standard Font Loading
    const font = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE);
    const brandFont = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);

    // --- 🎭 150+ STYLES COLOR LOGIC ---
    let textColor;
    // Har style number par alag color generator
    const r = (styleNo * 55) % 255;
    const g = (styleNo * 99) % 255;
    const b = (styleNo * 155) % 255;

    // Text image layer
    const textLayer = new Jimp({ width, height });
    
    // Name Print
    textLayer.print({
        font: font,
        x: 0,
        y: height - 400,
        text: name,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
    }, width, height);

    // Dynamic Coloring based on Style No
    textLayer.color([
        { apply: 'red', params: [r - 255] },
        { apply: 'green', params: [g - 255] },
        { apply: 'blue', params: [b - 255] }
    ]);

    // Apply Shadow for Premium Look
    const shadow = textLayer.clone().blur(8);
    image.composite(shadow, 4, height - 396); 
    image.composite(textLayer, 0, height - 400);

    // Branding & Quote
    const quotes = ["LEGEND NEVER DIES", "A NIGHT TO REMEMBER", "WHISPERS OF HEART", "ELEGANCE IN EVERY PIXEL"];
    const quote = quotes[styleNo % quotes.length];

    image.print({ font: brandFont, x: 50, y: height - 150, text: quote }, width);
    image.print({ font: brandFont, x: width - 400, y: height - 80, text: "*AHMAD CREATIONS*" }, width);

    await image.write(pathImg);

    api.sendMessage({
      body: `✨ **DP Created!**\n💎 Style: #${styleNo}\n👤 Name: ${name}\n🦅 Powered by Ahmad RDX`,
      attachment: fs.createReadStream(pathImg)
    }, threadID, () => fs.unlinkSync(pathImg), messageID);

  } catch (err) {
    console.error(err);
    api.sendMessage(`❌ **Error:** Jimp failed to process image. Make sure URL is valid.`, threadID);
  }
};
