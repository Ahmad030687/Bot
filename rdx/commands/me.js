const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "me",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "AHMAD RDX",
  description: "Displays your RDX Premium Identity Card",
  commandCategory: "Information",
  usages: "",
  cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, senderID } = event;
  const cacheDir = path.join(__dirname, "cache");
  const avatarPath = path.join(cacheDir, `rdx_avatar_${senderID}.png`);

  const rdx_header = "🦅 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐈𝐃𝐄𝐍𝐓𝐈𝐓𝐘 🦅";
  const line = "━━━━━━━━━━━━━━━━━━";

  try {
    // 1. Get User Info Safely
    const users = await api.getUserInfo(senderID);
    const name = users[senderID]?.name || "RDX User";
    const gender = users[senderID]?.gender == 2 ? "Male" : "Female";

    // 2. Custom Rank Logic
    const ranks = ["Elite Member", "RDX Certified", "Alpha User", "Premium Soldier"];
    const randomRank = ranks[senderID % ranks.length]; // ID base rank to keep it consistent

    const idCard = `${rdx_header}
${line}
👤 𝐍𝐚𝐦𝐞: ${name}
🆔 𝐔𝐈𝐃: ${senderID}
🚻 𝐆𝐞𝐧𝐝𝐞𝐫: ${gender}
🛡️ 𝐑𝐚𝐧𝐤: ${randomRank}
⚡ 𝐒𝐭𝐚𝐭𝐮𝐬: Verified ✅
🔐 𝐂𝐥𝐞𝐚𝐫𝐚𝐧𝐜𝐞: Level 4 (RDX)
${line}
🔥 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗`;

    // 3. Download Profile Picture with Error Handling
    try {
      await fs.ensureDir(cacheDir);
      const imgRes = await axios.get(`https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a368b627040331618c32`, { responseType: 'arraybuffer' });
      fs.writeFileSync(avatarPath, Buffer.from(imgRes.data));

      return api.sendMessage({
        body: idCard,
        attachment: fs.createReadStream(avatarPath)
      }, threadID, () => fs.unlinkSync(avatarPath), messageID);

    } catch (imgError) {
      // If image fails, send only text
      return api.sendMessage(idCard, threadID, messageID);
    }

  } catch (error) {
    console.error(error);
    api.sendMessage(`❌ ${rdx_header}\n${line}\n𝐀𝐡𝐦𝐚𝐝 𝐛𝐡𝐚𝐢, 𝐬𝐲𝐬𝐭𝐞𝐦 𝐦𝐚𝐢𝐧 𝐦𝐚𝐬𝐥𝐚 𝐡𝐚𝐢!`, threadID, messageID);
  }
};
      
