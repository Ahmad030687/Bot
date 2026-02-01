module.exports.config = {
  name: "pic",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Search HD Photos from Unsplash",
  commandCategory: "graphics",
  usages: "pic [query]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const axios = require("axios");
  const fs = require("fs-extra");
  const { threadID, messageID } = event;
  const query = args.join(" ");

  if (!query) return api.sendMessage("⚠️ Kya dhoondna hai Ahmad bhai? (e.g. #pic dark aesthetic)", threadID, messageID);

  try {
    const res = await axios.get(`https://api.unsplash.com/search/photos?page=1&query=${encodeURIComponent(query)}&client_id=Qx0SVJ2CM_1TPTUNJEwRczhqOdc8wz774bWGofpxGA4`);
    
    if (res.data.results.length == 0) return api.sendMessage("❌ Kuch nahi mila boss!", threadID, messageID);

    // Pehli best image uthao
    const imgUrl = res.data.results[0].urls.regular;
    const path = __dirname + `/cache/unsplash_${Date.now()}.jpg`;

    const imgData = (await axios.get(imgUrl, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(path, Buffer.from(imgData, "utf-8"));

    return api.sendMessage({
      body: `📸 **UNSPLASH HD**\n🔍 Search: ${query}\n🦅 AHMAD RDX`,
      attachment: fs.createReadStream(path)
    }, threadID, () => fs.unlinkSync(path), messageID);

  } catch (e) {
    return api.sendMessage("❌ API Limit reached ya koi error hai.", threadID);
  }
};
