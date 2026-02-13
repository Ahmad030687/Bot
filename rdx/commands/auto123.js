const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "auto",
    version: "2026",
    hasPermssion: 0,
    credits: "Ahmad",
    description: "Universal downloader with detection",
    commandCategory: "media",
    usages: "#auto link",
    cooldowns: 5
  },

  run: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const link = args.join(" ");

    if (!link) return api.sendMessage("❌ Link do", threadID, messageID);

    // ✅ Platform detect
    let platform = "Media";
    if (link.includes("facebook") || link.includes("fb.watch")) platform = "Facebook";
    else if (link.includes("instagram")) platform = "Instagram";
    else if (link.includes("tiktok")) platform = "TikTok";
    else if (link.includes("youtube") || link.includes("youtu.be")) platform = "YouTube";

    let status;
    try {
      status = await api.sendMessage(`⏳ ${platform} download ho raha...`, threadID);
    } catch {}

    try {
      const apiURL = `https://kojaxd-api.vercel.app/downloader/aiodl?url=${encodeURIComponent(link)}&apikey=Koja`;

      const res = await axios.get(apiURL);
      const data = res.data;

      if (!data.status) throw new Error("Private ya invalid link");

      const video =
        data.result.links?.video?.hd?.url ||
        data.result.links?.video?.sd?.url;

      if (!video) throw new Error("Video nahi mila");

      const downloadLink = video.startsWith("http")
        ? video
        : `https://dl1.mnmnmnnnrmnmnnm.shop/${video}`;

      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);

      const filePath = path.join(cacheDir, `${Date.now()}.mp4`);

      const response = await axios({
        url: downloadLink,
        method: "GET",
        responseType: "stream",
        timeout: 120000
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on("finish", async () => {
        const size = fs.statSync(filePath).size / 1024 / 1024;

        // Messenger limit
        if (size > 25) {
          fs.unlinkSync(filePath);
          if (status) api.unsendMessage(status.messageID);
          return api.sendMessage(
            `⚠️ File bari hai (${size.toFixed(2)}MB)\n🔗 ${downloadLink}`,
            threadID,
            messageID
          );
        }

        await api.sendMessage(
          {
            body: `📥 Platform: ${platform}\n📦 Size: ${size.toFixed(2)} MB\n📝 ${data.result.title || "Video"}`,
            attachment: fs.createReadStream(filePath)
          },
          threadID,
          () => fs.unlinkSync(filePath),
          messageID
        );

        if (status) api.unsendMessage(status.messageID);
      });

    } catch (e) {
      if (status) api.unsendMessage(status.messageID);
      return api.sendMessage("❌ " + e.message, threadID, messageID);
    }
  }
};
