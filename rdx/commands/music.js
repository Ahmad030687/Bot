const axios = require('axios');
const ytdl = require('ytdl-core');
const yts = require('yt-search');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "music",
  version: "1.5.1",
  hasPermssion: 0,
  credits: "Ahmad Ali Safdar",
  description: "YouTube se Audio ya Video download karein",
  commandCategory: "media",
  usages: "music [audio/video] [song name]",
  cooldowns: 10
};

// ✅ Apni YouTube API Key yahan daalo (safe)
const YOUTUBE_API_KEY = "AIzaSyBnqRuwuxAQ_9oB9G5JenTfSrRe7XyYiNA";

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const type = args[0]?.toLowerCase();
  const query = args.slice(1).join(" ");

  if (!type || !query || (type !== 'audio' && type !== 'video')) {
    return api.sendMessage(
      `⚠️ Ghalat Tariqa!\nSahi tariqa: #music [audio/video] [name]\n\nExample: #music audio Mere Humsafar`,
      threadID, messageID
    );
  }

  try {
    await api.sendMessage(`🔍 "${query}" dhoonda ja raha hai...`, threadID, messageID);

    // 1️⃣ YouTube Search using yt-search
    const search = await yts(query);
    const video = search.videos[0];
    if (!video) return api.sendMessage("❌ Kuch nahi mila!", threadID, messageID);

    // 2️⃣ File Path
    const ext = type === 'audio' ? 'mp3' : 'mp4';
    const cacheDir = path.join(__dirname, '/cache');
    fs.ensureDirSync(cacheDir);
    const filePath = path.join(cacheDir, `${Date.now()}.${ext}`);

    // 3️⃣ Download Options
    const options = type === 'audio' 
      ? { filter: 'audioonly', quality: 'highestaudio' } 
      : { quality: 'highest', filter: item => item.container === 'mp4' };

    const stream = ytdl(video.url, options);

    stream.pipe(fs.createWriteStream(filePath)).on('finish', async () => {
      const stats = fs.statSync(filePath);
      const sizeMB = stats.size / (1024 * 1024);

      if (sizeMB > 45) {
        fs.unlinkSync(filePath);
        return api.sendMessage("❌ File bohot bari hai (45MB+). Facebook allow nahi karega.", threadID, messageID);
      }

      // 4️⃣ Send File
      await api.sendMessage({
        body: `🎵 Title: ${video.title}\n⏱ Duration: ${video.timestamp}\n🔗 Link: ${video.url}`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath), messageID);
    });

  } catch (e) {
    return api.sendMessage(`❌ Error: ${e.message}`, threadID, messageID);
  }
};
