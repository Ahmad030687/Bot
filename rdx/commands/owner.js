const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: 'owner',
    aliases: ['dev', 'creator', 'developer'],
    description: 'Show bot owner information',
    credits: 'SARDAR RDX',
    usage: 'owner',
    category: 'Info',
    prefix: false
  },

  async run({ api, event, send, config }) {
    const { threadID, messageID } = event;

    const ownerPics = [
      'https://i.postimg.cc/C59TRYm7/Blur-DP-for-Instagram-Boy-Stylish.jpg',
      '',
      '',
      ''
    ];

    const randomPic = ownerPics[Math.floor(Math.random() * ownerPics.length)];

    const ownerInfo = `
╔═══════════════════════════╗
║   ✨ 𝐁𝐎𝐓 𝐎𝐖𝐍𝐄𝐑 𝐈𝐍𝐅𝐎 ✨   ║
╠═══════════════════════════╣
║                           ║
║  👤 𝐍𝐚𝐦𝐞: AHMAD RDX    ║
║                           ║
╠═══════════════════════════╣
║  📱 𝐂𝐨𝐧𝐭𝐚𝐜𝐭 𝐈𝐧𝐟𝐨:          ║
║                           ║
║  🌐 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤:              ║
║  AHMAD HOO YAR RDX ║
║                           ║
║  📲 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩:              ║
║  wa.me/923068796622       ║
║                           ║
╠═══════════════════════════╣
║  🤖 𝐁𝐨𝐭 𝐃𝐞𝐭𝐚𝐢𝐥𝐬:           ║
║                           ║
║  📛 Name: ${config.BOTNAME || 'SARDAR RDX'}
║  ⚡ Prefix: ${config.PREFIX || '.'}
║  💻 Version: 0.5       ║
║  🛠️ Framework: RDX-FCA    ║
║                           ║
╠═══════════════════════════╣
║  💝 𝙏𝙝𝙖𝙣𝙠 𝙮𝙤𝙪 𝙛𝙤𝙧 𝙪𝙨𝙞𝙣𝙜!  ║
╚═══════════════════════════╝
    `.trim();

    try {
      const cacheDir = path.join(__dirname, 'cache');
      fs.ensureDirSync(cacheDir);
      const imgPath = path.join(cacheDir, `owner_${Date.now()}.jpg`);

      const response = await axios.get(randomPic, { responseType: 'arraybuffer' });
      fs.writeFileSync(imgPath, Buffer.from(response.data));

      api.sendMessage(
        {
          body: ownerInfo,
          attachment: fs.createReadStream(imgPath)
        },
        threadID,
        () => {
          try { fs.unlinkSync(imgPath); } catch {}
        },
        messageID
      );
    } catch (error) {
      return send.reply(ownerInfo);
    }
  }
};
