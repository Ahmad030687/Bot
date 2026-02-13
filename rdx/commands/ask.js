const axios = require("axios");

module.exports.config = {
  name: "ask",
  version: "5.0.0",
  hasPermssion: 0,
  credits: "AHMAD RDX",
  description: "Chat with RDX AI using verified anabot API",
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

  // 1. Thinking Status
  let statusMsg = await api.sendMessage(`🤔 𝐀𝐡𝐦𝐚𝐝 𝐛𝐡𝐚𝐢, 𝐬𝐨𝐜𝐡 𝐫𝐚𝐡𝐚 𝐡𝐨𝐨𝐧...`, threadID);

  try {
    // 🚀 YOUR VERIFIED API LOGIC
    const apikey = "freeApikey"; 
    const apiUrl = `https://anabot.my.id/api/ai/chatgpt?prompt=${encodeURIComponent(prompt)}&apikey=${apikey}`;
    
    const res = await axios.get(apiUrl);

    // 🔍 Mapping the nested JSON: data -> data -> result -> chat
    if (res.data && res.data.success && res.data.data.result.chat) {
      const answer = res.data.data.result.chat;

      // 2. SUCCESS RESPONSE
      const finalMsg = `${rdx_header}\n${line}\n📝 𝐐𝐮𝐞𝐬𝐭𝐢𝐨𝐧: ${prompt}\n${line}\n🤖 𝐀𝐧𝐬𝐰𝐞𝐫:\n${answer}\n${line}\n🔥 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗`;

      await api.editMessage(finalMsg, statusMsg.messageID, threadID);
    } else {
      throw new Error("Invalid response format from API.");
    }

  } catch (error) {
    console.error("RDX AI ERROR:", error);
    api.editMessage(`❌ ${rdx_header}\n${line}\n𝐄𝐫𝐫𝐨𝐫: API response error or key expired.\n${line}`, statusMsg.messageID, threadID);
  }
};
