module.exports.config = {
  name: "me",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "AHMAD RDX",
  description: "Displays your RDX Premium Identity Card",
  commandCategory: "Information",
  usages: "",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  
  // 🦅 RDX UI Design
  const rdx_header = "🦅 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐈𝐃𝐄𝐍𝐓𝐈𝐓𝐘 🦅";
  const line = "━━━━━━━━━━━━━━━━━━";
  
  try {
    // Fetching User Information
    const info = await api.getUserInfo(senderID);
    const name = info[senderID].name;
    const gender = info[senderID].gender == 2 ? "Male" : "Female";
    
    // Custom Aura Logic (Ranks)
    const ranks = ["Elite Member", "RDX Certified", "Alpha User", "Premium Soldier"];
    const randomRank = ranks[Math.floor(Math.random() * ranks.length)];
    
    // Formatting the Card
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

    // Sending the text card with profile picture
    return api.sendMessage({
      body: idCard,
      attachment: await global.utils.getStreamFromURL(`https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a368b627040331618c32` || "")
    }, threadID, messageID);

  } catch (error) {
    api.sendMessage(`❌ ${rdx_header}\n${line}\nError fetching your identity!`, threadID, messageID);
  }
};
