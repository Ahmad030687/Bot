const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "ultra",
  version: "30.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "30-in-1 Ultimate AI & Tools Suite",
  commandCategory: "God Mode",
  usages: "ultra [option] [input]",
  cooldowns: 3
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, messageReply } = event;
  const cmd = args[0] ? args[0].toLowerCase() : "";
  const input = args.slice(1).join(" ");

  // 🛡️ MENU DISPLAY
  if (!cmd || cmd === "help") {
    const menu = `
🔥 **AHMAD ALI ULTRA SUITE** 🔥
━━━━━━━━━━━━━━━━━━
🧠 **AI COMMANDS:**
• #ultra gpt [text]
• #ultra gemini [text]
• #ultra roast [name]
• #ultra islam [text]

🎨 **DESIGN COMMANDS:**
• #ultra imagine [text]
• #ultra rembg (Reply Photo)
• #ultra upscale (Reply Photo)
• #ultra logo [name]

🔊 **MEDIA COMMANDS:**
• #ultra tts [text]
• #ultra tiktok [url]
• #ultra lyrics [song]

🛠️ **TOOLS:**
• #ultra tempmail
• #ultra ip [address]
• #ultra whois [site]
━━━━━━━━━━━━━━━━━━
👑 **Use:** #ultra [command] [text]`;
    return api.sendMessage(menu, threadID, messageID);
  }

  // Aura Reaction
  api.setMessageReaction("⚡", messageID, () => {}, true);

  try {
    switch (cmd) {
      // 🧠 AI
      case "gpt": {
        if (!input) return api.sendMessage("📝 Kuch pooch to lein!", threadID);
        const res = await axios.get(`https://api.kenliejugarap.com/gptgo/?text=${encodeURIComponent(input)}`);
        return api.sendMessage(`🧠 **GPT-4:** ${res.data.response}`, threadID, messageID);
      }
      
      case "gemini": {
        if (!input) return api.sendMessage("📝 Sawal likhein!", threadID);
        const res = await axios.get(`https://api.kenliejugarap.com/gemini-pro/?text=${encodeURIComponent(input)}`);
        return api.sendMessage(`♊ **Gemini:** ${res.data.response}`, threadID, messageID);
      }

      case "roast": {
        if (!input) return api.sendMessage("📝 Kiski be-izzati karni hai?", threadID);
        // Safe & Funny Roast Logic
        const roasts = [
            `Oye ${input}, tumhari shakal dekh kar onion bhi rone lagta hai. 🧅`,
            `${input}, tum itne smart ho ke kabhi kabhi saans lena bhi bhool jate hoge? 🤔`,
            `Agar ${input} ka dimagh dynamite hota, to wo apni naak bhi nahi ura sakta tha. 💥`,
            `${input}, mirror dekhte ho ya dar ke bhaag jate ho? 🪞`
        ];
        const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
        return api.sendMessage(`💀 **Roast:** ${randomRoast}`, threadID);
      }
      
      case "islam": {
        if (!input) return api.sendMessage("📝 Sawal likhein!", threadID);
        const res = await axios.get(`https://api.kenliejugarap.com/gptgo/?text=Islamic answer for: ${encodeURIComponent(input)}`);
        return api.sendMessage(`☪️ **Islamic AI:** ${res.data.response}`, threadID);
      }

      // 🎨 DESIGN
      case "imagine": {
        if (!input) return api.sendMessage("📝 Prompt likhein!", threadID);
        api.sendMessage("🎨 Painting...", threadID);
        const url = `https://pollinations.ai/p/${encodeURIComponent(input)}`;
        sendImage(url, `🎨 Art: ${input}`);
        break;
      }
      
      case "rembg": {
        if(!messageReply?.attachments?.[0]) return api.sendMessage("❌ Photo reply karein!", threadID);
        api.sendMessage("✂️ Removing BG...", threadID);
        const url = `https://api.kenliejugarap.com/removebg/?image=${encodeURIComponent(messageReply.attachments[0].url)}`;
        sendImage(url, "✅ PNG Ready");
        break;
      }

      case "upscale": {
        if(!messageReply?.attachments?.[0]) return api.sendMessage("❌ Photo reply karein!", threadID);
        api.sendMessage("🔍 Enhancing...", threadID);
        const url = `https://api.kenliejugarap.com/upscale/?url=${encodeURIComponent(messageReply.attachments[0].url)}`;
        sendImage(url, "✅ 4K Result");
        break;
      }

      case "logo": {
        if (!input) return api.sendMessage("📝 Naam likhein!", threadID);
        const url = `https://pollinations.ai/p/${encodeURIComponent(input + " mascot logo vector 4k")}`;
        sendImage(url, `💎 Logo: ${input}`);
        break;
      }

      // 🔊 MEDIA
      case "tts": {
        if (!input) return api.sendMessage("📝 Text likhein!", threadID);
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(input)}&tl=ur&client=tw-ob`;
        const p = path.join(__dirname, "cache", `tts_${Date.now()}.mp3`);
        const s = (await axios.get(url, {responseType:'stream'})).data;
        s.pipe(fs.createWriteStream(p)).on('close',()=> api.sendMessage({attachment: fs.createReadStream(p)}, threadID, ()=>fs.unlinkSync(p)));
        break;
      }

      case "tiktok": {
         if (!input) return api.sendMessage("📝 Link dein!", threadID);
         api.sendMessage("📥 Downloading...", threadID);
         try {
             const res = await axios.get(`https://api.kenliejugarap.com/tikwm/?url=${encodeURIComponent(input)}`);
             const vidUrl = res.data.data.play;
             const p = path.join(__dirname, "cache", `tk_${Date.now()}.mp4`);
             const s = (await axios({ url: vidUrl, responseType: "stream" })).data;
             s.pipe(fs.createWriteStream(p)).on('close', () => {
                 api.sendMessage({ body: `🎬 **TikTok:** ${res.data.data.author.nickname}`, attachment: fs.createReadStream(p) }, threadID, () => fs.unlinkSync(p));
             });
         } catch(e) { api.sendMessage("❌ Download Failed.", threadID); }
         break;
      }

      // 🛠️ TOOLS
      case "tempmail": {
        const res = await axios.get("https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1");
        return api.sendMessage(`📧 **Email:** ${res.data[0]}\nCheck Inbox: #ultra inbox ${res.data[0]}`, threadID);
      }
      
      case "inbox": {
        if (!input) return api.sendMessage("📝 Email likhein!", threadID);
        const [u, d] = input.split("@");
        const res = await axios.get(`https://www.1secmail.com/api/v1/?action=getMessages&login=${u}&domain=${d}`);
        if(res.data.length==0) return api.sendMessage("📭 Inbox Khali Hai.", threadID);
        const msg = await axios.get(`https://www.1secmail.com/api/v1/?action=readMessage&login=${u}&domain=${d}&id=${res.data[0].id}`);
        return api.sendMessage(`📩 **Subject:** ${msg.data.subject}\n\n${msg.data.textBody}`, threadID);
      }

      case "ip": {
        if (!input) return api.sendMessage("📝 IP dein!", threadID);
        const res = await axios.get(`http://ip-api.com/json/${input}`);
        return api.sendMessage(`🌍 **IP Info:**\nCountry: ${res.data.country}\nCity: ${res.data.city}\nISP: ${res.data.isp}`, threadID);
      }

      default:
        api.sendMessage("❌ Unknown Option. Type: #ultra help", threadID);
    }
  } catch (e) {
    api.sendMessage(`❌ Error: ${e.message}`, threadID);
  }

  // Image Helper
  async function sendImage(url, caption) {
     const p = path.join(__dirname, "cache", `img_${Date.now()}.jpg`);
     try {
         const s = (await axios.get(url, {responseType:'stream'})).data;
         s.pipe(fs.createWriteStream(p)).on('close',()=> api.sendMessage({body:caption, attachment: fs.createReadStream(p)}, threadID, ()=>fs.unlinkSync(p)));
     } catch (e) { api.sendMessage("❌ Image Load Error", threadID); }
  }
};
