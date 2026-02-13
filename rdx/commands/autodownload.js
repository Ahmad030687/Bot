const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "linkAutoDownload",
    version: "1.5.0",
    hasPermssion: 0,
    credits: "AHMAD RDX", // ✅ Updated to Your Name
    description: "Auto detects links and downloads using arif-babu library",
    commandCategory: "Utilities",
    usages: "",
    cooldowns: 5,
  },

  // 🛡️ RDX CREDIT PROTECTION
  onLoad: function () {
    const fs = require("fs");
    const path = __filename;
    const fileData = fs.readFileSync(path, "utf8");

    if (!fileData.includes('credits: "AHMAD RDX"')) {
      console.log("\n❌ [RDX ERROR]: Credits changed! Bot is shutting down. ❌\n");
      process.exit(1);
    }
  },

  run: async function () {},

  handleEvent: async function ({ api, event }) {
    // 🦅 RDX Premium UI Elements
    const rdx_header = "🦅 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐀𝐔𝐓𝐎-𝐃𝐋 🦅";
    const line = "━━━━━━━━━━━━━━━━━━";

    const { alldown } = require("arif-babu-downloader");
    const body = (event.body || "").toLowerCase();

    // Link check
    if (!body.startsWith("https://")) return;

    try {
      // ⏳ Reaction start
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      // 📥 Using your required library
      const data = await alldown(event.body);

      if (!data || !data.data || !data.data.high) {
        return; // Silent fail if link not supported by library
      }

      const videoURL = data.data.high;

      // 📥 Download as Buffer for stability
      const response = await axios.get(videoURL, { responseType: "arraybuffer" });
      const buffer = Buffer.from(response.data);

      const filePath = path.join(__dirname, "cache", `rdx_auto_${Date.now()}.mp4`);
      await fs.ensureDir(path.join(__dirname, "cache"));
      fs.writeFileSync(filePath, buffer);

      const sizeMB = (buffer.length / (1024 * 1024)).toFixed(2);

      // ✅ Reaction Success
      api.setMessageReaction("✅", event.messageID, () => {}, true);

      // 📤 Sending with RDX Branding
      return api.sendMessage(
        {
          body: `${rdx_header}\n${line}\n✅ 𝐀𝐮𝐭𝐨 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐂𝐨𝐦𝐩𝐥𝐞𝐭𝐞!\n📦 𝐒𝐢𝐳𝐞: ${sizeMB} MB\n${line}\n🔥 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗`,
          attachment: [fs.createReadStream(filePath)], // Array mode for FCA stability
        },
        event.threadID,
        (err) => {
           if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        },
        event.messageID
      );
    } catch (err) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      console.error("RDX Auto-DL Error:", err);
    }
  },
};
