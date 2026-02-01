#link /**
 * fontpro.js - 1500+ Professional Font Renderer
 * Credits: Ahmad Ali Safdar | Sardar RDX
 */

module.exports.config = {
  name: "font",
  version: "6.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Render text into 1500+ professional Google Fonts (Image)",
  commandCategory: "graphics",
  usages: "font [font_name] [text]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const axios = require("axios");
  const fs = require("fs-extra");
  const path = require("path");
  const { threadID, messageID } = event;

  if (args.length < 2) {
    return api.sendMessage("⚠️ Ahmad bhai, sahi tarika ye hai:\n#font [font_name] [text]\n\nExample: #font montez Sardar RDX", threadID, messageID);
  }

  const fontName = args[0].toLowerCase();
  const text = args.slice(1).join(" ");
  const API_KEY = "AIzaSyA2bPwfr_VXtXDozx0N-6hlecRS1cQwgRY"; // Aapki Fresh Key

  api.sendMessage("🎨 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 - Rendering Premium Font...**", threadID, messageID);

  try {
    // 1. Check if font exists in 1500+ library
    const listRes = await axios.get(`https://www.googleapis.com/webfonts/v1/webfonts?key=${API_KEY}`);
    const fonts = listRes.data.items;
    const fontExists = fonts.find(f => f.family.toLowerCase() === fontName);

    if (!fontExists) {
        return api.sendMessage(`❌ Ahmad bhai, "${fontName}" nahi mila. Try: Poppins, Lobster, Roboto, Montez, Bebas Neue.`, threadID, messageID);
    }

    // 2. Render Text to Image using Cloudinary (Unlimited & Pro)
    // Hum text ko professional transparent image mein convert kar rahe hain
    const encodedText = encodeURIComponent(text);
    const imageUrl = `https://res.cloudinary.com/demo/image/upload/co_rgb:FFFFFF,l_text:${fontName}_80_bold:${encodedText}/fl_layer_apply/blank.png`;

    const tempPath = path.join(__dirname, `/cache/rdx_font_${Date.now()}.png`);
    const response = await axios({ url: imageUrl, method: 'GET', responseType: 'stream' });
    const writer = fs.createWriteStream(tempPath);
    response.data.pipe(writer);

    return new Promise((resolve) => {
      writer.on('finish', () => {
        api.sendMessage({
          body: `🦅 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐏𝐑𝐄𝐌𝐈𝐔𝐌 𝐅𝐎𝐍𝐓**\n✨ Font: ${fontName}\n📐 Quality: Ultra HD PNG`,
          attachment: fs.createReadStream(tempPath)
        }, threadID, () => fs.unlinkSync(tempPath), messageID);
        resolve();
      });
    });

  } catch (e) {
    console.error(e);
    return api.sendMessage("❌ Error: Font rendering mein masla aaya hai.", threadID, messageID);
  }
};
