const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "dost",
  version: "5.0.0",
  credits: "Ahmad RDX",
  description: "Friend Frame (Buffer Method)",
  commandCategory: "Social",
  usages: "[Reply/Mention]",
  cooldowns: 10
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID, mentions, type, messageReply } = event;
  
  // 1. Friend Selection Logic
  let friendID, friendName;
  if (type === "message_reply") {
     friendID = messageReply.senderID;
     friendName = "Bestie";
  } else if (Object.keys(mentions).length > 0) {
     friendID = Object.keys(mentions)[0];
     friendName = mentions[friendID].replace("@", "");
  } else {
     return api.sendMessage("⚠️ Ustad ji, kisi dost ko mention karein ya reply karein!", threadID, messageID);
  }

  // 2. Sender Logic
  let senderName = "Me";
  
  api.sendMessage(`🎨 **Designing Frame...**\nWait karain ustad, painting ho rahi hai! ⏳`, threadID, messageID);

  try {
    const avatar1 = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const avatar2 = `https://graph.facebook.com/${friendID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

    // 3. API Call with ARRAYBUFFER (Ye hai main fix)
    const apiUrl = `https://ytdownload-8wpk.onrender.com/api/friend?url1=${encodeURIComponent(avatar1)}&url2=${encodeURIComponent(avatar2)}`;
    
    const { data } = await axios.get(apiUrl, { 
        responseType: "arraybuffer"  // Image ko data ki shakal mein lata hai
    });

    // 4. Save Image Locally
    const pathImg = path.join(__dirname, "cache", `friend_${senderID}.png`);
    fs.writeFileSync(pathImg, Buffer.from(data, "utf-8"));

    // 5. Send Image
    api.sendMessage({
      body: `🌟 **BEST FRIENDS FOREVER** 🌟\n\n🦅 **Created by:** Ahmad RDX AI`,
      attachment: fs.createReadStream(pathImg)
    }, threadID, () => fs.unlinkSync(pathImg), messageID); // Bhejne ke baad delete

  } catch (e) {
    console.error(e);
    api.sendMessage(`❌ Error: API response nahi de rahi. Shayad server busy hai.\nError Details: ${e.message}`, threadID, messageID);
  }
};
