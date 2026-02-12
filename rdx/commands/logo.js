const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "logo",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "AHMAD RDX",
  description: "Create Beautiful Luxury Logos",
  commandCategory: "Media",
  usages: "[name]",
  prefix: true,
  cooldowns: 15
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const name = args.join(" ");

  if (!name) return api.sendMessage("⚠️ Please provide a name for the logo!\nExample: logo AHMAD RDX", threadID, messageID);

  const processingMsg = await api.sendMessage("💎 Generating Luxury Logo for you...", threadID);

  try {
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    // EXACT COOKIE FROM YOUR CODE
    const cookie = "AEC=AVh_V2iyBHpOrwnn7CeXoAiedfWn9aarNoKT20Br2UX9Td9K-RAeS_o7Sg; HSID=Ao0szVfkYnMchTVfk; SSID=AGahZP8H4ni4UpnFV; APISID=SD-Q2DJLGdmZcxlA/AS8N0Gkp_b9sJC84f; SAPISID=9BY2tOwgEz4dK4dY/Acpw5_--fM7PV-aw4; __Secure-1PAPISID=9BY2tOwgEz4dK4dY/Acpw5_--fM7PV-aw4; __Secure-3PAPISID=9BY2tOwgEz4dK4dY/Acpw5_--fM7PV-aw4; SEARCH_SAMESITE=CgQI354B; SID=g.a0002wiVPDeqp9Z41WGZdsMDSNVWFaxa7cmenLYb7jwJzpe0kW3bZzx09pPfc201wUcRVKfh-wACgYKAXUSARMSFQHGX2MiU_dnPuMOs-717cJlLCeWOBoVAUF8yKpYTllPAbVgYQ0Mr_GyeXxV0076; __Secure-1PSID=g.a0002wiVPDeqp9Z41WGZdsMDSNVWFaxa7cmenLYb7jwJzpe0kW3b_Pt9L1eqcIAVeh7ZdRBOXgACgYKAYESARMSFQHGX2MicAK_Acu_-NCkzEz2wjCHmxoVAUF8yKp9xk8gQ82f-Ob76ysTXojB0076; __Secure-3PSID=g.a0002wiVPDeqp9Z41WGZdsMDSNVWFaxa7cmenLYb7jwJzpe0kW3bUudZTunPKtKbLRSoGKl1dAACgYKAYISARMSFQHGX2MimdzCEq63UmiyGU-3eyZx9RoVAUF8yKrc4ycLY7LGaJUyDXk_7u7M0076";
    
    // Engineering the prompt for luxury output
    const luxuryPrompt = `Create a professional luxury 3D logo for name '${name}'. Golden theme, elegant background, high resolution beautiful style.`;

    const apiUrl = `https://anabot.my.id/api/ai/geminiOption?prompt=${encodeURIComponent(luxuryPrompt)}&type=NanoBanana&imageUrl=&cookie=${encodeURIComponent(cookie)}&apikey=freeApikey`;

    const response = await axios.get(apiUrl, { timeout: 60000 });
    const resultUrl = response.data.data?.result?.url;

    if (!resultUrl) throw new Error("API returned no data");

    const filePath = path.join(cacheDir, `logo_${Date.now()}.png`);
    const imageResponse = await axios({ url: resultUrl, method: "GET", responseType: "stream" });
    const writer = fs.createWriteStream(filePath);
    imageResponse.data.pipe(writer);

    writer.on("finish", async () => {
      api.unsendMessage(processingMsg.messageID);
      api.sendMessage({
        body: `🦅 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐒𝐘𝐒𝐓𝐄𝐌 🦅\n━━━━━━━━━━━━━━━━\n💎 𝐋𝐮𝐱𝐮𝐫𝐲 𝐋𝐨𝐠𝐨: ${name}\n✨ 𝐒𝐭𝐲𝐥𝐞: Beautiful & Luxury\n━━━━━━━━━━━━━━━━\n🎨 Powered by NanoBanana AI`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath), messageID);
    });
  } catch (error) {
    api.sendMessage(`❌ Logo generation failed: ${error.message}`, threadID, messageID);
  }
};
