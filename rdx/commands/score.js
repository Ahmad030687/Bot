const axios = require('axios');

module.exports.config = {
  name: "score",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "AHMAD RDX",
  description: "Live Cricket Score PAK vs IND",
  commandCategory: "Sports",
  usages: "",
  cooldowns: 10
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  const options = {
    method: 'GET',
    url: 'https://cricket-api-free-data.p.rapidapi.com/live-matches',
    headers: {
      'x-rapidapi-key': '6f52b7d6a4msh63cfa1e9ad2f0bbp1c46a5jsna5344b9fe618',
      'x-rapidapi-host': 'cricket-api-free-data.p.rapidapi.com'
    }
  };

  api.sendMessage("📡 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐒𝐘𝐒𝐓𝐄𝐌: Fetching Live Scores...", threadID, messageID);

  try {
    const response = await axios.request(options);
    const matches = response.data.data; // API ka main data

    if (!matches || matches.length === 0) {
      return api.sendMessage("❌ Ahmad bhai, filhal koi live match nahi chal raha.", threadID, messageID);
    }

    // PAK vs IND match dhoondne ka logic
    let liveMatch = matches.find(m => m.t1.includes("PAK") || m.t2.includes("IND") || m.t1.includes("Pakistan"));

    if (!liveMatch) {
        // Agar PAK vs IND nahi mila to pehla live match dikha do
        liveMatch = matches[0];
    }

    let msg = `🦅 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐒𝐏𝐎𝐑𝐓𝐒 🦅\n`;
    msg += `━━━━━━━━━━━━━━━━━━\n`;
    msg += `🏆 ${liveMatch.t1} vs ${liveMatch.t2}\n`;
    msg += `📊 Score: ${liveMatch.t1score || "Yet to bat"} vs ${liveMatch.t2score || "Yet to bat"}\n`;
    msg += `📢 Status: ${liveMatch.status || "Live"}\n`;
    msg += `━━━━━━━━━━━━━━━━━━\n`;
    msg += `🏆 𝐉𝐞𝐞𝐭𝐚𝐲 𝐆𝐚 𝐁𝐡𝐚𝐢 𝐉𝐞𝐞𝐭𝐚𝐲 𝐆𝐚 🇵🇰\n`;
    msg += `✅ 𝐀𝐏𝐈 𝐛𝐲 𝐀𝐡𝐦𝐚𝐝 𝐑𝐃𝐗`;

    return api.sendMessage(msg, threadID, messageID);

  } catch (error) {
    console.error(error);
    return api.sendMessage("⚠️ RapidAPI Limit Exceeded ya Error! Ahmad bhai apni key check karein.", threadID, messageID);
  }
};
