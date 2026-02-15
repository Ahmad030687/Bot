const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "me",
  version: "1.5.0",
  hasPermssion: 0,
  credits: "AHMAD RDX",
  description: "Displays your RDX Premium Identity Card (Fixed)",
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
    // 1. Get User Info
    const users = await api.getUserInfo(senderID);
    let name = users[senderID]?.name || "RDX User";
    let gender = users[senderID]?.gender == 2 ? "Male" : "Female";

    // 🔥 BOSS OVERRIDE: Agar aapki ID ho to zabardasti sahi data dikhaye
    if (senderID == "61577631137537") {
       name = "AHMAD RDX";
       gender = "Male";
    }

    const ranks = ["Elite Member", "RDX Certified", "Alpha User", "Premium Soldier"];
    const randomRank = ranks[senderID % ranks.length];

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

    // 2. Direct Image Link (No Token Needed for Public Profile)
    const avatarUrl = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&type=large`;

    try {
      await fs.ensureDir(cacheDir);
      const imgRes = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
      fs.writeFileSync(avatarPath, Buffer.from(imgRes.data));

      return api.sendMessage({
        body: idCard,
        attachment: fs.createReadStream(avatarPath)
      }, threadID, () => fs.unlinkSync(avatarPath), messageID);

    } catch (imgError) {
      // Agar image block ho, to placeholder use karein
      return api.sendMessage(idCard, threadID, messageID);
    }

  } catch (error) {
    api.sendMessage(`❌ ${rdx_header}\n${line}\nSystem Error!`, threadID, messageID);
  }
};
