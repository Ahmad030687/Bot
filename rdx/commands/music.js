const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const yts = require("yt-search");

module.exports.config = {
  name: "music",
  version: "12.0.0", // Direct Version
  hasPermssion: 0,
  credits: "AHMAD RDX",
  description: "Direct Music/Video Downloader with Animation",
  commandCategory: "media",
  usages: "[song name] [audio/video]",
  cooldowns: 5
};

// --- RDX ANIMATION ENGINE ---
const progressBar = (percentage) => {
    const filled = Math.round(percentage / 10);
    const empty = 10 - filled;
    return `[${'█'.repeat(filled)}${'▒'.repeat(empty)}] ${percentage}%`;
};

const frames = [
    "🔎 Searching on YouTube...",
    "💿 Extracting Media info...",
    "🔄 Converting Format...",
    "⬇️ Downloading Content...",
    "✅ Uploading to Chat..."
];

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;

  // 1. INPUT HANDLING (Audio vs Video)
  let lastArg = args[args.length - 1]?.toLowerCase();
  let downloadType = "video"; // Default
  let formatLabel = "𝐕𝐈𝐃𝐄𝐎 (𝐌𝐏𝟒)";
  
  // Check user demand (Audio/Video)
  if (["audio", "mp3", "song"].includes(lastArg)) {
    downloadType = "audio";
    formatLabel = "𝐀𝐔𝐃𝐈𝐎 (𝐌𝐏𝟑)";
    args.pop(); // Remove 'audio' from query
  } else if (["video", "mp4", "watch"].includes(lastArg)) {
    downloadType = "video";
    formatLabel = "𝐕𝐈𝐃𝐄𝐎 (𝐌𝐏𝟒)";
    args.pop(); // Remove 'video' from query
  }

  const query = args.join(" ");
  if (!query) return api.sendMessage("⚠️ Ustad ji, gane ka naam to likhein!\nExample: #music Sadqay audio", threadID, messageID);

  // 2. INITIAL ANIMATION
  let loadingMsg = await api.sendMessage(`🦅 **𝐑𝐃𝐗 𝐌𝐔𝐒𝐈𝐂 𝐒𝐘𝐒𝐓𝐄𝐌**\n\n${progressBar(0)}\nStatus: Request Received...`, threadID);

  try {
    // --- STEP 1: SEARCHING (20%) ---
    await new Promise(r => setTimeout(r, 500));
    await api.editMessage(`🦅 **𝐑𝐃𝐗 𝐌𝐔𝐒𝐈𝐂 𝐒𝐘𝐒𝐓𝐄𝐌**\n\n${progressBar(20)}\nStatus: ${frames[0]}`, loadingMsg.messageID);

    const search = await yts(query);
    const video = search.videos[0]; // Pick the exact first result

    if (!video) {
      return api.editMessage("❌ Maafi ustad, ye gana nahi mila.", loadingMsg.messageID);
    }

    // --- STEP 2: EXTRACTING (40%) ---
    await api.editMessage(`🦅 **𝐑𝐃𝐗 𝐌𝐔𝐒𝐈𝐂 𝐒𝐘𝐒𝐓𝐄𝐌**\n\n${progressBar(40)}\nStatus: Found: "${video.title.substring(0, 15)}..."`, loadingMsg.messageID);

    // 3. API FETCHING (Your provided source)
    const nixUrl = "https://raw.githubusercontent.com/aryannix/stuffs/master/raw/apis.json";
    const apiConfig = await axios.get(nixUrl);
    const nixtube = apiConfig.data.nixtube;

    // --- STEP 3: CONVERTING (60%) ---
    await api.editMessage(`🦅 **𝐑𝐃𝐗 𝐌𝐔𝐒𝐈𝐂 𝐒𝐘𝐒𝐓𝐄𝐌**\n\n${progressBar(60)}\nStatus: ${frames[2]}`, loadingMsg.messageID);

    // Request Download Link
    const res = await axios.get(`${nixtube}?url=${encodeURIComponent(video.url)}&type=${downloadType}&quality=144`); // 144 for fast processing, or remove quality param for best
    const dlLink = res.data.downloadUrl || (res.data.data && res.data.downloadUrl);

    if (!dlLink) throw new Error("API ne link nahi diya.");

    // --- STEP 4: DOWNLOADING FILE (80%) ---
    await api.editMessage(`🦅 **𝐑𝐃𝐗 𝐌𝐔𝐒𝐈𝐂 𝐒𝐘𝐒𝐓𝐄𝐌**\n\n${progressBar(80)}\nStatus: ${frames[3]}`, loadingMsg.messageID);

    const ext = downloadType === "audio" ? "mp3" : "mp4";
    const filePath = path.join(__dirname, "cache", `rdx_music_${Date.now()}.${ext}`);
    const writer = fs.createWriteStream(filePath);

    const streamResponse = await axios({
        url: dlLink,
        method: "GET",
        responseType: "stream"
    });

    streamResponse.data.pipe(writer);

    writer.on("finish", async () => {
        // Check file stats
        const stats = fs.statSync(filePath);
        const sizeMB = stats.size / (1024 * 1024);

        if (sizeMB > 50) {
            fs.unlinkSync(filePath);
            return api.editMessage("⚠️ File bohat bari hai (50MB+), Messenger allow nahi karta.", loadingMsg.messageID);
        }

        // --- STEP 5: UPLOADING (100%) ---
        await api.editMessage(`🦅 **𝐑𝐃𝐗 𝐌𝐔𝐒𝐈𝐂 𝐒𝐘𝐒𝐓𝐄𝐌**\n\n${progressBar(100)}\nStatus: ${frames[4]}`, loadingMsg.messageID);
        await new Promise(r => setTimeout(r, 800)); // Thora wait taake 100% nazar aye
        
        api.unsendMessage(loadingMsg.messageID);

        api.sendMessage({
            body: `🦅 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐏𝐋𝐀𝐘𝐄𝐑**\n━━━━━━━━━━━━━━━━\n🎵 **Title:** ${video.title}\n📺 **Channel:** ${video.author.name}\n💿 **Format:** ${formatLabel}\n📦 **Size:** ${sizeMB.toFixed(1)} MB`,
            attachment: fs.createReadStream(filePath)
        }, threadID, () => fs.unlinkSync(filePath), messageID);
    });

    writer.on("error", (err) => {
        api.editMessage(`❌ Download Error: ${err.message}`, loadingMsg.messageID);
    });

  } catch (e) {
    console.error(e);
    api.editMessage(`❌ **Error:** Gana download nahi ho saka.\nReason: ${e.message}`, loadingMsg.messageID);
  }
};
