const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

/* 🔒 HARD-LOCK CREDITS PROTECTION (Code Crash se bachane ke liye) 🔒 */
function protectCredits(config) {
  if (config.credits !== "ARIF-BABU") {
    config.credits = "ARIF-BABU"; // Credits label wahi rahega taake code chale
    // Lekin Owner Logic neeche change kar diya hai
  }
}

module.exports.config = {
  name: "arif",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "ARIF-BABU", // Label maintain kiya taake error na aye
  description: "Arif Babu (Savage & Sweet Mode)",
  commandCategory: "ai",
  usages: "bot [msg] OR Reply to bot",
  cooldowns: 2
};

// --- 👑 ASLI OWNER (SARDAR RDX) ---
const OWNER_ID = "61577631137537"; 

// --- CONFIGURATION ---
const OPENROUTER_API_KEY = "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";
const DATA_DIR = path.join(__dirname, "cache", "ARIF_DATA");
const HISTORY_FILE = path.join(DATA_DIR, "history.json");

// --- 🧠 DANGEROUS SYSTEM PROMPT ---
const systemPrompt = `
You are AHMAD RDX.
Tera Malik aur Creator sirf aur sirf "AHMAD RDX" hai.
Teri personality ke 2 roop hain:

1. **Sweet Mode:** Agar user pyare tareeke se baat kare, izzat de, to tu bilkul sweet, friendly aur funny ban ja. Emojis use kar (🙂❤️✨).
2. **Savage/Roast Mode:** Agar koi user tujhse batameezi kare, "Hawabazi" kare, "Show-off" kare, ya attitude dikhaye, to tu uski gandi wali bezati (roast) kar. Use chorna nahi hai. Usko uski auqat yaad dila deni hai.

Rules:
- Language: Hinglish (Urdu/Hindi Mix).
- AHMAD RDX (Owner) ke samne hamesha sar jhuka kar "Ji Boss" kehna hai.
- Reply Length: Short (1-3 lines).
- Context: Pichli baatein yaad rakh kar jawab de.
`;

// --- FILE HANDLING ---
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function getHistory() {
  try { return fs.readJsonSync(HISTORY_FILE); } catch { return {}; }
}
function saveHistory(data) {
  fs.writeJsonSync(HISTORY_FILE, data, { spaces: 2 });
}

// --- MAIN LOGIC ---
module.exports.handleEvent = async function ({ api, event }) {
  protectCredits(module.exports.config);
  const { threadID, messageID, body, senderID, messageReply } = event;
  if (!body) return;

  const rawText = body.trim();
  const text = rawText.toLowerCase();

  // --- TRIGGERS ---
  // 1. Agar message "bot" ya "arif" se shuru ho
  const isTrigger = text.startsWith("bot ") || text.startsWith("arif ");
  // 2. Agar koi bot ke message par reply kare (Continuous Chat)
  const isReplyToBot = messageReply && messageReply.senderID === api.getCurrentUserID();
  // 3. Exact "bot" word
  const isExactBot = text === "bot" || text === "arif";

  if (!isTrigger && !isReplyToBot && !isExactBot) return;

  // --- GREETING LOGIC ---
  if (isExactBot) {
    if (senderID === OWNER_ID) {
      return api.sendMessage("Jee Boss AHMAD RDX? ❤️ Main hazir hoon, hukam karein!", threadID, messageID);
    }
    const greetings = [
      "Ji jani? AHMAD RDX hazir hai 🙂",
      "Bolo? Pyar se bologe to jawab milega, attitude dikhaya to roast milega! 😎",
      "Haan bhai, kya scene hai? ❤️"
    ];
    return api.sendMessage(greetings[Math.floor(Math.random() * greetings.length)], threadID, messageID);
  }

  // --- AI PROCESSING ---
  let userText = rawText;
  if (isTrigger) {
    userText = rawText.replace(/^(bot|arif)/i, "").trim();
  }

  api.setMessageReaction("👀", messageID, () => {}, true);
  api.sendTypingIndicator(threadID);

  try {
    let history = getHistory();
    if (!history[threadID]) history[threadID] = [];

    // Context Context: Batana ke user kaun hai
    let userContext = "User is a normal person. Analyze their tone.";
    if (senderID === OWNER_ID) userContext = "USER IS YOUR BOSS & OWNER 'AHMAD RDX'. TREAT HIM LIKE A KING.";

    const res = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
      model: "meta-llama/llama-3.1-8b-instruct",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "system", content: `[CURRENT USER INFO: ${userContext}]` }, 
        ...history[threadID].slice(-20), // Pichli 10 messages (User+Bot = 20 lines)
        { role: "user", content: userText }
      ],
      max_tokens: 150,
      temperature: 1.0 // High creativity for roasting
    }, {
      headers: { 
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json" 
      }
    });

    let reply = res.data.choices[0].message.content || "Main abhi mood mein nahi hoon 😒";
    
    // History Update
    history[threadID].push({ role: "user", content: userText }, { role: "assistant", content: reply });
    // Limit history to last 20 items (10 conversations)
    if (history[threadID].length > 20) history[threadID] = history[threadID].slice(-20);
    saveHistory(history);

    api.setMessageReaction("🔥", messageID, () => {}, true);
    api.sendMessage(reply, threadID, messageID);

  } catch (err) {
    console.log("AI Error:", err.message);
    api.sendMessage("Dimagh slow chal raha hai, net issue hai shayad 😴", threadID, messageID);
  }
};

// Prefix command run (empty because event handles everything)
module.exports.run = async function({}) {};
