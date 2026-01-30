const axios = require('axios');
const ytdl = require('ytdl-core');
const yts = require('yt-search');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "music",
  version: "1.5.0",
  hasPermssion: 0,
  credits: "Ahmad Ali Safdar",
  description: "YouTube se Audio ya Video download karein",
  commandCategory: "media",
  usages: "music [audio/video] [song name]",
  cooldowns: 10
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const type = args[0]?.toLowerCase();
  const query = args.slice(1).join(" ");

  // 1. Validation
  if (!type || !query || (type !== 'audio' && type !== 'video')) {
    return api.sendMessage(`⚠️ Ghalat Tariqa!\nSahi tariqa: #music [audio/video] [name]\n\nExample: #music audio Mere Humsafar`, threadID, messageID);
  }

  try {
    api.sendMessage(`🔍 "${query}" dhoonda ja raha hai...`, threadID, messageID);

    // 2. Search YouTube
    const search = await yts(query);
    const video = search.videos[0];
    if (!video) return api.sendMessage("❌ Kuch nahi mila!", threadID, messageID);

    // 3. Prepare File Path
    const ext = type === 'audio' ? 'mp3' : 'mp4';
    const filePath = path.join(__dirname, `/cache/${Date.now()}.${ext}`);
    fs.ensureDirSync(path.join(__dirname, '/cache'));

    // 4. Download Logic
    const options = type === 'audio' 
      ? { filter: 'audioonly', quality: 'highestaudio' } 
      : { quality: 'highest', filter: 'item => item.container === "mp4"' };

    const stream = ytdl(video.url, options);

    stream.pipe(fs.createWriteStream(filePath)).on('finish', async () => {
      const stats = fs.statSync(filePath);
      const sizeMB = stats.size / (1024 * 1024);

      // Facebook Limit Check (Approx 45MB safe limit)
      if (sizeMB > 45) {
        fs.unlinkSync(filePath);
        return api.sendMessage("❌ File bohot bari hai (45MB+). Facebook allow nahi karega.", threadID, messageID);
      }

      // 5. Send File
      await api.sendMessage({
        body: `🎵 𝐓𝐢𝐭𝐥𝐞: ${video.title}\n⏱️ 𝐃𝐮𝐫𝐚𝐭𝐢𝐨𝐧: ${video.timestamp}\n🔗 𝐋𝐢𝐧𝐤: ${video.url}`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath), messageID);
    });

  } catch (e) {
    return api.sendMessage(`❌ Error: ${e.message}`, threadID, messageID);
  }
};
