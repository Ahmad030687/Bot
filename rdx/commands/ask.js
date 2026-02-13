const axios = require("axios");

module.exports.config = {
  name: "ask",
  version: "6.0.0",
  hasPermssion: 0,
  credits: "AHMAD RDX",
  description: "Short Urdu answers with 2026 data context",
  commandCategory: "ai",
  usages: "[sawal]",
  cooldowns: 2
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const prompt = args.join(" ");
  
  const rdx_header = "🦅 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐀𝐈 🦅";
  const line = "━━━━━━━━━━━━━━━━━━";

  if (!prompt) {
    return api.sendMessage(`${rdx_header}\n${line}\n⚠️ 𝐀𝐡𝐦𝐚𝐝 𝐛𝐡𝐚𝐢, 𝐬𝐚𝐰𝐚𝐥 𝐭𝐨 𝐩𝐨𝐨𝐜𝐡𝐞𝐢𝐧!\n${line}`, threadID, messageID);
  }

  try {
    // ✨ SYSTEM INSTRUCTIONS: Force Urdu, Short response, and 2026 Context
    const systemInstruction = "Answer in pure Urdu. Keep it very short (max 2-3 lines). Always provide latest data of the year 2025-2026. Question: ";
    
    const res = await axios.get(`https://anabot.my.id/api/ai/chatgpt?prompt=${encodeURIComponent(systemInstruction + prompt)}&apikey=freeApikey`);

    if (res.data && res.data.success && res.data.data.result.chat) {
      const answer = res.data.data.result.chat;

      // Final Short & Clean Response
      const finalMsg = `${rdx_header}\n${line}\n${answer}\n${line}\n🔥 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗`;

      api.sendMessage(finalMsg, threadID, messageID);
    } else {
      throw new Error("API Error");
    }

  } catch (error) {
    api.sendMessage(`❌ ${rdx_header}\n${line}\n𝐄𝐫𝐫𝐨𝐫: AI System is busy. Try again.`, threadID, messageID);
  }
};
