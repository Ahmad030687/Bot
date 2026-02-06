const axios = require("axios");

module.exports.config = {
  name: "dost",
  version: "3.0.0",
  credits: "Ahmad RDX",
  description: "Premium Friend Frame (Reply or Mention)",
  commandCategory: "Social",
  usages: "[@mention] or [Reply]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID, mentions, type, messageReply } = event;

  let friendID;
  let friendName;

  // 1. Check Priority: Reply > Mention > Error
  if (type === "message_reply") {
    // Agar user ne kisi message par Reply kiya hai
    friendID = messageReply.senderID;
    // Reply wale bande ka naam nikalne ki koshish
    try {
      const userInfo = await api.getUserInfo(friendID);
      friendName = userInfo[friendID].name;
    } catch (e) {
      friendName = "Bestie"; // Agar naam na mile
    }
  } 
  else if (Object.keys(mentions).length > 0) {
    // Agar user ne Mention kiya hai
    friendID = Object.keys(mentions)[0];
    friendName = mentions[friendID].replace("@", "");
  } 
  else {
    // Agar dono fail ho jayen
    return api.sendMessage("⚠️ Ustad ji, tareeqa galat hai!\n\n1. Kisi dost ko **Mention** karein (@Ali)\n2. Ya uske message par **Reply** karke #friend likhein.", threadID, messageID);
  }

  // 2. Sender (Aap) ka Info
  let senderName;
  try {
    const senderInfo = await api.getUserInfo(senderID);
    senderName = senderInfo[senderID].name;
  } catch (e) {
    senderName = "Me";
  }

  api.sendMessage(`✨ **Designing Frame...**\nCreating memory for ${senderName} & ${friendName} ⏳`, threadID, messageID);

  try {
    // 3. HD Profile Pictures Uthana
    const avatar1 = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const avatar2 = `https://graph.facebook.com/${friendID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

    // 4. API Call (Aapki apni API)
    const apiUrl = `https://ytdownload-8wpk.onrender.com/api/friend?url1=${encodeURIComponent(avatar1)}&url2=${encodeURIComponent(avatar2)}`;

    // 5. Send Image
    api.sendMessage({
      body: `🌟 **SIDE-BY-SIDE ON THE JOURNEY** 🌟\n\nTrue friends are the family we choose.\n\n🦅 **Created by:** Ahmad RDX AI`,
      attachment: await global.utils.getStreamFromURL(apiUrl)
    }, threadID, messageID);

  } catch (e) {
    console.log(e);
    api.sendMessage("❌ API Error! Shayad internet slow hai ya frame load nahi hua.", threadID, messageID);
  }
};
