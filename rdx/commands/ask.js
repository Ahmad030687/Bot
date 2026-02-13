const axios = require("axios");

module.exports.config = {
  name: "ask",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "AHMAD RDX",
  description: "Chat with RDX Premium AI (Powered by Koja)",
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
    return api.sendMessage(`${rdx_header}\n${line}\n⚠️ 𝐀𝐡𝐦𝐚𝐝 𝐛𝐡𝐚𝐢, 𝐬𝐚𝐰𝐚𝐥 𝐭𝐨 𝐩𝐨𝐨𝐜𝐡𝐞𝐢𝐧!\nExample: #ask Pakistan ka Prime Minister kaun hai?\n${line}`, threadID, messageID);
  }

  // 1. INITIAL STATUS (Thinking Animation)
  let statusMsg = await api.sendMessage(`🤔 𝐀𝐡𝐦𝐚𝐝 𝐛𝐡𝐚𝐢, 𝐬𝐨𝐜𝐡 𝐫𝐚𝐡𝐚 𝐡𝐨𝐨𝐧...`, threadID);

  try {
    // 🚀 CALLING YOUR NEW KOJA-PROJECT API
    const apikey = "Koja"; 
    const apiUrl = `https://kojaxd-api.vercel.app/ai/chatgpt?apikey=${apikey}&prompt=${encodeURIComponent(prompt)}`;
    
    const res = await axios.get(apiUrl);

    if (!res.data || !res.data.status) {
      throw new Error("API ne response nahi diya.");
    }

    const answer = res.data.result;

    // 2. SENDING FINAL PREMIUM RESPONSE
    const finalMsg = `${rdx_header}\n${line}\n📝 𝐐𝐮𝐞𝐬𝐭𝐢𝐨𝐧: ${prompt}\n${line}\n🤖 𝐀𝐧𝐬𝐰𝐞𝐫:\n${answer}\n${line}\n🔥 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗`;

    await api.editMessage(finalMsg, statusMsg.messageID, threadID);

  } catch (error) {
    console.error("RDX AI ERROR:", error);
    if (statusMsg) {
      api.editMessage(`❌ ${rdx_header}\n${line}\n𝐄𝐫𝐫𝐨𝐫: AI System is busy. Please check back in a moment.\n${line}`, statusMsg.messageID, threadID);
    }
  }
};
