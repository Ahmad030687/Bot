/**
 * ig_advanced.js — SARDAR RDX Instagram Advanced Scraper
 * Author: Ahmad Ali Safdar
 * 2026 | Public scraping only | No API key
 */

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "igadv",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali Safdar",
  description: "Instagram Advanced Scraper | Posts, Reels, Videos, Info",
  commandCategory: "tools",
  usages: "igadv <username or post URL>",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const input = args[0];

  if (!input)
    return api.sendMessage(
      "⚠️ Ahmad bhai, username ya post link do!\nExample:\n#igadv nasa\n#igadv https://www.instagram.com/p/Cxyz123/",
      threadID,
      messageID
    );

  api.sendTypingIndicator(threadID);

  try {
    const isURL = input.startsWith("http");
    let targetURL = isURL
      ? input + "?__a=1&__d=dis"
      : `https://www.instagram.com/${input}/?__a=1&__d=dis`;

    const res = await axios.get(targetURL, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
    });

    const data = res.data;

    let mediaItems = [];
    let message = "";

    // 🟢 Detect type: user profile or single post
    if (data.graphql?.user?.edge_owner_to_timeline_media?.edges) {
      mediaItems = data.graphql.user.edge_owner_to_timeline_media.edges.map(e => e.node);
    } else if (data.graphql?.shortcode_media) {
      mediaItems = [data.graphql.shortcode_media];
    } else {
      return api.sendMessage(
        "❌ Public media nahi mila ya link invalid hai.",
        threadID,
        messageID
      );
    }

    const attachments = [];
    const maxItems = Math.min(mediaItems.length, 3);

    for (let i = 0; i < maxItems; i++) {
      const m = mediaItems[i];

      // ✅ Caption
      const caption = m.edge_media_to_caption?.edges[0]?.node.text || "No caption";
      const likes = m.edge_liked_by?.count || 0;
      const comments = m.edge_media_to_comment?.count || 0;
      const type = m.is_video ? "Video" : "Image";

      message += `📌 Type: ${type}\n📝 Caption: ${caption}\n❤️ Likes: ${likes}\n💬 Comments: ${comments}\n\n`;

      // ✅ Media URL
      let url = m.is_video ? m.video_url || m.display_url : m.display_url;
      if (url) {
        const ext = m.is_video ? ".mp4" : ".jpg";
        const tempPath = path.join(__dirname, `/cache/ig_adv_${Date.now()}_${i}${ext}`);
        const writer = fs.createWriteStream(tempPath);
        const response = await axios({ url, method: "GET", responseType: "stream" });
        response.data.pipe(writer);
        await new Promise(resolve => writer.on("finish", resolve));
        attachments.push(fs.createReadStream(tempPath));
      }
    }

    // ✅ Send all
    return api.sendMessage({ body: message, attachment: attachments }, threadID, () => {
      attachments.forEach((_, idx) => {
        const fileImg = path.join(__dirname, `/cache/ig_adv_${Date.now()}_${idx}.jpg`);
        const fileVid = path.join(__dirname, `/cache/ig_adv_${Date.now()}_${idx}.mp4`);
        if (fs.existsSync(fileImg)) fs.unlinkSync(fileImg);
        if (fs.existsSync(fileVid)) fs.unlinkSync(fileVid);
      });
    }, messageID);

  } catch (err) {
    console.log(err);
    return api.sendMessage(
      "❌ Error! Instagram scraping failed.\nCheck username/post link or try later.",
      threadID,
      messageID
    );
  }
};
