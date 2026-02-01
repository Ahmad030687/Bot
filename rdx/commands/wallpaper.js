module.exports.config = {
  name: "wallpaper",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Get random 4K wallpapers",
  commandCategory: "graphics",
  usages: "wallpaper",
  cooldowns: 5
};

module.exports.run = async ({ api, event }) => {
  const axios = require("axios");
  const fs = require("fs-extra");

  try {
    const res = await axios.get(`https://api.unsplash.com/photos/random?orientation=portrait&client_id=Qx0SVJ2CM_1TPTUNJEwRczhqOdc8wz774bWGofpxGA4`);
    const imgUrl = res.data.urls.full;
    const path = __dirname + `/cache/wall_${Date.now()}.jpg`;

    const imgData = (await axios.get(imgUrl, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(path, Buffer.from(imgData, "utf-8"));

    return api.sendMessage({
      body: `🖼️ **𝐀𝐇𝐌𝐀𝐃 WALLPAPER**\n👤 Photographer: ${res.data.user.name}\n🔥 Aura: +100`,
      attachment: fs.createReadStream(path)
    }, event.threadID, () => fs.unlinkSync(path), event.messageID);
  } catch (e) {
    return api.sendMessage("❌ Error fetching wallpaper.", event.threadID);
  }
};

