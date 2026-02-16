const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const yts = require("yt-search");

module.exports.config = {
  name: "music",
  version: "100.0.0", // Final Working Version
  hasPermssion: 0,
  credits: "AHMAD RDX",
  description: "RDX Heavy Music System (No Errors)",
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
    "🛡️ Bypassing YouTube Security...",
    "🔄 Extracting High Quality Link...",
    "⬇️ Downloading to RDX Server...",
    "✅ Sending to Chat..."
];

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  // 1. INPUT HANDLING
  let lastArg = args[args.length - 1]?.toLowerCase();
  let downloadType = "video";
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
  if (!query) return api.sendMessage("🦅 Ahmad bhai, gane ka naam to likhein!\nExample: #music Sadqay audio", threadID, messageID);

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

    // --- STEP 2: FETCHING WORKING API (40%) ---
    await api.editMessage(`🦅 **𝐑𝐃𝐗 𝐌𝐔𝐒𝐈𝐂 𝐒𝐘𝐒𝐓𝐄𝐌**\n\n${progressBar(40)}\nStatus: ${frames[1]}`, loadingMsg.messageID);

    // Using the stable API source provided by you
    const nixUrl = "https://raw.githubusercontent.com/aryannix/stuffs/master/raw/apis.json";
    const apiConfig = await axios.get(nixUrl);
    const nixtube = apiConfig.data.nixtube;

    // --- STEP 3: GETTING DOWNLOAD LINK (60%) ---
    await api.editMessage(`🦅 **𝐑𝐃𝐗 𝐌𝐔𝐒𝐈𝐂 𝐒𝐘𝐒𝐓𝐄𝐌**\n\n${progressBar(60)}\nStatus: ${frames[2]}`, loadingMsg.messageID);

    // Quality 144 is safer for speed, remove quality param if you want HD
    const res = await axios.get(`${nixtube}?url=${encodeURIComponent(video.url)}&type=${downloadType}`);
    const dlLink = res.data.downloadUrl || (res.data.data && res.data.downloadUrl);

    if (!dlLink) throw new Error("API ne link nahi diya.");

    // --- STEP 4: DOWNLOADING FILE (80%) ---
    await api.editMessage(`🦅 **𝐑𝐃𝐗 𝐌𝐔𝐒𝐈𝐂 𝐒𝐘𝐒𝐓𝐄𝐌**\n\n${progressBar(80)}\nStatus: ${frames[3]}`, loadingMsg.messageID);

    const ext = downloadType === "audio" ? "mp3" : "mp4";
    const cachePath = path.join(__dirname, "cache");
    if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);
    
    const filePath = path.join(cachePath, `rdx_${Date.now()}.${ext}`);
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
        
        // Thora wait taake user 100% dekh sake
        setTimeout(() => api.unsendMessage(loadingMsg.messageID), 1000);

        api.sendMessage({
            body: `🦅 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐏𝐋𝐀𝐘𝐄𝐑**\n━━━━━━━━━━━━━━━━━━\n🎵 **Title:** ${video.title}\n📺 **Channel:** ${video.author.name}\n💿 **Format:** ${formatLabel}\n📦 **Size:** ${sizeMB.toFixed(1)} MB\n━━━━━━━━━━━━━━━━━━\n✅ **Powered By:** RDX Systems`,
            attachment: fs.createReadStream(filePath)
        }, threadID, () => fs.unlinkSync(filePath), messageID);
    });

    writer.on("error", (err) => {
        api.editMessage(`❌ Download Error: ${err.message}`, loadingMsg.messageID);
    });

  } catch (e) {
    console.error(e);
    api.editMessage(`❌ **Error:** Ahmad bhai, masla aa gaya.\nReason: ${e.message}`, loadingMsg.messageID);
  }
};
