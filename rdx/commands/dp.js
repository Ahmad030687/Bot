const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "dp",
  version: "50.0.0",
  credits: "AHMAD RDX",
  description: "200+ Super Heavy Premium Name DP Maker",
  commandCategory: "Edit",
  usages: "[StyleNo] [Name] - Reply to photo",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, messageReply } = event;

  if (!messageReply || !messageReply.attachments[0] || messageReply.attachments[0].type !== "photo") {
    return api.sendMessage("⚠️ **AHMAD RDX:** Photo par reply karein!\nFormat: #dp [1-200] [Name]", threadID, messageID);
  }

  const styleNo = parseInt(args[0]) || 1;
  const name = args.slice(1).join(" ").toUpperCase() || "AHMAD";
  const imgUrl = messageReply.attachments[0].url;
  const cachePath = path.join(__dirname, "cache", `rdx_heavy_${Date.now()}.png`);

  if (!fs.existsSync(path.join(__dirname, "cache"))) fs.mkdirSync(path.join(__dirname, "cache"));

  const processing = await api.sendMessage(`🎨 **AHMAD CREATIONS:** Creating Style #${styleNo}... (Super Heavy Engine)`, threadID);

  try {
    const baseImg = await loadImage(imgUrl);
    const canvas = createCanvas(baseImg.width, baseImg.height);
    const ctx = canvas.getContext('2d');

    const W = canvas.width;
    const H = canvas.height;

    // 1. Draw Original Image
    ctx.drawImage(baseImg, 0, 0, W, H);

    // 2. Dark Overlay (Taake text heavy lage)
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(0, 0, W, H);

    // 3. --- 🎭 200+ STYLES LOGIC ENGINE ---
    // Dynamic Hue & Saturation based on style number
    const hue = (styleNo * 137.5) % 360; 
    const primary = `hsl(${hue}, 100%, 60%)`;
    const secondary = `hsl(${(hue + 40) % 360}, 100%, 70%)`;

    // 4. --- DESIGNING ELEMENTS ---
    ctx.textAlign = 'center';

    // Style Layout Categories
    if (styleNo <= 70) { 
        // 💎 CATEGORY: LUXURY GOLD & GLOW (Huma Style)
        ctx.font = 'bold 140px serif';
        
        // Heavy Shadow/Glow
        ctx.shadowColor = primary;
        ctx.shadowBlur = 40;
        
        // Metallic Gradient
        const grad = ctx.createLinearGradient(0, H - 500, 0, H - 300);
        grad.addColorStop(0, '#FFD700');
        grad.addColorStop(0.5, 'white');
        grad.addColorStop(1, '#B8860B');
        
        ctx.fillStyle = grad;
        ctx.fillText(name, W / 2, H - 400);
        
        // Curved Line under name
        ctx.beginPath();
        ctx.moveTo(W / 2 - 200, H - 350);
        ctx.quadraticCurveTo(W / 2, H - 300, W / 2 + 200, H - 350);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 5;
        ctx.stroke();

    } else if (styleNo > 70 && styleNo <= 140) {
        // 🚀 CATEGORY: NEON & CYBER (Ezzah Style)
        ctx.font = 'italic bold 150px sans-serif';
        ctx.shadowColor = primary;
        ctx.shadowBlur = 50;
        ctx.strokeStyle = "white";
        ctx.lineWidth = 8;
        ctx.strokeText(name, W / 2, H - 400);
        ctx.fillStyle = primary;
        ctx.fillText(name, W / 2, H - 400);

    } else {
        // 🔥 CATEGORY: 3D RECTANGLE & GLASS
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        ctx.roundRect(W/2 - 350, H - 500, 700, 200, 20);
        ctx.fill();
        ctx.strokeStyle = primary;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.font = 'bold 120px Arial';
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'black';
        ctx.fillStyle = "white";
        ctx.fillText(name, W / 2, H - 380);
    }

    // 5. --- ✍️ AESTHETIC QUOTES & BRANDING ---
    ctx.shadowBlur = 0; // Shadow reset
    const quotes = [
      "Love is not just a word | Forever",
      "A night to remember under the stars",
      "Whispers of the night, gaze of the moon",
      "Elegance is the only beauty that never fades",
      "Defined by style, driven by passion",
      "The legend begins where the story ends"
    ];
    
    ctx.font = '40px sans-serif';
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillText(quotes[styleNo % quotes.length], W / 2, H - 250);

    // Signature Line
    ctx.font = 'bold 35px Arial';
    ctx.textAlign = 'right';
    ctx.fillStyle = primary;
    ctx.fillText("*AHMAD CREATIONS*", W - 50, H - 50);

    // 6. Save and Finish
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(cachePath, buffer);
    api.unsendMessage(processing.messageID);

    api.sendMessage({
      body: `✨ **Heavy DP Success!**\n💎 Style: #${styleNo}\n👤 Name: ${name}\n🦅 Designed by Ahmad RDX`,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => fs.unlinkSync(cachePath), messageID);

  } catch (error) {
    console.error(error);
    api.unsendMessage(processing.messageID);
    api.sendMessage("❌ **Error:** Canvas setup incomplete or image size too large.", threadID, messageID);
  }
};
