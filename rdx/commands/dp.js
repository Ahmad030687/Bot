const { createCanvas, loadImage } = require('canvas');
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

// --- NOTE: Agar Custom Font use karna ho to yahan register karein ---
// const { registerFont } = require('canvas');
// registerFont(path.join(__dirname, 'fonts', 'Signature.ttf'), { family: 'SignatureFont' });
// Phir niche ctx.font mein 'SignatureFont' use karein.

module.exports.config = {
  name: "dp",
  version: "101.FIXED",
  credits: "AHMAD RDX",
  description: "Super Heavy DP - Correct Position & Size (200+ Styles)",
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
  // Name ko thora short rakhein taake heavy style mein acha lage
  const nameText = args.slice(1).join(" ").toUpperCase().substring(0, 15) || "AHMAD";
  const imgUrl = messageReply.attachments[0].url;
  const cachePath = path.join(__dirname, "cache", `rdx_pos_fixed_${Date.now()}.png`);

  if (!fs.existsSync(path.join(__dirname, "cache"))) fs.mkdirSync(path.join(__dirname, "cache"));

  const processing = await api.sendMessage(`🎨 **AHMAD CREATIONS:** Applying Heavy Style #${styleNo} at Bottom Center...`, threadID);

  try {
    const baseImg = await loadImage(imgUrl);
    const canvas = createCanvas(baseImg.width, baseImg.height);
    const ctx = canvas.getContext('2d');

    // Width aur Height variables for cleaner calculations
    const W = canvas.width;
    const H = canvas.height;

    // 1. Draw Original Image
    ctx.drawImage(baseImg, 0, 0, W, H);

    // --- 📐 POSITION & SIZE CALCULATIONS (THE FIX) ---
    // Font size image ki width ka 18% hoga (Specific heavy size)
    const mainFontSize = Math.floor(W * 0.18);
    // Base Y position image ki height ka 82% neechay (Down Center)
    const baseY = H * 0.82;

    // 2. --- BOTTOM DARK GRADIENT (For better text visibility) ---
    // Sirf neechay walay hissay ko thora dark karenge taake text uth kar aaye
    const bottomGrad = ctx.createLinearGradient(0, H * 0.6, 0, H);
    bottomGrad.addColorStop(0, 'rgba(0,0,0,0)');
    bottomGrad.addColorStop(1, 'rgba(0,0,0,0.7)');
    ctx.fillStyle = bottomGrad;
    ctx.fillRect(0, H * 0.6, W, H * 0.4);


    // 3. --- STYLE ENGINE SETUP ---
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Dynamic Color based on style number
    const hue = (styleNo * 137.5) % 360;
    const mainColorHSL = `hsl(${hue}, 100%, 65%)`;

    // --- LAYER 1: THE HEAVY GLOW (Peechay ki chamak) ---
    // Use a bold serif font standard, or your custom font if registered
    ctx.font = `bold ${mainFontSize}px serif`; 
    ctx.shadowColor = mainColorHSL;
    ctx.shadowBlur = W * 0.05; // Blur relative to width
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillText(nameText, W / 2, baseY);


    // --- LAYER 2: THE THICK OUTLINE (3D Look) ---
    // Shadow off for sharp stroke
    ctx.shadowBlur = 0;
    ctx.lineWidth = mainFontSize * 0.08; // Stroke relative to font size
    ctx.strokeStyle = 'rgba(0,0,0,0.85)'; # Dark heavy border
    ctx.strokeText(nameText, W / 2, baseY);


    // --- LAYER 3: THE MAIN FILL GRADIENT (Gold/Silver/Neon) ---
    let fillStyle;
    if (styleNo <= 80) { 
        // PREMIUM GOLD/CLASSIC GRADIENT
        const grad = ctx.createLinearGradient(0, baseY - mainFontSize/2, 0, baseY + mainFontSize/2);
        grad.addColorStop(0, '#FFD700'); // Gold
        grad.addColorStop(0.5, '#FFFACD'); // Light Gold
        grad.addColorStop(1, '#B8860B'); // Dark Gold
        fillStyle = grad;
    } else {
        // NEON/METALLIC VIBRANT GRADIENT
        const grad = ctx.createLinearGradient(0, baseY - mainFontSize/2, 0, baseY + mainFontSize/2);
        grad.addColorStop(0, 'white');
        grad.addColorStop(0.5, mainColorHSL);
        grad.addColorStop(1, `hsl(${hue}, 100%, 40%)`);
        fillStyle = grad;
    }
    ctx.fillStyle = fillStyle;
    ctx.fillText(nameText, W / 2, baseY);

    // 4. --- DECORATIONS (Divider & Quote below name) ---
    const subFontSize = mainFontSize * 0.3;
    const dividerY = baseY + mainFontSize * 0.4;
    const quoteY = dividerY + subFontSize * 1.2;

    // Stylish Divider Line
    ctx.beginPath();
    ctx.strokeStyle = fillStyle; // Match name color
    ctx.lineWidth = W * 0.008;
    ctx.moveTo(W / 2 - W * 0.2, dividerY);
    ctx.quadraticCurveTo(W / 2, dividerY - W*0.02, W / 2 + W * 0.2, dividerY);
    ctx.stroke();

    // Quotes
    const quotes = ["Elegance in Every Pixel", "A Night to Remember", "Whispers of the Soul", "Defined by Style"];
    ctx.font = `italic ${subFontSize}px sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 5;
    ctx.fillText(quotes[styleNo % quotes.length], W / 2, quoteY);

    // 5. --- BRANDING (Bottom Right) ---
    ctx.font = `bold ${W * 0.04}px Arial`;
    ctx.textAlign = 'right';
    ctx.fillStyle = mainColorHSL;
    ctx.fillText("*AHMAD CREATIONS*", W - (W*0.03), H - (W*0.03));

    // --- SAVE & SEND ---
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(cachePath, buffer);
    api.unsendMessage(processing.messageID);

    api.sendMessage({
      body: `🦅 **RDX HEAVY DP (Fixed Position)**\n💎 Style: #${styleNo}\n👤 Name: ${nameText}`,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => fs.unlinkSync(cachePath), messageID);

  } catch (e) {
    console.error(e);
    api.unsendMessage(processing.messageID);
    api.sendMessage("❌ Error: Rendering failed!", threadID);
  }
};
