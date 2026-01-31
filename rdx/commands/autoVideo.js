module.exports.config = {
  name: "autoVideo",
  version: "2.5.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Automatically downloads videos from links without any command",
};

module.exports.handleEvent = async ({ api, event }) => {
  const axios = require('axios');
  const fs = require('fs-extra');
  const path = require('path');

  const { body, threadID, messageID, senderID } = event;

  // 1. Agar message bot ka apna hai to ignore karo
  if (senderID == api.getCurrentUserID() || !body) return;

  // 2. Social Media Links dhoondne ke liye "Regular Expression" (2026 Updated)
  const videoLinkPattern = /(https?:\/\/(?:www\.)?(?:tiktok\.com|instagram\.com|facebook\.com|fb\.watch|youtube\.com\/shorts|reels|x\.com|twitter\.com)\/\S+)/gi;
  
  const link = body.match(videoLinkPattern);

  if (link) {
    const targetLink = link[0];
    
    // Typing indicator taake user ko pata chale bot kaam kar raha hai
    api.sendTypingIndicator(threadID);

    try {
      // 2026 Fresh Public API Endpoint (No Key Required)
      const res = await axios.get(`https://kaiz-apis.gleeze.com/api/video-downloader?url=${encodeURIComponent(targetLink)}`);
      
      if (res.data && res.data.video) {
        const videoUrl = res.data.video;
        const title = res.data.title || "Social Media Video";
        const cacheDir = path.join(__dirname, 'cache');
        
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
        const filePath = path.join(cacheDir, `auto_${Date.now()}.mp4`);

        // Download to Cache
        const response = await axios({
          url: videoUrl,
          method: 'GET',
          responseType: 'stream'
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
          writer.on('finish', () => {
            const stats = fs.statSync(filePath);
            
            // 25MB Facebook Limit Check
            if (stats.size > 26214400) {
              fs.unlinkSync(filePath);
              return; // Chup chap ignore karein ya error dena ho to api.sendMessage use karein
            }

            // Reply to the original link message
            api.sendMessage({
              body: `🎬 **Auto-Download**\n✨ ${title}\n🦅 SARDAR RDX`,
              attachment: fs.createReadStream(filePath)
            }, threadID, () => fs.unlinkSync(filePath), messageID);
            
            resolve();
          });
          writer.on('error', reject);
        });
      }
    } catch (e) {
      console.log("Auto-Video Error: " + e.message);
    }
  }
};

module.exports.run = async () => {}; // Ye khali rahega

