const axios = require("axios");

module.exports.config = {
  name: "ask",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "AHMAD RDX",
  description: "Chat with RDX AI (ChatGPT)",
  commandCategory: "ai",
  usages: "[aapka sawal]",
  cooldowns: 2
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const prompt = args.join(" ");
  
  const rdx_header = "🦅 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐀𝐈 🦅";
  const line = "━━━━━━━━━━━━━━━━━━";

  if (!prompt) {
    return api.sendMessage(`${rdx_header}\n${line}\n⚠️ 𝐀𝐡𝐦𝐚𝐝 𝐛𝐡𝐚𝐢, 𝐬𝐚𝐰𝐚𝐥 𝐭𝐨 𝐩𝐨𝐨𝐜𝐡𝐞𝐢𝐧!\nExample: #ask Who is the King of Cricket?\n${line}`, threadID, messageID);
  }

  // 1. INITIAL STATUS (Thinking...)
  let statusMsg = await api.sendMessage(`🤔 𝐀𝐡𝐦𝐚𝐝 𝐛𝐡𝐚𝐢, 𝐬𝐨𝐜𝐡 𝐫𝐚𝐡𝐚 𝐡𝐨𝐨𝐧...`, threadID);

  try {
    // 🚀 CALLING THE API (Logic as provided by you)
    const apikey = "freeApikey"; // Aapki di gayi free API key
    const res = await axios.get(`https://anabot.my.id/api/ai/chatgpt?prompt=${encodeURIComponent(prompt)}&apikey=${apikey}`);

    // Check if the response is valid
    if (!res.data || !res.data.result) {
      throw new Error("AI ne jawab nahi diya, Shayad API down hai.");
    }

    const answer = res.data.result;

    // 2. SENDING FINAL RESPONSE
    const finalMsg = `${rdx_header}\n${line}\n📝 𝐐𝐮𝐞𝐬𝐭𝐢𝐨𝐧: ${prompt}\n${line}\n🤖 𝐀𝐧𝐬𝐰𝐞𝐫:\n${answer}\n${line}\n🔥 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗`;

    await api.editMessage(finalMsg, statusMsg.messageID, threadID);

  } catch (error) {
    console.error("RDX AI ERROR:", error);
    if (statusMsg) {
      api.editMessage(`❌ ${rdx_header}\n${line}\n𝐄𝐫𝐫𝐨𝐫: AI System is busy right now.\n${line}`, statusMsg.messageID, threadID);
    }
  }
};
