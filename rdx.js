const ws3fca = require('./Data/rdx-fca');
const fs = require('fs-extra');
const path = require('path');
const cron = require('node-cron');
const moment = require('moment-timezone');
const axios = require('axios');

// =====================================================================
// 🛡️ AHMAD ALI "FORTRESS" SECURITY PROTOCOL (v9.0 - FINAL)
// =====================================================================
// WARNING: DO NOT CHANGE DELAY VALUES IF YOU WANT TO KEEP ID SAFE.
// =====================================================================

// Global Map to track spamming speed per group
const threadCooldowns = new Map();

/**
 * 1. SLEEP MODE SYSTEM
 * Raat 2:00 AM se Subah 7:00 AM tak Bot automatically OFF ho jayega.
 * Ye Facebook ko show karta hai ke user Insaan hai, Robot nahi.
 */
function isSleepTime() {
  const hour = moment().tz("Asia/Karachi").hour();
  // 2 AM (2) se 7 AM (7) tak return TRUE
  return (hour >= 2 && hour < 7);
}

/**
 * 2. THE GATEKEEPER (API PATCHER)
 * Ye function har message ko rok kar check karta hai.
 * Yahan Ban Check, Speed Check, aur Typing Indicator handle hota hai.
 */
function patchApi(api) {
  const origSendMessage = api.sendMessage;

  api.sendMessage = async function(...args) {
    const msg = args[0];
    let threadID = args[1]; // Normally 2nd argument is threadID

    // --- [STEP 1: THREAD ID DETECTION] ---
    // Kabhi kabhi arguments shift ho jate hain, isliye safe check:
    if (!threadID && typeof args[0] === 'string' && /^\d+$/.test(args[0])) {
        threadID = args[0];
    }
    
    // Agar ThreadID abhi bhi nahi mila, to risk mat lo, jaane do
    if (!threadID) {
        // Fallback for some system messages
        // return origSendMessage.apply(api, args); 
    }

    // --- [STEP 2: BANNED GROUP CHECK - CRITICAL] ---
    // Ye sabse pehle check hona chahiye.
    if (threadID) {
        const idString = String(threadID);
        if (global.data.threadBanned.has(idString)) {
            // Agar group Banned hai, to Code yahin khatam. No Reply.
            return; 
        }
    }

    // --- [STEP 3: SLEEP MODE CHECK] ---
    if (isSleepTime()) {
        // Agar sone ka waqt hai, to ignore karo.
        return;
    }

    // --- [STEP 4: BURST PROTECTION] ---
    // Machine Gun Spam rokne ke liye 2 second ka strict lock
    if (threadID) {
        const lastSent = threadCooldowns.get(threadID) || 0;
        const now = Date.now();
        if (now - lastSent < 2000) {
           return; // Too fast, ignore silently
        }
    }

    // --- [STEP 5: FORCE TYPING INDICATOR] ---
    // Delay shuru hone se pehle Typing dikhana zaroori hai
    try {
        if (threadID) {
            api.sendTypingIndicator(threadID, (err) => {
                if(err) { /* Silent Catch */ }
            });
        }
    } catch (e) {}

    // --- [STEP 6: SMART HUMAN DELAY LOGIC] ---
    // Base Delay: 3 Seconds (Safety ke liye barha diya hai)
    let baseDelay = 3000; 
    
    // Message Length Calculate karo
    let msgLength = 0;
    if (typeof msg === 'string') {
        msgLength = msg.length;
    } else if (msg && msg.body) {
        msgLength = msg.body.length;
    }

    // Calculation:
    // Har 50 characters par 1 second extra wait karega.
    // Example: "Hi" = 3s wait.
    // Example: "Menu list..." (200 chars) = 3s + 4s = 7s wait.
    const extraTime = Math.floor(msgLength / 50) * 1000;
    
    // Cap: Maximum 10 seconds se zyada user ko wait na karwao
    const finalExtraTime = Math.min(extraTime, 7000);
    
    // Random Factor: 0 se 1.5 second ka random fark (Taake robot na lage)
    const randomJitter = Math.floor(Math.random() * 1500);

    const totalDelay = baseDelay + finalExtraTime + randomJitter;

    // WAIT (Is doran Typing... show hota rahega)
    await new Promise(r => setTimeout(r, totalDelay));

    // --- [STEP 7: UPDATE LAST SENT TIME] ---
    if (threadID) threadCooldowns.set(threadID, Date.now());

    // --- [STEP 8: FINALLY SEND MESSAGE] ---
    return origSendMessage.apply(api, args);
  };
  
  return api;
}

// ============================================================
// ⚙️ SYSTEM CONFIGURATION & IMPORTS
// ============================================================

const logs = require('./Data/utility/logs');
const listen = require('./Data/system/listen');
const { loadCommands, loadEvents } = require('./Data/system/handle/handleRefresh');
const UsersController = require('./Data/system/controllers/users');
const ThreadsController = require('./Data/system/controllers/threads');
const CurrenciesController = require('./Data/system/controllers/currencies');

const configPath = path.join(__dirname, 'config.json');
const appstatePath = path.join(__dirname, 'appstate.json');
const islamicPath = path.join(__dirname, 'Data/config/islamic_messages.json');
const commandsPath = path.join(__dirname, 'rdx/commands');
const eventsPath = path.join(__dirname, 'rdx/events');

let config = {};
let islamicMessages = {};
let api = null;
let client = {
  commands: new Map(),
  events: new Map(),
  replies: new Map(),
  cooldowns: new Map()
};

// ============================================================
// 🖼️ DATA ASSETS (EXTENDED LIST)
// ============================================================

const quranPics = [
  'https://i.ibb.co/JRBFpq8t/6c776cdd6b6c.gif', 
  'https://i.ibb.co/TDy4gPY3/3c32c5aa9c1d.gif',
  'https://i.ibb.co/8nr8qyQ4/6bc620dedb70.gif', 
  'https://i.ibb.co/7dTJ6CDr/fb08a62a841c.jpg',
  'https://i.ibb.co/6cPMkDjz/598fc7c4d477.jpg',
  'https://i.ibb.co/Txn0TTps/7e729fcd56e1.jpg',
  'https://i.ibb.co/5WQY7xCn/dd0f3964d6cf.jpg',
  'https://i.ibb.co/X3h3F0r/quran-aesthetic.jpg',
  'https://i.ibb.co/zn9LpQk/islamic-bg.jpg'
];

const namazPics = [
  'https://i.ibb.co/wZpyLkrY/dceaf4301489.jpg', 
  'https://i.ibb.co/6xQbz5W/a6a8d577489d.jpg',
  'https://i.ibb.co/DgKj8LNT/77b2f9b97b9e.jpg', 
  'https://i.ibb.co/bg3PJH6v/f5056f9410d1.gif',
  'https://i.ibb.co/Kjk2LpM/prayer-mat.jpg'
];

// Expanded Quran Ayats List for Variety
const quranAyats = [
  { arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", urdu: "اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے", surah: "Surah Al-Fatiha: 1" },
  { arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", urdu: "بے شک مشکل کے ساتھ آسانی ہے", surah: "Surah Ash-Sharh: 6" },
  { arabic: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ", urdu: "اور جو اللہ پر توکل کرے تو وہ اسے کافی ہے", surah: "Surah At-Talaq: 3" },
  { arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ", urdu: "پس تم مجھے یاد کرو میں تمہیں یاد کروں گا", surah: "Surah Al-Baqarah: 152" },
  { arabic: "وَاصْبِرْ وَمَا صَبْرُكَ إِلَّا بِاللَّهِ", urdu: "اور صبر کرو اور تمہارا صبر اللہ ہی کی توفیق سے ہے", surah: "Surah An-Nahl: 127" },
  { arabic: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ", urdu: "بے شک اللہ صبر کرنے والوں کے ساتھ ہے", surah: "Surah Al-Baqarah: 153" },
  { arabic: "وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ", urdu: "اور اللہ کی رحمت سے مایوس نہ ہو", surah: "Surah Yusuf: 87" },
  { arabic: "رَبِّ اشْرَحْ لِي صَدْرِي", urdu: "اے میرے رب میرے سینے کو کھول دے", surah: "Surah Ta-Ha: 25" },
  { arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", urdu: "اللہ ہمیں کافی ہے اور وہ بہترین کارساز ہے", surah: "Surah Al-Imran: 173" },
  { arabic: "وَقُل رَّبِّ زِدْنِي عِلْمًا", urdu: "اور کہو کہ اے میرے رب میرے علم میں اضافہ فرما", surah: "Surah Ta-Ha: 114" },
  { arabic: "إِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ", urdu: "بے شک اللہ نیکی کرنے والوں کا اجر ضائع نہیں کرتا", surah: "Surah Yusuf: 90" },
  { arabic: "وَتُوبُوا إِلَى اللَّهِ جَمِيعًا أَيُّهَ الْمُؤْمِنُونَ", urdu: "اور اے مومنو تم سب اللہ کے حضور توبہ کرو", surah: "Surah An-Nur: 31" },
  { arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ", urdu: "اللہ کے سوا کوئی معبود نہیں، وہ زندہ اور سب کا تھامنے والا ہے", surah: "Ayat-ul-Kursi" },
  { arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً", urdu: "اے ہمارے رب! ہمیں دنیا میں بھی بھلائی دے اور آخرت میں بھی بھلائی دے", surah: "Surah Al-Baqarah: 201" },
  { arabic: "إِنَّ اللَّهَ غَفُورٌ رَّحِيمٌ", urdu: "بے شک اللہ بخشنے والا مہربان ہے", surah: "Surah Al-Baqarah: 173" }
];

// ============================================================
// 🛠️ LOADING FUNCTIONS & HELPERS
// ============================================================

function loadConfig() {
  try {
    config = fs.readJsonSync(configPath);
    global.config = config;
  } catch (error) {
    logs.error('CONFIG', 'Failed to load config. Using default.');
    config = {
      BOTNAME: 'SARDAR RDX',
      PREFIX: '.',
      ADMINBOT: ['100009012838085'],
      TIMEZONE: 'Asia/Karachi',
      PREFIX_ENABLED: true,
      REACT_DELETE_EMOJI: '😡',
      ADMIN_ONLY_MODE: false,
      AUTO_ISLAMIC_POST: true,
      AUTO_GROUP_MESSAGE: true
    };
    global.config = config;
  }
}

function loadIslamicMessages() {
  try {
    islamicMessages = fs.readJsonSync(islamicPath);
  } catch (error) {
    logs.error('ISLAMIC', 'Failed to load islamic messages:', error.message);
    islamicMessages = { posts: [], groupMessages: [] };
  }
}

function saveConfig() {
  try {
    fs.writeJsonSync(configPath, config, { spaces: 2 });
    global.config = config;
  } catch (error) {
    logs.error('CONFIG', 'Failed to save config:', error.message);
  }
}

async function downloadImage(url, filePath) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });
    fs.writeFileSync(filePath, Buffer.from(response.data));
    return true;
  } catch (e) {
    logs.error('DOWNLOAD', `Image download failed: ${e.message}`);
    return false;
  }
}

// ============================================================
// 📡 SAFE BROADCAST FUNCTIONS (Checks Ban + Delay)
// ============================================================

async function sendQuranAyat() {
  if (!api || !config.AUTO_ISLAMIC_POST) return;
  
  try {
    const threads = require('./Data/system/database/models/threads').getAll();
    // STRICT FILTER: Approved AND Not Banned
    const approvedThreads = threads.filter(t => t.approved === 1 && t.banned !== 1);
    
    if (approvedThreads.length === 0) return;
    
    logs.info('BROADCAST', `Starting SAFE Quran Post to ${approvedThreads.length} groups...`);

    const randomAyat = quranAyats[Math.floor(Math.random() * quranAyats.length)];
    const randomPic = quranPics[Math.floor(Math.random() * quranPics.length)];
    const time = moment().tz('Asia/Karachi').format('hh:mm A');
    
    const message = `📖 𝐐𝐔𝐑𝐀𝐍 𝐀𝐘𝐀𝐓\n\n${randomAyat.arabic}\n\n𝐔𝐫𝐝𝐮 𝐓𝐫𝐚𝐧𝐬𝐥𝐚𝐭𝐢𝐨𝐧:\n${randomAyat.urdu}\n\n📍 ${randomAyat.surah}\n\n🕌 ${config.BOTNAME} | ${time} PKT`;
    
    const cacheDir = path.join(__dirname, 'rdx/commands/cache');
    fs.ensureDirSync(cacheDir);
    const imgPath = path.join(cacheDir, `quran_${Date.now()}.jpg`);
    
    const downloaded = await downloadImage(randomPic, imgPath);
    
    // ⚠️ BROADCAST LOOP: 25 Seconds Gap Per Group
    // Is loop ke andar bhi hum check karenge ke kahin group ban to nahi ho gaya
    for (const thread of approvedThreads) {
      if (global.data.threadBanned.has(String(thread.threadID))) {
          continue; // Skip Banned Group
      }

      try {
        if (downloaded && fs.existsSync(imgPath)) {
          // Note: Broadcast directly calls patched api but logic inside patchApi might block it
          // So we invoke directly via simple delay here
          await api.sendMessage({ body: message, attachment: fs.createReadStream(imgPath) }, thread.threadID);
        } else {
          await api.sendMessage(message, thread.threadID);
        }
        
        // 25 Seconds Gap (Safe Broadcasting)
        await new Promise(r => setTimeout(r, 25000));
        
      } catch (e) {
        // Silent fail if kicked
      }
    }
    
    try { fs.unlinkSync(imgPath); } catch {}
    logs.success('QURAN_POST', `Broadcast Finished.`);
  } catch (error) {
    logs.error('QURAN_POST', error.message);
  }
}

async function sendNamazAlert(namazName) {
  if (!api) return;
  
  try {
    const threads = require('./Data/system/database/models/threads').getAll();
    const approvedThreads = threads.filter(t => t.approved === 1 && t.banned !== 1);
    
    if (approvedThreads.length === 0) return;
    
    const randomPic = namazPics[Math.floor(Math.random() * namazPics.length)];
    const time = moment().tz('Asia/Karachi').format('hh:mm A');
    
    const message = `🕌 𝐍𝐀𝐌𝐀𝐙 𝐀𝐋𝐄𝐑𝐓\n\n⏰ ${namazName.toUpperCase()} کا وقت ہو گیا!\n\n"إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا"\n\n📍 نماز پڑھیں - جنت کی چابی\n\n🕌 ${config.BOTNAME} | ${time} PKT`;
    
    const cacheDir = path.join(__dirname, 'rdx/commands/cache');
    fs.ensureDirSync(cacheDir);
    const imgPath = path.join(cacheDir, `namaz_${Date.now()}.jpg`);
    
    const downloaded = await downloadImage(randomPic, imgPath);
    
    for (const thread of approvedThreads) {
      // Extra Check
      if (global.data.threadBanned.has(String(thread.threadID))) continue;

      try {
        if (downloaded && fs.existsSync(imgPath)) {
          await api.sendMessage({ body: message, attachment: fs.createReadStream(imgPath) }, thread.threadID);
        } else {
          await api.sendMessage(message, thread.threadID);
        }
        
        // 25 Seconds Gap
        await new Promise(r => setTimeout(r, 25000));

      } catch (e) {}
    }
    
    try { fs.unlinkSync(imgPath); } catch {}
    logs.success('NAMAZ_ALERT', `Finished ${namazName} alert.`);
  } catch (error) {
    logs.error('NAMAZ_ALERT', error.message);
  }
}

function setupSchedulers() {
  // Quran: Sirf 9:00 AM aur 9:00 PM (Twice a day)
  cron.schedule('0 9,21 * * *', () => {
    logs.info('SCHEDULER', 'Twice Daily Quran Ayat triggered');
    sendQuranAyat();
  }, { timezone: 'Asia/Karachi' });
  
  // Namaz: Fixed Timings
  cron.schedule('43 5 * * *', () => sendNamazAlert('Fajr'), { timezone: 'Asia/Karachi' });
  cron.schedule('23 12 * * *', () => sendNamazAlert('Dhuhr'), { timezone: 'Asia/Karachi' });
  cron.schedule('7 16 * * *', () => sendNamazAlert('Asr'), { timezone: 'Asia/Karachi' });
  cron.schedule('43 17 * * *', () => sendNamazAlert('Maghrib'), { timezone: 'Asia/Karachi' });
  cron.schedule('4 19 * * *', () => sendNamazAlert('Isha'), { timezone: 'Asia/Karachi' });
}

// ============================================================
// 🚀 MAIN START FUNCTION (SYNC LOGIC INCLUDED)
// ============================================================

async function startBot() {
  logs.banner();
  loadConfig();
  loadIslamicMessages();
  
  let appstate;
  try {
    appstate = fs.readJsonSync(appstatePath);
  } catch (error) {
    logs.error('APPSTATE', 'Failed to load appstate.json. Please upload a valid appstate.');
    return;
  }
  
  logs.info('BOT', 'Initializing Ahmad Security Protocols v9.0...');
  
  const loginOptions = {
    listenEvents: true,
    selfListen: false,
    autoMarkRead: true,
    autoMarkDelivery: false,
    forceLogin: true,
    // Using a standard modern User Agent for safety
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  };

  ws3fca.login(appstate, loginOptions, async (err, loginApi) => {
    if (err) {
      logs.error('LOGIN', `Login Failed: ${err.error || err}`);
      return;
    }
    
    api = loginApi;
    
    // ✅ Initialize Global Memory
    // IMPORTANT: Yeh step sabse pehle hona chahiye
    global.data = {
      threadBanned: new Map(),
      userBanned: new Map(),
      allThreadID: [],
      allUserID: [],
      online: []
    };

    global.Users = new UsersController(api);
    global.Threads = new ThreadsController(api);
    global.Currencies = new CurrenciesController(api);
    global.client = client;

    // =======================================================
    // 🔥 CRITICAL FIX: LOAD BANNED GROUPS FROM DATABASE TO RAM
    // =======================================================
    logs.info('SYSTEM', 'Syncing Database with Security Firewall...');
    try {
        const allThreads = await global.Threads.getAll();
        let bannedCount = 0;
        
        allThreads.forEach(thread => {
            // Check if 'banned' field exists and is true/1
            if (thread.data && (thread.data.banned == 1 || thread.data.banned === true)) {
                // Ensure ID is String for correct Map matching
                const tID = String(thread.threadID || thread.id);
                if(tID) {
                    global.data.threadBanned.set(tID, 1);
                    bannedCount++;
                }
            }
        });
        
        logs.success('SYSTEM', `Security Firewall Loaded. Blocked ${bannedCount} Banned Groups.`);
    } catch (e) {
        logs.error('SYSTEM', 'Failed to load banned threads: ' + e.message);
    }
    // =======================================================

    // ✅ APPLY THE GATEKEEPER PATCH (After loading bans)
    global.api = patchApi(api);
    global.startTime = Date.now();
    
    logs.success('LOGIN', 'Logged In! Smart Human + Ban Fix Active.');
    
    await loadCommands(client, commandsPath);
    await loadEvents(client, eventsPath);
    
    setupSchedulers();
    
    const listener = listen({
      api,
      client,
      Users: global.Users,
      Threads: global.Threads,
      Currencies: global.Currencies,
      config
    });
    
    api.listenMqtt(listener);
    
    // Stats Logging
    const uniqueCommands = new Set();
    client.commands.forEach((cmd) => {
      if (cmd.config && cmd.config.name) uniqueCommands.add(cmd.config.name.toLowerCase());
    });
    
    logs.success('BOT', `${config.BOTNAME} is Online & Protected.`);
    logs.info('SECURITY', 'Typing Indicator: Force Active');
    logs.info('SECURITY', 'Banned Groups: Loaded & Blocked');
    logs.info('SECURITY', 'Smart Delay: 3s - 10s (Content Based)');
    
    // Notify Admin on Startup
    const adminID = config.ADMINBOT[0];
    if (adminID) {
      try {
        await api.sendMessage(
            `${config.BOTNAME} is Online!\n` + 
            `🔒 Security Level: Ultimate v9.0\n` +
            `🛡️ Typing: Force ON\n` + 
            `🚫 Banned Groups Loaded: Synced\n` +
            `⚡ Anti-Ban Speed: Active`, 
            adminID
        );
      } catch (e) {}
    }
  });
}

// Global Error Handlers
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

// Auto Start if run directly
if (require.main === module) {
  startBot();
    }
      
