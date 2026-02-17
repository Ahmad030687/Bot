const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "arif",
  version: "6.0.0",
  hasPermssion: 0,
  credits: "SARDAR RDX",
  description: "Continuous AI Chat (Reply System)",
  commandCategory: "ai",
  usages: "bot [msg] OR Reply to bot msg",
  cooldowns: 2
};

// --- ⚙️ CONFIGURATION ---
const OWNER_ID = "61577631137537"; // SARDAR RDX UID
const OPENROUTER_API_KEY = "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";
const HISTORY_FILE = path.join(__dirname, "cache", "arif_chat_history.json");

// --- 🧠 PERSONALITY (Savage + Sweet) ---
const systemPrompt = `
Tumhara naam "Arif" hai.
Tumhara Maalik/Creator sirf "SARDAR RDX" hai.
Tumhari 2 sides hain:
1. **Sweet Mode:** Agar user tameez se baat kare, to bohat sweet aur friendly bano (Use emojis: 🙂❤️✨).
2. **Savage Mode:** Agar user attitude dikhaye, gali de, ya hawabazi kare, to uski gandi bezzati (Roast) karo.
3. **Owner Mode:** SARDAR RDX ke samne hamesha "Ji Boss" aur obedient raho.
Language: Hinglish (Urdu/Hindi mix).
Reply Length: Short (1-2 lines).
`;

// --- 💾 HISTORY MANAGEMENT ---
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
    
    // Naya message add karein
    data[threadID].push({ role: "user", content: userMsg });
    data[threadID].push({ role: "assistant", content: botMsg });
    
    // Sirf aakhri 20 messages (10 baatein) yaad rakhein
    if (data[threadID].length > 20) data[threadID] = data[threadID].slice(-20);
    
    fs.writeJsonSync(HISTORY_FILE, data);
  } catch (e) { console.log("History Error:", e); }
}

// --- 🚀 MAIN AI FUNCTION ---
async function getAIResponse(prompt, threadID, senderID) {
  const history = getHistory(threadID);
  
  // Owner Detection Context
  let userContext = "User is a stranger.";
  if (senderID === OWNER_ID) userContext = "USER IS YOUR GOD & OWNER 'SARDAR RDX'. Be super respectful.";

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "system", content: `[Context: ${userContext}]` },
    ...history,
    { role: "user", content: prompt }
  ];

  try {
    const res = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
      model: "meta-llama/llama-3.1-8b-instruct",
      messages: messages,
      temperature: 0.85, // Thoda creative
      max_tokens: 150
    }, {
      headers: { 
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    return res.data.choices[0].message.content;
  } catch (error) {
    console.error("OpenRouter Error:", error.message);
    return "Yaar net slow hai, dubara bolo! 😅";
  }
}

// --- 🎮 COMMAND HANDLER (Prefix ya No-Prefix) ---
module.exports.handleEvent = async function({ api, event }) {
  const { threadID, messageID, body, senderID, messageReply } = event;

  if (!body) return;
  const text = body.toLowerCase();

  // --- TRIGGER LOGIC ---
  // 1. Agar message "bot" ya "arif" se shuru ho
  const isTrigger = text.startsWith("bot") || text.startsWith("arif");
  
  // 2. Agar koi BOT ke message par REPLY kare (Ye hai wo feature jo apko chahiye)
  const isReplyToBot = messageReply && messageReply.senderID === api.getCurrentUserID();

  // Agar na trigger hai na reply, to ignore karo
  if (!isTrigger && !isReplyToBot) return;

  // --- MESSAGE CLEANING ---
  let prompt = body;
  if (isTrigger) {
    // Agar "bot kaise ho" likha hai to "bot" hata do
    prompt = body.replace(/^(bot|arif)\s*/i, "").trim();
  }
  
  // Agar sirf "bot" likha ho (Empty message)
  if (!prompt) {
    if (senderID === OWNER_ID) return api.sendMessage("Jee Boss SARDAR RDX? ❤️ Main hazir hoon!", threadID, messageID);
    return api.sendMessage("Jee? Arif sun raha hai... 🙂", threadID, messageID);
  }

  // --- SENDING TO AI ---
  api.setMessageReaction("👀", messageID, () => {}, true); // Seen reaction
  
  // Typing indicator on
  api.sendTypingIndicator(threadID);

  const reply = await getAIResponse(prompt, threadID, senderID);

  // History save aur Message send
  saveHistory(threadID, prompt, reply);
  
  api.setMessageReaction("✅", messageID, () => {}, true); // Done reaction
  return api.sendMessage(reply, threadID, messageID);
};

// Command run function (Leave empty handled by handleEvent)
module.exports.run = async function({ api, event }) {};
