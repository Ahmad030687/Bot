const Jimp = require("jimp");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "dp",
  version: "8.0.0",
  credits: "AHMAD RDX",
  description: "Create Premium DPs with 150+ Dynamic Styles",
  commandCategory: "Media",
  usages: "[Style No] [Name] - Reply to Photo",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, messageReply } = event;

  if (!messageReply || !messageReply.attachments[0]) {
    return api.sendMessage("⚠️ **AHMAD RDX:** Kisi photo par reply karein!\nExample: #dp 7 HUMA", threadID, messageID);
  }

  const styleNo = parseInt(args[0]) || 1;
  const name = args.slice(1).join(" ").toUpperCase() || "AHMAD";
  const imgUrl = messageReply.attachments[0].url;
  const pathImg = path.join(__dirname, "cache", `dp_premium_${Date.now()}.png`);

  api.sendMessage(`🎨 **AHMAD CREATIONS:** Applying Style #${styleNo}...`, threadID);

  try {
    const image = await Jimp.read(imgUrl);
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    // Premium Fonts Loading (SANS-128 standard but styled via logic)
    const font = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE);
    const brandFont = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);

    // --- 🎭 DYNAMIC STYLE ENGINE (150+ VARIATIONS) ---
    // Style ranges set kar di hain ustad ji:
    // 1-30: Gold & Luxury, 31-60: Neon Glow, 61-90: Ruby & Fire, 91-120: Deep Ocean, 121-150+: Custom Mix
    
    let textColor = { r: 255, g: 255, b: 255 }; // Default White

    if (styleNo >= 1 && styleNo <= 30) { 
        // GOLD CATEGORY (Different shades of Gold/Yellow)
        textColor = { r: 255, g: 215, b: styleNo * 2 }; 
    } else if (styleNo >= 31 && styleNo <= 60) {
        // NEON CATEGORY (Cyan to Green)
        textColor = { r: 0, g: 255, b: 255 - (styleNo - 31) * 4 };
    } else if (styleNo >= 61 && styleNo <= 90) {
        // RUBY CATEGORY (Red to Pink)
        textColor = { r: 255, g: (styleNo - 61) * 3, b: (styleNo - 61) * 5 };
    } else if (styleNo >= 91 && styleNo <= 120) {
        // OCEAN CATEGORY (Dark Blue to Purple)
        textColor = { r: (styleNo - 91) * 5, g: 100, b: 255 };
    } else {
        // RAINBOW/MIX CATEGORY
        textColor = { r: (styleNo % 255), g: 255 - (styleNo % 255), b: 150 };
    }

    // Creating Text Layer for Effects
    const textImage = new Jimp(width, height);
    textImage.print(font, 0, height - 400, {
        text: name,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
    }, width);

    // Apply Style Color to Text
    textImage.color([
        { apply: 'red', params: [textColor.r - 255] },
        { apply: 'green', params: [textColor.g - 255] },
        { apply: 'blue', params: [textColor.b - 255] }
    ]);

    // Add Shadow/Glow (Har style par alag intensity)
    const shadow = textImage.clone().blur(5 + (styleNo % 10));
    image.composite(shadow, 5, height - 395); // Subtle shadow
    image.composite(textImage, 0, height - 400);

    // Quote Logic (Randomly assigned to style numbers)
    const quotes = ["Loves is not just a word", "A night to remember", "ELEGANCE IN EVERY PIXEL"];
    const quote = quotes[styleNo % quotes.length];
    
    // Add Brand Tag & Quote
    image.print(brandFont, 50, height - 150, quote);
    image.print(brandFont, width - 400, height - 80, "*AHMAD CREATIONS*");

    // Final Touch: Brightness adjust based on style
    image.brightness(0.05);

    await image.writeAsync(pathImg);

    api.sendMessage({
      body: `✨ **Premium DP Created!**\n💎 Style: #${styleNo}\n👤 Name: ${name}\n🦅 Powered by Ahmad RDX`,
      attachment: fs.createReadStream(pathImg)
    }, threadID, () => fs.unlinkSync(pathImg), messageID);

  } catch (err) {
    console.error(err);
    api.sendMessage("❌ Error: Image processing failed!", threadID);
  }
};
