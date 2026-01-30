const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: "music",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali Safdar",
  description: "YouTube Music/Video using Official Google API Key",
  commandCategory: "media",
  usages: "music [audio/video] [song name]",
  cooldowns: 10
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const type = args[0]?.toLowerCase();
  const query = args.slice(1).join(" ");
  const apiKey = "AIzaSyCrDsoqkZKHRH9tX_FF0FpIYBGAeefHu2E"; // Aapki Official Key

  if (!type || !query || (type !== 'audio' && type !== 'video')) {
    return api.sendMessage(`⚠️ Sahi Tariqa:\n#music audio [song name]\n#music video [song name]`, threadID, messageID);
  }

  try {
    api.sendMessage(`🔍 Google API se "${query}" dhoonda ja raha hai...`, threadID, messageID);

    // 1. Google Official Search (Bahut Fast aur Accurate)
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&key=${apiKey}&maxResults=1`;
    const searchRes = await axios.get(searchUrl);
    const video = searchRes.data.items[0];

    if (!video) return api.sendMessage("❌ YouTube par kuch nahi mila!", threadID, messageID);

    const videoId = video.id.videoId;
    const videoTitle = video.snippet.title;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    // 2. Download Processing (Stable API se)
    // Hum aik aisi API use karenge jo sirf download ka link de
    const dlUrl = `https://api.vyt-dl.xyz/download?url=${videoUrl}&type=${type}`; 
    // Note: Agar ye API busy ho to hum Priyanshu ya kisi aur ka link yahan daal sakte hain
    const res = await axios.get(`https://priyanshuapi.xyz/api/v2/yt-dl?url=${videoUrl}&type=${type}`);

    if (!res.data.status) return api.sendMessage("❌ Server Busy! Phir se try karein.", threadID, messageID);

    const fileUrl = res.data.data.download_url;
    const ext = type === 'audio' ? 'mp3' : 'mp4';
    const filePath = path.join(__dirname, `/cache/${Date.now()}.${ext}`);

    // 3. Streaming File to Cache
    const fileRes = await axios({ method: 'GET', url: fileUrl, responseType: 'stream' });
    const writer = fs.createWriteStream(filePath);
    fileRes.data.pipe(writer);

    writer.on('finish', async () => {
      const stats = fs.statSync(filePath);
      if (stats.size > 47185920) { // 45MB Limit
        fs.unlinkSync(filePath);
        return api.sendMessage("❌ File 45MB se bari hai, Facebook allow nahi karega.", threadID, messageID);
      }

      await api.sendMessage({
        body: `🎵 𝐓𝐢𝐭𝐥𝐞: ${videoTitle}\n🔗 𝐋𝐢𝐧𝐤: ${videoUrl}\n\n🤪 Ahmad RDX System`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath), messageID);
    });

  } catch (e) {
    return api.sendMessage(`❌ Error: Google API limit khatam ho sakti hai ya server down hai.`, threadID, messageID);
  }
};
