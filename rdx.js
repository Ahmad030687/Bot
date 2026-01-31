const ws3fca = require('./Data/rdx-fca');
const fs = require('fs-extra');
const path = require('path');
const cron = require('node-cron');
const moment = require('moment-timezone');
const axios = require('axios');
const logs = require('./Data/utility/logs');

// =====================================================================
// 🛡️ SARDAR RDX: IRON CLAD QUEUE SYSTEM (FINAL v30.0)
// =====================================================================

// 1. GLOBAL VARIABLES
const messageQueue = [];
let isProcessingQueue = false;
let facebookRealSend = null; // Asli Function Yahan Store Hoga

// 2. SLEEP MODE (Raat 2 se Subah 7 tak OFF)
function isSleepTime() {
  const hour = moment().tz("Asia/Karachi").hour();
  return (hour >= 2 && hour < 7);
}

// 3. 🧠 SAFETY DELAY CALCULATOR
function getSafeDelay(text) {
  let delay = 6000; // Base 6 Seconds (Super Safe)

  if (!text) return delay;
  const len = text.length;

  if (len < 10) delay += 1000;
  else if (len < 50) delay += 3000;
  else if (len < 100) delay += 5000;
  else delay += 8000;

  if (/fast|jaldi|spam|ban/i.test(text)) delay += 5000;
  
  // Random Jitter (1-3 sec)
  delay += Math.floor(Math.random() * 3000);
  
  return Math.min(delay, 25000); // Max 25s
}

// 4. 🔥 THE QUEUE ENGINE (PROMISE BASED)
async function processQueue(api) {
  if (isProcessingQueue || messageQueue.length === 0) return;
  isProcessingQueue = true;

  while (messageQueue.length > 0) {
    const task = messageQueue.shift(); // Get first task
    
    // BAN CHECK
    if (global.data.threadBanned.has(String(task.threadID))) {
        if (task.resolve) task.resolve(null); // Resolve empty to prevent stuck code
        continue; 
    }

    try {
        // A. Visual Indicator
        api.sendTypingIndicator(task.threadID, () => {});

        // B. Safety Delay
        const msgBody = typeof task.msg === 'string' ? task.msg : (task.msg.body || "");
        const waitTime = getSafeDelay(msgBody);
        
        // C. HARD STOP (Wait here)
        await new Promise(r => setTimeout(r, waitTime));

        // D. SEND USING REAL FUNCTION
        if (facebookRealSend) {
            // Hum asli function ko call kar rahe hain aur uska result wait kar rahe hain
            const info = await new Promise((resolveInner, rejectInner) => {
                facebookRealSend.call(api, task.msg, task.threadID, (err, result) => {
                    // Call original callback if exists
                    if (task.callback) task.callback(err, result);
                    
                    if (err) rejectInner(err);
                    else resolveInner(result);
                }, task.replyTo);
            });

            // E. Release the Command Handler (Fixes .pending/.help issue)
            if (task.resolve) task.resolve(info);
        }
        
    } catch (e) {
        console.log(`Queue Error: ${e.message}`);
        if (task.reject) task.reject(e); // Notify command handler of error
        await new Promise(r => setTimeout(r, 2000)); // Error cooldown
    }
  }

  isProcessingQueue = false;
}

// 5. 🛡️ API PATCHER (Intercepts & Returns Promise)
function patchApi(api) {
  // Save Original Function
  facebookRealSend = api.sendMessage; 

  // Overwrite with Queue Logic
  api.sendMessage = function (msg, threadID, callback, replyTo) {
    // Return a Promise so commands like .pending can "await" it
    return new Promise((resolve, reject) => {
        // Validation
        if (!threadID && typeof msg === 'string' && /^\d+$/.test(msg)) threadID = msg;
        
        if (!threadID) {
            const err = "No Thread ID";
            if(callback) callback(err, null);
            return reject(err);
        }

        // Immediate Rejection checks
        if (global.data.threadBanned.has(String(threadID))) return resolve(null);
        if (isSleepTime()) return resolve(null);

        // Push to Queue with Resolvers
        messageQueue.push({ 
            msg, 
            threadID, 
            callback, 
            replyTo, 
            resolve, 
            reject 
        });
        
        // Start Engine
        processQueue(api);
    });
  };

  return api;
}

// ============================================================
// ⚙️ CONFIGURATION & PATHS
// ============================================================

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

// 🛠️ CONFIG FUNCTIONS (Fixed)
function loadConfig() {
  try {
    config = fs.readJsonSync(configPath);
    global.config = config;
  } catch (error) {
    logs.error('CONFIG', 'Using Defaults');
    config = {
      BOTNAME: 'SARDAR RDX',
      PREFIX: '.',
      ADMINBOT: ['100009012838085'],
      TIMEZONE: 'Asia/Karachi',
      PREFIX_ENABLED: true,
      ADMIN_ONLY_MODE: false,
      AUTO_ISLAMIC_POST: true
    };
    global.config = config;
    fs.writeJsonSync(configPath, config, { spaces: 2 });
  }
}

function saveConfig() {
  try { fs.writeJsonSync(configPath, global.config, { spaces: 2 }); } catch (e) {}
}

function loadIslamicMessages() {
  try { return fs.existsSync(islamicPath) ? fs.readJsonSync(islamicPath) : { posts: [] }; } 
  catch (e) { return { posts: [] }; }
}

// ============================================================
// 🕌 ISLAMIC SYSTEM (Queue Integrated)
// ============================================================

const quranPics = ['https://i.ibb.co/JRBFpq8t/6c776cdd6b6c.gif', 'https://i.ibb.co/TDy4gPY3/3c32c5aa9c1d.gif'];
const quranAyats = [
  { arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", urdu: "اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے", surah: "Surah Al-Fatiha: 1" },
  { arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", urdu: "بے شک مشکل کے ساتھ آسانی ہے", surah: "Surah Ash-Sharh: 6" },
  { arabic: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ", urdu: "اور جو اللہ پر توکل کرے تو وہ اسے کافی ہے", surah: "Surah At-Talaq: 3" }
];

async function sendIslamicBroadcast(type) {
  if (!api || !facebookRealSend) return;
  try {
    const all = await global.Threads.getAll();
    const targets = all.filter(t => t.data && t.data.banned !== 1);
    
    if (targets.length === 0) return;

    logs.info("BROADCAST", `Queueing ${type} for ${targets.length} groups...`);

    const ayat = quranAyats[Math.floor(Math.random() * quranAyats.length)];
    const time = moment().tz('Asia/Karachi').format('hh:mm A');
    let title = type === 'namaz' ? '🕌 𝐍𝐀𝐌𝐀𝐙 𝐀𝐋𝐄𝐑𝐓' : '📖 𝐐𝐔𝐑𝐀𝐍 𝐀𝐘𝐀𝐓';
    let msg = `${title}\n\n${ayat.arabic}\n\nUrdu: ${ayat.urdu}\n\n📍 ${config.BOTNAME} | ${time}`;

    // Broadcast tasks mein hum 'resolve' ka wait nahi karte taake loop chalta rahe
    for (const t of targets) {
      if (global.data.threadBanned.has(String(t.threadID))) continue;
      messageQueue.push({ msg, threadID: t.threadID });
    }
    processQueue(api);

  } catch (e) { logs.error("BROADCAST", e.message); }
}

function setupSchedulers() {
  cron.schedule('0 9,21 * * *', () => sendIslamicBroadcast('quran'), { timezone: 'Asia/Karachi' });
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
  
  // 1. CONFIG LOAD
  loadConfig();
  loadIslamicMessages();

  let appstate;
  try { appstate = fs.readJsonSync(appstatePath); } catch (e) { return logs.error('APPSTATE', 'Not Found!'); }

  ws3fca.login(appstate, { listenEvents: true, selfListen: false, autoMarkRead: true, forceLogin: true }, async (err, loginApi) => {
    if (err) return logs.error('LOGIN', 'Failed!');

    api = loginApi;
    // 2. APPLY THE FINAL PATCH
    global.api = patchApi(api);
    
    global.data = { threadBanned: new Map(), userBanned: new Map(), allThreadID: [], allUserID: [], online: [] };

    // 3. CONTROLLERS
    const UsersController = require('./Data/system/controllers/users');
    const ThreadsController = require('./Data/system/controllers/threads');
    const CurrenciesController = require('./Data/system/controllers/currencies');
    
    global.Users = new UsersController(api);
    global.Threads = new ThreadsController(api);
    global.Currencies = new CurrenciesController(api);
    global.client = client;

    // 4. DB SYNC (Restoring Bans)
    logs.info("SYSTEM", "Loading Database...");
    try {
        const threadsFromDB = await global.Threads.getAll();
        threadsFromDB.forEach(t => { 
            const tID = String(t.threadID);
            if (t.data && (t.data.banned == 1 || t.data.banned === true)) global.data.threadBanned.set(tID, 1);
            if (tID) global.data.allThreadID.push(tID);
        });
        logs.success("SYSTEM", `Loaded. Banned: ${global.data.threadBanned.size}`);
    } catch (e) { logs.error("DB", e.message); }

    await loadCommands(client, commandsPath);
    await loadEvents(client, eventsPath);
    setupSchedulers();
    
    const listener = listen({ api, client, Users: global.Users, Threads: global.Threads, Currencies: global.Currencies, config });
    
    // 5. LISTENER WITH AUTO-REGISTER
    api.listenMqtt(async (err, event) => {
        if (err) return;
        
        // Strict Ban Check
        if (event.threadID && global.data.threadBanned.has(String(event.threadID))) return;
        
        // Auto-Register for .pending command
        if (event.threadID && !global.data.allThreadID.includes(String(event.threadID))) {
            try {
                const check = await global.Threads.getData(event.threadID);
                if (!check) {
                    await global.Threads.setData(event.threadID, { threadID: event.threadID, approved: 0, banned: 0 });
                    global.data.allThreadID.push(String(event.threadID));
                    logs.info("SYSTEM", `New Group Registered: ${event.threadID}`);
                }
            } catch(e) {}
        }
        
        listener(err, event);
    });

    logs.success('BOT', 'Ahmad Ali System Online | Queue Mode: ACTIVE | 100% SAFE');
    
    // Admin Notification via Real Send
    if (config.ADMINBOT[0] && facebookRealSend) {
        try {
            facebookRealSend.call(api, "✅ System Online.\n🛡️ Queue: Active\n⚡ Commands: Fixed", config.ADMINBOT[0]);
        } catch(e){}
    }
  });
}

// HANDLERS
process.on('unhandledRejection', (reason, promise) => logs.warn('UNHANDLED', 'Ignored'));
process.on('uncaughtException', (error) => logs.error('EXCEPTION', error.message));

module.exports = { startBot };

if (require.main === module) { startBot(); }
                                                                                  
