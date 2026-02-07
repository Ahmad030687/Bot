const axios = require("axios");

module.exports.config = {
  name: "google",
  version: "7.0.0",
  hasPermssion: 0,
  credits: "AHMAD RDX",
  description: "Direct Answer (No Links)",
  commandCategory: "Education",
  usages: "[sawal]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const query = args.join(" ");

  if (!query) return api.sendMessage("❓ Ustad ji, sawal toh pouchein!", threadID, messageID);

  // User ko batao ke dhoond raha hoon (Optional, aap chahein toh hata dein)
  // api.sendMessage(`🔍 Checking...`, threadID, messageID); 

  try {
    // 🔗 Aapka Apna RDX Backend
    const res = await axios.get(`https://yt-api-7mfm.onrender.com/api/search?q=${encodeURIComponent(query)}`);

    if (res.data.status && res.data.results.length > 0) {
      
      // 🧠 LOGIC: Pehle result ka 'Snippet' hi asli jawab hota hai
      const bestResult = res.data.results[0]; 
      
      // Kabhi kabhi pehla result adura hota hai, toh hum dusra bhi check karte hain
      let answer = bestResult.snippet;

      // Agar jawab boht chota hai, toh second result bhi add kar do taake baat puri ho
      if (answer.length < 50 && res.data.results[1]) {
        answer += "\n\n" + res.data.results[1].snippet;
      }

      // 🦅 Jawab Bhejna (Sirf Text)
      return api.sendMessage(`🦅 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐀𝐈**\n━━━━━━━━━━━━━━━\n${answer}\n━━━━━━━━━━━━━━━`, threadID, messageID);

    } else {
      return api.sendMessage("❌ Iska jawab nahi mila.", threadID, messageID);
    }
  } catch (e) {
    return api.sendMessage(`❌ Error: ${e.message}`, threadID, messageID);
  }
};
