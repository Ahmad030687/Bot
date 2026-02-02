const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "facebook",
  version: "25.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Ahmad RDX Private Unlimited Downloader",
};

module.exports.handleEvent = async ({ api, event }) => {
  const { threadID, messageID, body } = event;
  if (!body || (!body.includes("facebook.com") && !body.includes("fb.watch"))) return;

  // 🦅 AAPKA APNA LIVE LINK
  const RDX_API = "https://ahmad-rdx-api.onrender.com/ahmad-dl";

  try {
    // Apni API ko call kar rahe hain
    const res = await axios.get(`${RDX_API}?url=${encodeURIComponent(body)}`);
    
    if (res.data.status && res.data.url) {
      const videoUrl = res.data.url;
      const filePath = path.join(__dirname, `/cache/rdx_vid_${Date.now()}.mp4`);
      
      const stream = await axios({ url: videoUrl, method: 'GET', responseType: 'stream' });
      const writer = fs.createWriteStream(filePath);
      stream.data.pipe(writer);

      writer.on('finish', () => {
        api.sendMessage({ 
          body: "🦅 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 - PRIVATE ENGINE**\n\nStatus: Unlimited", 
          attachment: fs.createReadStream(filePath) 
        }, threadID, () => {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }, messageID);
      });
    }
  } catch (e) {
    console.log("RDX API Error:", e.message);
  }
};

module.exports.run = async () => {};
