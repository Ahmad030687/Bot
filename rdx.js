const ws3fca = require('./Data/rdx-fca');
const fs = require('fs-extra');
const path = require('path');
const cron = require('node-cron');
const moment = require('moment-timezone');
const axios = require('axios');

// =====================================================================
// 🛡️ SARDAR RDX: ULTIMATE QUEUE SYSTEM (BAN PROOF v20.0)
// =====================================================================

// 1. GLOBAL VARIABLES
const messageQueue = [];
let isProcessingQueue = false;
const threadCooldowns = new Map();

// 2. SLEEP MODE (Raat 2 se Subah 7 tak OFF)
function isSleepTime() {
  const hour = moment().tz("Asia/Karachi").hour();
  return (hour >= 2 && hour < 7);
}

// 3. 🧠 SMART DELAY CALCULATOR (Minimum 5 Seconds)
function getSafeDelay(text) {
  let delay = 5000; // Base Delay

  if (!text) return delay;
  const len = text.length;

  if (len < 10) delay += 1000;
  else if (len < 50) delay += 3000;
  else if (len < 100) delay += 5000;
  else delay += 8000;

  // Anti-Spam (Agar user jaldi macha raha ho)
  if (/fast|jaldi|spam|reply/i.test(text)) delay += 4000;

  // Random Jitter (Insani ehsas dilane ke liye)
  delay += Math.floor(Math.random() * 2500);
  
  return Math.min(delay, 20000); // Max 20s wait
}

// 4. 🔥 QUEUE PROCESSOR (Ye Engine Messages ko 1-by-1 bhejta hai)
async function processQueue(api) {
  if (isProcessingQueue || messageQueue.length === 0) return;
  isProcessingQueue = true;

  while (messageQueue.length > 0) {
    const task = messageQueue.shift();
    
    // FINAL BAN CHECK
    if (global.data.threadBanned.has(String(task.threadID))) {
        continue; 
    }

    try {
        // A. Typing Indicator
        api.sendTypingIndicator(task.threadID, () => {});

        // B. Calculate Logic
        const msgBody = typeof task.msg === 'string' ? task.msg : (task.msg.body || "");
        const waitTime = getSafeDelay(msgBody);
        
        // C. WAIT (Ye line ID ko Ban hone se bachati hai)
        await new Promise(resolve => setTimeout(resolve, waitTime));

        // D. Send
        await api.sendMessage(task.msg, task.threadID, task.callback, task.replyTo);
        
    } catch (e) {
        console.log(`Queue Error: ${e.message}`);
        // Error ke baad bhi thora wait karo
        await new Promise(r => setTimeout(r, 2000));
    }
  }

  isProcessingQueue = false;
}

// 5. 🛡️ API INTERCEPTOR (Patch)
function patchApi(api) {
  const origSendMessage = api.sendMessage;

  api.sendMessage = async function (msg, threadID, callback, replyTo) {
    if (!threadID && typeof msg === 'string' && /^\d+$/.test(msg)) threadID = msg;
    if (!threadID) return;

    // Strict Checks
    if (global.data.threadBanned.has(String(threadID))) return;
    if (isSleepTime()) return;

    // Push to Queue (Direct send nahi hoga)
    messageQueue.push({ msg, threadID, callback, replyTo });
    processQueue(api);
  };

  return api;
}

// ============================================================
// ⚙️ SYSTEM CONFIG & PATHS
// ============================================================

const logs = require('./Data/utility/logs');
const listen = require('./Data/system/listen');
const { loadCommands, loadEvents } = require('./Data/system/handle/handleRefresh');

const configPath = path.join(__dirname, 'config.json');
const appstatePath = path.join(__dirname, 'appstate.json');
const commandsPath = path.join(__dirname, 'rdx/commands');
const eventsPath = path.join(__dirname, 'rdx/events');
const islamicPath = path.join(__dirname, 'Data/config/islamic_messages.json');

let config = {};
let api = null;
let client = {
  commands: new Map(),
  events: new Map(),
  replies: new Map(),
  cooldowns: new Map()
};

// ============================================================
// 🕌 ISLAMIC DATA & BROADCAST SYSTEM
// ============================================================

const quranPics = [
  'https://i.ibb.co/JRBFpq8t/6c776cdd6b6c.gif', 
  'https://i.ibb.co/TDy4gPY3/3c32c5aa9c1d.gif'
];

const quranAyats = [
  { arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", urdu: "اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے", surah: "Surah Al-Fatiha: 1" },
  { arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", urdu: "بے شک مشکل کے ساتھ آسانی ہے", surah: "Surah Ash-Sharh: 6" },
  { arabic: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ", urdu: "اور جو اللہ پر توکل کرے تو وہ اسے کافی ہے", surah: "Surah At-Talaq: 3" },
  { arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ", urdu: "پس تم مجھے یاد کرو میں تمہیں یاد کروں گا", surah: "Surah Al-Baqarah: 152" }
];

async function downloadImage(url, filePath) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 });
    fs.writeFileSync(filePath, Buffer.from(response.data));
    return true;
  } catch (e) { return false; }
}

async function sendIslamicBroadcast(type) {
  if (!api) return;
  try {
    const all = await global.Threads.getAll();
    // Banned groups ko nikal do
    const targets = all.filter(t => t.data && t.data.banned !== 1);
    
    if (targets.length === 0) return;

    logs.info("BROADCAST", `Queueing ${type} for ${targets.length} groups...`);

    const ayat = quranAyats[Math.floor(Math.random() * quranAyats.length)];
    const time = moment().tz('Asia/Karachi').format('hh:mm A');
    let title = type === 'namaz' ? '🕌 𝐍𝐀𝐌𝐀𝐙 𝐀𝐋𝐄𝐑𝐓' : '📖 𝐐𝐔𝐑𝐀𝐍 𝐀𝐘𝐀𝐓';
    let msg = `${title}\n\n${ayat.arabic}\n\nUrdu: ${ayat.urdu}\n\n📍 ${config.BOTNAME} | ${time}`;

    // Sabko Queue mein daal do
    for (const t of targets) {
      if (global.data.threadBanned.has(String(t.threadID))) continue;
      messageQueue.push({ msg, threadID: t.threadID });
    }
    processQueue(api);

  } catch (e) { logs.error("BROADCAST", e.message); }
}

function setupSchedulers() {
  // Quran: 9 AM & 9 PM
  cron.schedule('0 9,21 * * *', () => sendIslamicBroadcast('quran'), { timezone: 'Asia/Karachi' });
  
  // Namaz: Fixed Timings
  const namazTimes = ['43 5', '23 12', '7 16', '43 17', '4 19']; 
  namazTimes.forEach(t => {
      cron.schedule(`${t} * * *`, () => sendIslamicBroadcast('namaz'), { timezone: 'Asia/Karachi' });
  });
}

// ============================================================
// 🚀 MAIN START FUNCTION
// ============================================================

async function startBot() {
  logs.banner();
  
  try { config = fs.readJsonSync(configPath); global.config = config; } catch (e) {
    config = { BOTNAME: "SARDAR RDX", PREFIX: ".", ADMINBOT: ["100009012838085"] };
    global.config = config;
  }

  let appstate;
  try { appstate = fs.readJsonSync(appstatePath); } catch (e) { return logs.error('APPSTATE', 'Not Found!'); }

  ws3fca.login(appstate, { listenEvents: true, selfListen: false, autoMarkRead: true, forceLogin: true }, async (err, loginApi) => {
    if (err) return logs.error('LOGIN', 'Failed!');

    api = loginApi;
    // 1. APPLY QUEUE PATCH (Zaroori)
    global.api = patchApi(api);
    
    global.data = { threadBanned: new Map(), userBanned: new Map(), allThreadID: [], allUserID: [], online: [] };

    // 2. INIT CONTROLLERS
    const UsersController = require('./Data/system/controllers/users');
    const ThreadsController = require('./Data/system/controllers/threads');
    const CurrenciesController = require('./Data/system/controllers/currencies');
    
    global.Users = new UsersController(api);
    global.Threads = new ThreadsController(api);
    global.Currencies = new CurrenciesController(api);
    global.client = client;

    // 3. 🔥 DATABASE SYNC (Thread Ban Fix)
    logs.info("SYSTEM", "Loading Database & Bans...");
    try {
        const threadsFromDB = await global.Threads.getAll();
        threadsFromDB.forEach(t => { 
            const tID = String(t.threadID);
            // Sync Banned
            if (t.data && (t.data.banned == 1 || t.data.banned === true)) {
                global.data.threadBanned.set(tID, 1);
            }
            // Sync All IDs
            if (tID) global.data.allThreadID.push(tID);
        });
        logs.success("SYSTEM", `Sync Complete. ${global.data.threadBanned.size} Groups Banned.`);
    } catch (e) {
        logs.error("DB", "Database Error: " + e.message);
    }

    await loadCommands(client, commandsPath);
    await loadEvents(client, eventsPath);
    setupSchedulers();
    
    const listener = listen({ api, client, Users: global.Users, Threads: global.Threads, Currencies: global.Currencies, config });
    
    // 4. EVENT LISTENER (Pending & Ban Logic)
    api.listenMqtt(async (err, event) => {
        if (err) return;

        // 🛡️ STRICT BAN CHECK (Incoming message ko yahin rok do)
        if (event.threadID && global.data.threadBanned.has(String(event.threadID))) {
            return; 
        }
        
        // ⚡ AUTO-REGISTER (Pending Command Fix)
        // Agar naya group hai to DB mein daalo
        if (event.threadID && !global.data.allThreadID.includes(String(event.threadID))) {
            try {
                const check = await global.Threads.getData(event.threadID);
                if (!check) {
                    await global.Threads.setData(event.threadID, { threadID: event.threadID, approved: 0, banned: 0 });
                    global.data.allThreadID.push(String(event.threadID));
                    logs.info("SYSTEM", `New Group Registered: ${event.threadID}`);
                    
                    // Optional: Send Welcome
                    // api.sendMessage(`✅ Bot Connected.\nWait for Admin Approval.\nID: ${event.threadID}`, event.threadID);
                }
            } catch(e) {
                console.log("Auto-Reg Error: " + e.message);
            }
        }
        
        listener(err, event);
    });

    logs.success('BOT', 'Ahmad Ali System Online | Queue Mode: ACTIVE');
  });
}

// Global Error Handlers (Taake bot crash na ho)
process.on('unhandledRejection', (reason, promise) => {
  logs.warn('UNHANDLED', 'Unhandled Promise Rejection (Ignored)');
});

process.on('uncaughtException', (error) => {
  logs.error('EXCEPTION', `Uncaught Exception: ${error.message}`);
});

module.exports = {
  startBot,
  getApi: () => api,
  getClient: () => client,
  getConfig: () => config,
  saveConfig,
  loadConfig,
  reloadCommands: () => loadCommands(client, commandsPath),
  reloadEvents: () => loadEvents(client, eventsPath)
};

if (require.main === module) {
  startBot();
}
