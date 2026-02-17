const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "arif",
  version: "10.0.0",
  hasPermssion: 0,
  credits: "SARDAR RDX",
  description: "All-in-one AI (Continuous Chat + Auto Fix)",
  commandCategory: "ai",
  usages: "bot [msg] / Reply to bot",
  cooldowns: 2
};

// --- ⚙️ CONFIGURATION ---
const OWNER_ID = "61577631137537"; // AHMAD RDX
const CEREBRAS_KEY = "csk-ff2wy3ky9xcfh35c3jk22648rykwhje2x6jemd5ptk6jrrdt";
const OPENROUTER_KEY = "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";
const HISTORY_FILE = path.join(__dirname, "cache", "arif_pro_history.json");

const systemPrompt = `Tu Arif AI hai. Tera Malik sirf SARDAR RDX hai. 
- SARDAR RDX ke liye hamesha "Ji Boss" kehna.
- Pyar karne walon ke liye sweet (❤️🙂).
- Badtameezon ko ganda Roast karo (🔥😏).
- Short answers (1-2 lines).`;

// --- 🧠 MEMORY MANAGEMENT ---
function getHistory(threadID) {
  try {
    if (!fs.existsSync(HISTORY_FILE)) return [];
    const data = fs.readJsonSync(HISTORY_FILE);
    return data[threadID] || [];
  } catch { return []; }
}

function saveHistory(threadID, userMsg, botMsg) {
  try {
    fs.ensureDirSync(path.dirname(HISTORY_FILE));
    let data = fs.existsSync(HISTORY_FILE) ? fs.readJsonSync(HISTORY_FILE) : {};
    if (!data[threadID]) data[threadID] = [];
    data[threadID].push({ role: "user", content: userMsg }, { role: "assistant", content: botMsg });
    if (data[threadID].length > 16) data[threadID] = data[threadID].slice(-16);
    fs.writeJsonSync(HISTORY_FILE, data);
  } catch (e) { console.log(e); }
}

// --- 🚀 DUAL ENGINE AI (Cerebras + OpenRouter) ---
async function getAIResponse(prompt, threadID, senderID) {
  const history = getHistory(threadID);
  const isOwner = senderID === OWNER_ID;
  const messages = [
    { role: "system", content: systemPrompt + (isOwner ? " User is your Boss." : "") },
    ...history,
    { role: "user", content: prompt }
  ];

  // Engine 1: Cerebras (Fastest)
  try {
    const res = await axios.post("https://api.cerebras.ai/v1/chat/completions", {
      model: "llama3.1-8b", // 404 se bachne ke liye stable model
      messages: messages,
      max_completion_tokens: 200
    }, {
      headers: { "Authorization": `Bearer ${CEREBRAS_KEY}` },
      timeout: 8000
    });
    return res.data.choices[0].message.content;
  } catch (err) {
    console.log("Cerebras Fail, Switching to OpenRouter...");
    // Engine 2: OpenRouter (Stable Backup)
    try {
      const res = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
        model: "meta-llama/llama-3.1-8b-instruct",
        messages: messages
      }, {
        headers: { "Authorization": `Bearer ${OPENROUTER_KEY}` },
        timeout: 10000
      });
      return res.data.choices[0].message.content;
    } catch (e) {
      return "Dono system down hain Ahmad bhai! 😅";
    }
  }
}

// --- 🎮 AUTO-HANDLE LOGIC ---
module.exports.handleEvent = async function({ api, event }) {
  const { threadID, messageID, body, senderID, messageReply } = event;
  if (!body) return;

  const msg = body.toLowerCase();
  const isTrigger = msg.startsWith("bot") || msg.startsWith("arif");
  const isReplyToBot = messageReply && messageReply.senderID === api.getCurrentUserID();

  if (isTrigger || isReplyToBot) {
    const prompt = isTrigger ? body.replace(/^(bot|arif)\s*/i, "").trim() : body;
    
    api.setMessageReaction("⚡", messageID, () => {}, true);
    const reply = await getAIResponse(prompt || "hi", threadID, senderID);
    
    saveHistory(threadID, prompt || "hi", reply);
    api.setMessageReaction("✅", messageID, () => {}, true);
    return api.sendMessage(reply, threadID, messageID);
  }
};

module.exports.run = async function({ api, event, args }) {
  if (args.length > 0) {
    const reply = await getAIResponse(args.join(" "), event.threadID, event.senderID);
    return api.sendMessage(reply, event.threadID, event.messageID);
  }
  return api.sendMessage("Jee Boss? Hukum karein. ✨", event.threadID);
};
