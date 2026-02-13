const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "auto",
    version: "1.0",
    hasPermssion: 0,
    credits: "AHMAD RDX",
    description: "Download video from link",
    commandCategory: "media",
    usages: "#auto link",
    cooldowns: 5
  },

  run: async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    const url = args[0];
    if (!url) return api.sendMessage("❌ Link do", threadID, messageID);

    let statusMsg;
    try {
      statusMsg = await api.sendMessage("⏳ Downloading...", threadID);
    } catch {}

    try {
      const apiURL = `https://kojaxd-api.vercel.app/downloader/aiodl?url=${encodeURIComponent(url)}&apikey=Koja`;

      const res = await axios.get(apiURL);
      const data = res.data;

      if (!data.status) throw new Error("API fail");

      const video =
        data.result.links?.video?.hd?.url ||
        data.result.links?.video?.sd?.url;

      if (!video) throw new Error("Video not found");

      const downloadLink = video.startsWith("http")
        ? video
        : `https://dl1.mnmnmnnnrmnmnnm.shop/${video}`;

      const cacheDir = path.join(__dirname, "cache");
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
