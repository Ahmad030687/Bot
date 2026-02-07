const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "logo",
  version: "3.6.0",
  credits: "SARDAR RDX",
  description: "Generate Professional Logos using Unified Gemini Engine",
  commandCategory: "AI-Graphics",
  usages: "[text] | [style] [text]",
  cooldowns: 15
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;

  const styles = ["modern", "esports", "luxury"];
  let style = "modern"; // Default
  let text = "";

  // Check agar pehla word style hai
  if (args.length > 0 && styles.includes(args[0].toLowerCase())) {
    style = args[0].toLowerCase();
    text = args.slice(1).join(" ");
  } else {
    text = args.join(" ");
  }

  if (!text) {
    return api.sendMessage("⚠️ **Logo Guide:**\n\n1️⃣ `#logo Name` (Modern)\n2️⃣ `#logo esports Name` (Gaming)\n3️⃣ `#logo luxury Name` (Premium Gold)", threadID, messageID);
  }

  const waitMsg = await api.sendMessage(`🎨 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐒𝐓𝐔𝐃𝐈𝐎**\n━━━━━━━━━━━━━━━\n💎 **Style:** ${style.toUpperCase()}\n🚀 **Engine:** Gemini NanoBanana\n⌛ Designing your brand identity...\n━━━━━━━━━━━━━━━`, threadID);

  try {
    const cachePath = path.join(__dirname, "cache", `logo_${Date.now()}.png`);
    fs.ensureDirSync(path.join(__dirname, "cache"));

    // 🔗 Naya Unified Endpoint
    // Prompt mein hum brand ka naam bhej rahe hain aur style parameter alag se
    const apiUrl = `https://imagine-nsac.onrender.com/api/generate?prompt=${encodeURIComponent(text)}&style=${style}`;

    const response = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 90000 });
    
    fs.writeFileSync(cachePath, Buffer.from(response.data));

    api.unsendMessage(waitMsg.messageID);

    return api.sendMessage({
      body: `🦅 **𝐁𝐑𝐀𝐍𝐃 𝐋𝐎𝐆𝐎 𝐑𝐄𝐀𝐃𝐘**\n━━━━━━━━━━━━━━━\n✨ Style: ${style}\n👤 Client: ${text}\n🎨 Engine: Gemini Pro\n━━━━━━━━━━━━━━━`,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => {
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    }, messageID);

  } catch (e) {
    api.unsendMessage(waitMsg.messageID);
    console.error(e);
    return api.sendMessage("❌ Logo generation failed. Check if server is live or prompt is valid.", threadID, messageID);
  }
};
