const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "autodl",
    version: "1.0",
    credits: "AHMAD RDX",
    description: "Auto detect link & download",
    eventType: ["message"]
  },

  async run({ api, event }) {
    const { body, threadID, messageID } = event;
    if (!body) return;

    // link regex
    const urlMatch = body.match(/https?:\/\/[^\s]+/);
    if (!urlMatch) return;

    const url = urlMatch[0];

    try {
      const wait = await api.sendMessage("⏳ Downloading...", threadID);

      const apiURL = `https://kojaxd-api.vercel.app/downloader/aiodl?url=${encodeURIComponent(url)}&apikey=Koja`;

      const res = await axios.get(apiURL);
      const data = res.data;

      if (!data.status) throw new Error("API failed.");

      const video =
        data.result.links?.video?.hd?.url ||
        data.result.links?.video?.sd?.url;

      if (!video) throw new Error("Video not found.");

      const downloadLink = video.startsWith("http")
        ? video
        : `https://dl1.mnmnmnnnrmnmnnm.shop/${video}`;

      const cacheDir = path.join(__dirname, "cache");
      fs.ensureDirSync(cacheDir);

      const filePath = path.join(cacheDir, `${Date.now()}.mp4`);

      const response = await axios({
        method: "GET",
        url: downloadLink,
        responseType: "stream",
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on("finish", async () => {
        const size = fs.statSync(filePath).size / (1024 * 1024);

        if (size > 80) {
          fs.unlinkSync(filePath);
          api.unsendMessage(wait.messageID);
          return api.sendMessage(
            `⚠️ File bada hai.\n🔗 ${downloadLink}`,
            threadID,
            messageID
          );
        }

        await api.sendMessage(
          {
            body: `🎬 ${data.result.title || "Video"}\n📦 ${size.toFixed(2)} MB`,
            attachment: fs.createReadStream(filePath),
          },
          threadID,
          () => fs.unlinkSync(filePath),
          messageID
        );

        api.unsendMessage(wait.messageID);
      });

    } catch (e) {
      return api.sendMessage("❌ " + e.message, threadID, messageID);
    }
  }
};
