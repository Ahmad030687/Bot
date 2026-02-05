const { createCanvas, loadImage } = require('canvas');
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "dp",
  version: "105.ULTIMATE",
  credits: "AHMAD RDX",
  description: "Heavy DP Maker - 400 Error Fix & Bottom Center Style",
  commandCategory: "Media",
  usages: "[StyleNo] [Name] - Reply to photo",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, messageReply } = event;

  // Image Check
  if (!messageReply || !messageReply.attachments[0] || messageReply.attachments[0].type !== "photo") {
    return api.sendMessage("⚠️ **AHMAD RDX:** Kisi photo par reply karein aur Name likhein!", threadID, messageID);
  }

  const styleNo = parseInt(args[0]) || 1;
  const nameText = args.slice(1).join(" ").toUpperCase().substring(0, 15) || "AHMAD";
  const imgUrl = messageReply.attachments[0].url;
  const cachePath = path.join(__dirname, "cache", `rdx_final_${Date.now()}.png`);

  if (!fs.existsSync(path.join(__dirname, "cache"))) fs.mkdirSync(path.join(__dirname, "cache"));

  const processing = await api.sendMessage(`🎨 **AHMAD CREATIONS:** Fetching Image & Applying Heavy Style #${styleNo}...`, threadID);

  try {
    // --- 🛠️ STEP 1: FIXING 400 ERROR (Manual Buffer Fetch) ---
    const response = await axios.get(imgUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    });
    
    const imageBuffer = Buffer.from(response.data, 'binary');
    const baseImg = await loadImage(imageBuffer);
    
    const canvas = createCanvas(baseImg.width, baseImg.height);
    const ctx = canvas.getContext('2d');
    const [W, H] = [canvas.width, canvas.height];

    // 1. Draw Background
    ctx.drawImage(baseImg, 0, 0, W, H);

    // --- 📐 STEP 2: POSITION & SIZE (Down Center Specific) ---
    const mainFontSize = Math.floor(W * 0.18); // Heavy size relative to width
    const baseY = H * 0.82; // 82% Niche (Down Center)
    
    // Bottom Overlay (For Text Contrast)
    const overlay = ctx.createLinearGradient(0, H * 0.6, 0, H);
    overlay.addColorStop(0, 'rgba(0,0,0,0)');
    overlay.addColorStop(1, 'rgba(0,0,0,0.85)');
    ctx.fillStyle = overlay;
    ctx.fillRect(0, H * 0.6, W, H * 0.4);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 200+ Styles Color Logic
    const hue = (styleNo * 137.5) % 360;
    const primaryColor = `hsl(${hue}, 100%, 65%)`;

    // 2. --- LAYERED HEAVY TEXT EFFECTS ---
    ctx.font = `bold ${mainFontSize}px serif`;

    // Layer A: Deep Glow
    ctx.shadowColor = primaryColor;
    ctx.shadowBlur = W * 0.06;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillText(nameText, W / 2, baseY);

    // Layer B: Heavy 3D Stroke
    ctx.shadowBlur = 0;
    ctx.lineWidth = mainFontSize * 0.12;
    ctx.strokeStyle = 'rgba(0,0,0,0.9)';
    ctx.strokeText(nameText, W / 2, baseY);

    // Layer C: Premium Metallic Gradient
    const grad = ctx.createLinearGradient(0, baseY - mainFontSize/2, 0, baseY + mainFontSize/2);
    grad.addColorStop(0, '#FFD700'); // Gold
    grad.addColorStop(0.5, '#FFFFFF'); // White Shine
    grad.addColorStop(1, '#B8860B'); // Dark Gold
    
    ctx.fillStyle = (styleNo <= 100) ? grad : primaryColor;
    ctx.fillText(nameText, W / 2, baseY);

    // 3. --- DECORATIONS & QUOTES ---
    const lineY = baseY + mainFontSize * 0.5;
    ctx.beginPath();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.moveTo(W/2 - W*0.25, lineY);
    ctx.lineTo(W/2 + W*0.25, lineY);
    ctx.stroke();

    const quotes = ["ELEGANCE DEFINED", "WHISPERS OF SOUL", "NIGHT TO REMEMBER", "THE LEGEND RDX"];
    ctx.font = `italic ${mainFontSize * 0.25}px sans-serif`;
    ctx.fillStyle = 'white';
    ctx.fillText(quotes[styleNo % quotes.length], W / 2, lineY + 50);

    // Branding
    ctx.font = `bold ${W * 0.04}px Arial`;
    ctx.textAlign = 'right';
    ctx.fillStyle = primaryColor;
    ctx.fillText("*AHMAD CREATIONS*", W - 40, H - 40);

    // --- SAVE & SEND ---
    const outBuffer = canvas.toBuffer('image/png');
    fs.writeFileSync(cachePath, outBuffer);
    api.unsendMessage(processing.messageID);

    api.sendMessage({
      body: `✨ **RDX HEAVY DP (v105)**\n💎 Style: #${styleNo}\n👤 Name: ${nameText}`,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => fs.unlinkSync(cachePath), messageID);

  } catch (err) {
    console.error(err);
    api.unsendMessage(processing.messageID);
    api.sendMessage("❌ **Error:** Image fetch nahi ho saki. 400 Error ka matlab hai link expire ho gaya hai.", threadID, messageID);
  }
};
