const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "dost",
    aliases: ["friendship", "bestie"],
    description: "Create Friendship Frame with PFPs",
    credits: "SARDAR RDX",
    usage: "dost [mention/reply]",
    category: "Graphics",
    prefix: true
  },

  async run({ api, event, args }) {
    const { threadID, messageID, senderID, mentions, messageReply } = event;

    // 1. IDs nikaalne ki logic (Same as User command)
    let uid1 = senderID; 
    let uid2;

    if (Object.keys(mentions).length > 0) {
      uid2 = Object.keys(mentions)[0];
    } else if (messageReply) {
      uid2 = messageReply.senderID;
    } else {
      return api.sendMessage("🚫 Ustad ji, dost ko mention karein ya uski chat pe reply karein!", threadID, messageID);
    }

    api.sendMessage("⏳ Ahmad RDX frame design kar raha hai, thora sabar...", threadID, messageID);

    try {
      // 2. High Quality Profile Pictures URLs (Access Token Fix)
      const token = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";
      const pfp1 = `https://graph.facebook.com/${uid1}/picture?width=720&height=720&access_token=${token}`;
      const pfp2 = `https://graph.facebook.com/${uid2}/picture?width=720&height=720&access_token=${token}`;

      // 3. API Request (Render Link)
      const renderURL = "https://ytdownload-8wpk.onrender.com"; // ⚠️ Apna render link check kar lein
      const apiUrl = `${renderURL}/api/dost?u1=${encodeURIComponent(pfp1)}&u2=${encodeURIComponent(pfp2)}`;
      
      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
      
      // 4. Cache Management
      const cacheDir = path.join(__dirname, 'cache');
      fs.ensureDirSync(cacheDir);
      const cachePath = path.join(cacheDir, `dost_${uid1}_${uid2}.png`);
      
      fs.writeFileSync(cachePath, Buffer.from(response.data));

      // 5. Final Output
      return api.sendMessage({
        body: "🦅 **SARDAR RDX SPECIAL DOSTI FRAME** 🦅",
        attachment: fs.createReadStream(cachePath)
      }, threadID, () => {
        try { fs.unlinkSync(cachePath); } catch(e) {}
      }, messageID);

    } catch (error) {
      console.error(error);
      return api.sendMessage("❌ Error: API ne response nahi diya. Render par logs check karein!", threadID, messageID);
    }
  }
};
