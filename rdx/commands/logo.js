const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "logo",
  version: "3.5.0",
  credits: "SARDAR RDX",
  description: "Generate Professional Logos using NanoBanana Gemini AI",
  commandCategory: "AI-Graphics",
  usages: "[text] | [style] [text]",
  cooldowns: 15
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;

  const styles = ["modern", "esports", "luxury"];
  let style = "modern";
  let text = "";

  // Check if first word is a style
  if (args.length > 0 && styles.includes(args[0].toLowerCase())) {
    style = args[0].toLowerCase();
    text = args.slice(1).join(" ");
  } else {
    text = args.join(" ");
  }

  if (!text) {
    return api.sendMessage("⚠️ **Usage Guide:**\n\n1️⃣ `#logo BrandName` (Modern)\n2️⃣ `#logo esports TeamName` (Gaming)\n3️⃣ `#logo luxury BrandName` (Gold/Premium)", threadID, messageID);
  }

  const waitMsg = await api.sendMessage(`🎨 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐒𝐓𝐔𝐃𝐈𝐎**\n━━━━━━━━━━━━━━━\n💎 **Style:** ${style.toUpperCase()}\n🚀 **Engine:** Gemini NanoBanana\n⌛ Creating your professional identity...\n━━━━━━━━━━━━━━━`, threadID);

  try {
    const cachePath = path.join(__dirname, "cache", `logo_${Date.now()}.png`);
    fs.ensureDirSync(path.join(__dirname, "cache"));

    // ⚠️ Link to your Render App
    const apiUrl = `https://imagine-nsac.onrender.com/api/logo_pro?text=${encodeURIComponent(text)}&style=${style}`;

    const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(cachePath, Buffer.from(response.data));

    api.unsendMessage(waitMsg.messageID);

    return api.sendMessage({
      body: `🦅 **𝐁𝐑𝐀𝐍𝐃 𝐋𝐎𝐆𝐎 𝐑𝐄𝐀𝐃𝐘**\n━━━━━━━━━━━━━━━\n✨ **Style:** ${style}\n👤 **Client:** ${text}\n🎨 **AI:** NanoBanana Gemini Pro\n━━━━━━━━━━━━━━━`,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => fs.unlinkSync(cachePath), messageID);

  } catch (e) {
    api.unsendMessage(waitMsg.messageID);
    console.error(e);
    return api.sendMessage("❌ API Server Busy ya Disk Space Full hai. Thori dair baad koshish karein!", threadID, messageID);
  }
};
