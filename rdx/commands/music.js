const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const yts = require("yt-search");

module.exports.config = {
  name: "music",
  version: "15.0.0", 
  hasPermssion: 0,
  credits: "AHMAD RDX",
  description: "Private Music/Video Downloader via RDX API",
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
    "🛡️ Connecting to RDX Private API...",
    "🔄 Extracting Direct Link...",
    "⬇️ Downloading Content to Server...",
    "✅ Uploading to Messenger Chat..."
];

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  // 1. INPUT HANDLING
  let lastArg = args[args.length - 1]?.toLowerCase();
  let downloadType = "video"; // Default
  let formatLabel = "𝐕𝐈𝐃𝐄𝐎 (𝐌𝐏𝟒)";
  
  if (["audio", "mp3", "song"].includes(lastArg)) {
    downloadType = "audio";
    formatLabel = "𝐀𝐔𝐃𝐈𝐎 (𝐌𝐏𝟑)";
    args.pop(); 
  } else if (["video", "mp4", "watch"].includes(lastArg)) {
    downloadType = "video";
    formatLabel = "𝐕𝐈𝐃𝐄𝐎 (𝐌𝐏𝟒)";
    args.pop();
  }

  const query = args.join(" ");
  if (!query) return api.sendMessage("⚠️ Ustad ji, gane ka naam to likhein!\nExample: #music Sadqay audio", threadID, messageID);

  // 2. INITIAL LOADING
  let loadingMsg = await api.sendMessage(`🦅 **𝐑𝐃𝐗 𝐌𝐔𝐒𝐈𝐂 𝐒𝐘𝐒𝐓𝐄𝐌**\n\n${progressBar(0)}\nStatus: Request Received...`, threadID);

  try {
    // --- STEP 1: SEARCHING (20%) ---
    await api.editMessage(`🦅 **𝐑𝐃𝐗 𝐌𝐔𝐒𝐈𝐂 𝐒𝐘𝐒𝐓𝐄𝐌**\n\n${progressBar(20)}\nStatus: ${frames[0]}`, loadingMsg.messageID);

    const search = await yts(query);
    const video = search.videos[0];

    if (!video) {
      return api.editMessage("❌ Maafi ustad, ye gana nahi mila.", loadingMsg.messageID);
    }

    // --- STEP 2: PRIVATE API CONNECTION (40%) ---
    await api.editMessage(`🦅 **𝐑𝐃𝐗 𝐌𝐔𝐒𝐈𝐂 𝐒𝐘𝐒𝐓𝐄𝐌**\n\n${progressBar(40)}\nStatus: ${frames[1]}`, loadingMsg.messageID);

    // 🛡️ AHMAD RDX PRIVATE API URL (Tested & Working)
    const privateKey = "ahmad_rdx_private_786";
    const myApiUrl = `https://simapi-no8v.onrender.com/download?url=${encodeURIComponent(video.url)}&type=${downloadType}&key=${privateKey}`;

    // --- STEP 3: FETCHING LINK (60%) ---
    await api.editMessage(`🦅 **𝐑𝐃𝐗 𝐌𝐔𝐒𝐈𝐂 𝐒𝐘𝐒𝐓𝐄𝐌**\n\n${progressBar(60)}\nStatus: ${frames[2]}`, loadingMsg.messageID);
    
    const res = await axios.get(myApiUrl);
    const dlLink = res.data.downloadUrl;

    if (!dlLink) throw new Error("API ne download link nahi diya!");

    // --- STEP 4: DOWNLOADING TO CACHE (80%) ---
    await api.editMessage(`🦅 **𝐑𝐃𝐗 𝐌𝐔𝐒𝐈𝐂 𝐒𝐘𝐒𝐓𝐄𝐌**\n\n${progressBar(80)}\nStatus: ${frames[3]}`, loadingMsg.messageID);

    const ext = downloadType === "audio" ? "mp3" : "mp4";
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
    
    const filePath = path.join(cacheDir, `rdx_${Date.now()}.${ext}`);
    
    const writer = fs.createWriteStream(filePath);
    const streamResponse = await axios({
        url: dlLink,
        method: "GET",
        responseType: "stream"
    });

    streamResponse.data.pipe(writer);

    writer.on("finish", async () => {
        const stats = fs.statSync(filePath);
        const sizeMB = stats.size / (1024 * 1024);

        if (sizeMB > 50) {
            fs.unlinkSync(filePath);
            return api.editMessage("⚠️ File bohat bari hai (50MB+), Messenger allow nahi karta.", loadingMsg.messageID);
        }

        // --- STEP 5: UPLOADING (100%) ---
        await api.editMessage(`🦅 **𝐑𝐃𝐗 𝐌𝐔𝐒𝐈𝐂 𝐒𝐘𝐒𝐓𝐄𝐌**\n\n${progressBar(100)}\nStatus: ${frames[4]}`, loadingMsg.messageID);
        
        setTimeout(() => api.unsendMessage(loadingMsg.messageID), 1000);

        api.sendMessage({
            body: `🦅 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐏𝐋𝐀𝐘𝐄𝐑**\n━━━━━━━━━━━━━━━━━━\n🎵 **Title:** ${video.title}\n📺 **Channel:** ${video.author.name}\n💿 **Format:** ${formatLabel}\n📦 **Size:** ${sizeMB.toFixed(1)} MB\n━━━━━━━━━━━━━━━━━━\n✅ **Source:** RDX Private Server`,
            attachment: fs.createReadStream(filePath)
        }, threadID, () => fs.unlinkSync(filePath), messageID);
    });

    writer.on("error", (err) => {
        api.editMessage(`❌ Download Error: ${err.message}`, loadingMsg.messageID);
    });

  } catch (e) {
    console.error(e);
    api.editMessage(`❌ **Error:** Ahmad bhai, system fail ho gaya.\nReason: ${e.message}`, loadingMsg.messageID);
  }
};
