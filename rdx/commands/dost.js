const axios = require("axios");

module.exports.config = {
  name: "dost",
  version: "2.0.0",
  credits: "Ahmad RDX",
  description: "Create a Premium Side-by-Side Friend Frame",
  commandCategory: "Social",
  usages: "[@mention]",
  cooldowns: 10
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID, mentions } = event;

  // 1. Identify User 2 (The Friend)
  let friendID;
  let friendName;

  if (Object.keys(mentions).length > 0) {
    friendID = Object.keys(mentions)[0]; // Agar mention kiya hai
    friendName = mentions[friendID].replace("@", "");
  } else if (event.messageReply) {
    friendID = event.messageReply.senderID; // Agar reply kiya hai
    friendName = "Friend"; 
  } else {
    return api.sendMessage("⚠️ Ustad ji, kisi dost ko mention karein! (e.g. #friend @Ali)", threadID, messageID);
  }

  // 2. Get User 1 Info (Sender)
  const senderInfo = await api.getUserInfo(senderID);
  const senderName = senderInfo[senderID].name;

  api.sendMessage(`✨ **Designing Premium Frame...**\nCreating memory for ${senderName} & ${friendName} ⏳`, threadID, messageID);

  try {
    // 3. Construct HD Profile Picture URLs
    const avatar1 = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const avatar2 = `https://graph.facebook.com/${friendID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

    // 4. Call Your API
    const apiUrl = `https://ytdownload-8wpk.onrender.com/api/friend?url1=${encodeURIComponent(avatar1)}&url2=${encodeURIComponent(avatar2)}`;

    // 5. Send the Image
    api.sendMessage({
      body: `🌟 **SIDE-BY-SIDE ON THE JOURNEY** 🌟\n\nTrue friends are the family we choose.\n\n🦅 **Created by:** Ahmad RDX AI`,
      attachment: await global.utils.getStreamFromURL(apiUrl)
    }, threadID, messageID);

  } catch (e) {
    console.log(e);
    api.sendMessage("❌ API timeout ya error! Dobara try karein.", threadID, messageID);
  }
};
