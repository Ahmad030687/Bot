const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "autoDownload",
    eventType: "message",
    description: "Auto detect and download videos"
  },

  async run({ api, event }) {
    const { threadID, body, messageID, senderID } = event;
    if (!body) return;

    const botID = api.getCurrentUserID();
    if (senderID == botID) return;

    const socialMediaRegex =
      /(?:https?:\/\/)?(?:www\.)?(?:facebook\.com|fb\.watch|instagram\.com|tiktok\.com|twitter\.com|x\.com|youtube\.com|youtu\.be)[^\s]+/gi;

    const matches = body.match(socialMediaRegex);
    if (!matches) return;

    const videoUrl = matches[0];

    let statusMsg = null;
    try {
      statusMsg = await api.sendMessage("⏳ Processing...", threadID);
    } catch {}

    try {
      const apiURL = `https://kojaxd-api.vercel.app/downloader/aiodl?url=${encodeURIComponent(videoUrl)}&apikey=Koja`;

      const res = await axios.get(apiURL);
      const data = res.data;

      if (!data.status) throw new Error("API failed");

      const video =
        data.result.links?.video?.hd?.url ||
        data.result.links?.video?.sd?.url;

      if (!video) throw new Error("Video not found");

      const downloadLink = video.startsWith("http")
        ? video
        : `https://dl1.mnmnmnnnrmnmnnm.shop/${video}`;

      const cacheDir = path.join(__dirname, "../commands/cache");
      await fs.ensureDir(cacheDir);

      const filePath = path.join(cacheDir, `${Date.now()}.mp4`);

      const response = await axios({
        url: downloadLink,
        method: "GET",
        responseType: "stream"
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on("finish", async () => {
        const size = fs.statSync(filePath).size / 1024 / 1024;

        if (size > 80) {
          fs.unlinkSync(filePath);
          if (statusMsg) api.unsendMessage(statusMsg.messageID);
          return api.sendMessage(
            "⚠️ File bada hai\n🔗 " + downloadLink,
            threadID,
            messageID
          );
        }

        await api.sendMessage(
          {
            body: `🎬 ${data.result.title || "Video"}\n📦 ${size.toFixed(2)} MB`,
            attachment: fs.createReadStream(filePath)
          },
          threadID,
          () => fs.unlinkSync(filePath),
          messageID
        );

        if (statusMsg) api.unsendMessage(statusMsg.messageID);
      });

    } catch (e) {
      if (statusMsg) api.unsendMessage(statusMsg.messageID);
      return api.sendMessage("❌ " + e.message, threadID, messageID);
    }
  }
};
