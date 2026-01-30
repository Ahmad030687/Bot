const ws3fca = require('./Data/rdx-fca');
const fs = require('fs-extra');
const path = require('path');
const cron = require('node-cron');
const moment = require('moment-timezone');
const axios = require('axios');

// =====================================================================
// 🤖 AHMAD ALI "AI HUMAN" PROTOCOL (Smart Delay + Instant Typing)
// =====================================================================

// Global Map to track spamming history
const threadCooldowns = new Map();

// 1. SLEEP MODE (Raat 2 se Subah 7 tak OFF)
function isSleepTime() {
  const hour = moment().tz("Asia/Karachi").hour();
  return (hour >= 2 && hour < 7);
}

// =====================================================================
// 🧠 AI-BASED DELAY CALCULATOR (Aapka Diya Hua Logic)
// =====================================================================
function aiBasedDelay({ message, threadID, lastThreadTime }) {
  let delay = 2000; // Minimum 2 Seconds (Safety Base)

  // Message text extract karo (Chahe string ho ya object)
  const text = typeof message === "string" ? message : (message?.body || "");
  const length = text.length;

  // 📏 RULE 1: Length Based Thinking
  if (length < 10) delay += 1000;         // "Hi" -> Fast
  else if (length < 40) delay += 2000;    // Short sentence -> Normal
  else if (length < 100) delay += 4000;   // Paragraph -> Slow
  else delay += 6000;                     // Huge text -> Very Slow

  // ❓ RULE 2: Question/Problem Detection (Thinking Time)
  if (/\?|error|issue|masla|problem|code|help/i.test(text)) {
      delay += 2000;
  }

  // 😤 RULE 3: Aggressive Text Detection (Hesitation)
  if (/!!!|\?\?|gali|bakwas|fast|jaldi/i.test(text)) {
      delay += 3000; 
  }

  // 🙏 RULE 4: Polite/Short Text (Quick Reply)
  if (/thanks|thx|ok|acha|done|👍|❤/i.test(text)) {
      delay -= 1000;
  }

  // ⏱️ RULE 5: Thread Activity (Agar convo tez hai to slow ho jao)
  if (lastThreadTime) {
    const gap = Date.now() - lastThreadTime;
    if (gap < 8000) delay += 2500; // Agar pichla msg 8 sec pehle tha, to slow ho jao
  }

  // 🌙 RULE 6: Late Night Fatigue (Raat ko slow)
  const hour = new Date().getHours();
  if (hour >= 0 && hour <= 6) delay += 3000;

  // 🎲 RULE 7: Random Human Jitter (Natural feel)
  delay += Math.floor(Math.random() * 1500);

  // ⛔ Safety Limits
  if (delay < 2000) delay = 2000;    // Kam se kam 2 sec
  if (delay > 12000) delay = 12000;  // Zyada se zyada 12 sec

  return delay;
}

// =====================================================================
// ⚡ TYPING INDICATOR LOOP (Instant Start)
// =====================================================================
function startTyping(api, threadID) {
  if (!threadID) return null;

  // 1. FORAN Start karo (No Waiting)
  try { api.sendTypingIndicator(threadID, () => {}); } catch (e) {}

  // 2. Interval set karo taake dots ghayab na hon
  const interval = setInterval(() => {
    try { api.sendTypingIndicator(threadID, () => {}); } catch (e) {}
  }, 3000); // Har 3 sec baad refresh

  return interval;
}

function stopTyping(interval) {
  if (interval) clearInterval(interval);
}

// =====================================================================
// 🛡️ API PATCHER (The Manager)
// =====================================================================
function patchApi(api) {
  const origSendMessage = api.sendMessage;

  api.sendMessage = async function (...args) {
    const msg = args[0];
    let threadID = args[1];

    // ThreadID Safe Detection
    if (!threadID && typeof args[0] === 'string' && /^\d+$/.test(args[0])) {
        threadID = args[0];
    }

    // --- 🚫 CHECK 1: BANNED GROUP ---
    if (threadID) {
        const idStr = String(threadID);
        // Agar memory mein ban hai, to RETURN (Kuch mat karo)
        if (global.data && global.data.threadBanned && global.data.threadBanned.has(idStr)) {
            return; 
        }
    }

    // --- 🌙 CHECK 2: SLEEP MODE ---
    if (isSleepTime()) return;

    // --- ⚡ CHECK 3: BURST PROTECTION ---
    const lastSent = threadCooldowns.get(threadID) || 0;
    if (threadID && Date.now() - lastSent < 2000) {
        return; // Ignore machine gun spam
    }

    // ======================================================
    // 🔥 STEP 4: INSTANT TYPING (Ye sabse pehle chalega)
    // ======================================================
    let typingInterval = null;
    if (threadID) {
        typingInterval = startTyping(api, threadID);
    }

    // ======================================================
    // 🧠 STEP 5: AI DELAY CALCULATION
    // ======================================================
    const aiDelay = aiBasedDelay({
      message: msg,
      threadID: threadID,
      lastThreadTime: lastSent
    });

    // ⏳ WAIT (Is doran Typing... chalta rahega)
    await new Promise(r => setTimeout(r, aiDelay));

    // Update Last Sent
    if (threadID) threadCooldowns.set(threadID, Date.now());

    // ======================================================
    // 🚀 STEP 6: SEND MESSAGE
    // ======================================================
    let result;
    try {
      result = await origSendMessage.apply(api, args);
    } catch (e) {
      // Error handling
    } finally {
      // Message jane ke baad Typing Band
      if (typingInterval) stopTyping(typingInterval);
    }

    return result;
  };

  return api;
}

// ============================================================
// ⚙️ SYSTEM CONFIGURATION
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
// 🖼️ DATA ASSETS (Full List)
// ============================================================

const quranPics = [
  'https://i.ibb.co/JRBFpq8t/6c776cdd6b6c.gif', 
  'https://i.ibb.co/TDy4gPY3/3c32c5aa9c1d.gif',
  'https://i.ibb.co/8nr8qyQ4/6bc620dedb70.gif', 
  'https://i.ibb.co/7dTJ6CDr/fb08a62a841c.jpg',
  'https://i.ibb.co/6cPMkDjz/598fc7c4d477.jpg',
  'https://i.ibb.co/Txn0TTps/7e729fcd56e1.jpg',
  'https://i.ibb.co/5WQY7xCn/dd0f3964d6cf.jpg',
  'https://i.ibb.co/X3h3F0r/quran-aesthetic.jpg'
];

const namazPics = [
  'https://i.ibb.co/wZpyLkrY/dceaf4301489.jpg', 
  'https://i.ibb.co/6xQbz5W/a6a8d577489d.jpg',
  'https://i.ibb.co/DgKj8LNT/77b2f9b97b9e.jpg', 
  'https://i.ibb.co/bg3PJH6v/f5056f9410d1.gif'
];

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
  { arabic: "وَتُوبُوا إِلَى اللَّهِ جَمِيعًا أَيُّهَ الْمُؤْمِنُونَ", urdu: "اور اے مومنو تم سب اللہ کے حضور توبہ کرو", surah: "Surah An-Nur: 31" }
];

// ============================================================
// 🛠️ LOADING FUNCTIONS
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
    // Silent fail for download
    return false;
  }
}

// ============================================================
// 📡 FIXED BROADCAST FUNCTIONS (No 'Approved' Check)
// ============================================================

async function sendQuranAyat() {
  if (!api || !config.AUTO_ISLAMIC_POST) return;
  
  try {
    const threads = require('./Data/system/database/models/threads').getAll();
    
    // 🔥 FILTER: Approved check removed. Only Banned check remains.
    const validThreads = threads.filter(t => t.banned !== 1 && t.banned !== true);
    
    if (validThreads.length === 0) return;
    
    logs.info('BROADCAST', `Starting Quran Post to ${validThreads.length} groups...`);

    const randomAyat = quranAyats[Math.floor(Math.random() * quranAyats.length)];
    const randomPic = quranPics[Math.floor(Math.random() * quranPics.length)];
    const time = moment().tz('Asia/Karachi').format('hh:mm A');
    
    const message = `📖 𝐐𝐔𝐑𝐀𝐍 𝐀𝐘𝐀𝐓\n\n${randomAyat.arabic}\n\n𝐔𝐫𝐝𝐮 𝐓𝐫𝐚𝐧𝐬𝐥𝐚𝐭𝐢𝐨𝐧:\n${randomAyat.urdu}\n\n📍 ${randomAyat.surah}\n\n🕌 ${config.BOTNAME} | ${time} PKT`;
    
    const cacheDir = path.join(__dirname, 'rdx/commands/cache');
    fs.ensureDirSync(cacheDir);
    const imgPath = path.join(cacheDir, `quran_${Date.now()}.jpg`);
    
    const downloaded = await downloadImage(randomPic, imgPath);
    
    for (const thread of validThreads) {
      // Memory check for banned groups
      if (global.data.threadBanned.has(String(thread.threadID))) continue;

      try {
        if (downloaded && fs.existsSync(imgPath)) {
          await api.sendMessage({ body: message, attachment: fs.createReadStream(imgPath) }, thread.threadID);
        } else {
          await api.sendMessage(message, thread.threadID);
        }
        
        // 20 Seconds Gap for Broadcasting (Safe)
        await new Promise(r => setTimeout(r, 20000));
        
      } catch (e) {}
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
    // 🔥 FILTER: Only check banned status
    const validThreads = threads.filter(t => t.banned !== 1 && t.banned !== true);
    
    if (validThreads.length === 0) return;
    
    const randomPic = namazPics[Math.floor(Math.random() * namazPics.length)];
    const time = moment().tz('Asia/Karachi').format('hh:mm A');
    
    const message = `🕌 𝐍𝐀𝐌𝐀𝐙 𝐀𝐋𝐄𝐑𝐓\n\n⏰ ${namazName.toUpperCase()} کا وقت ہو گیا!\n\n"إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا"\n\n📍 نماز پڑھیں - جنت کی چابی\n\n🕌 ${config.BOTNAME} | ${time} PKT`;
    
    const cacheDir = path.join(__dirname, 'rdx/commands/cache');
    fs.ensureDirSync(cacheDir);
    const imgPath = path.join(cacheDir, `namaz_${Date.now()}.jpg`);
    
    const downloaded = await downloadImage(randomPic, imgPath);
    
    for (const thread of validThreads) {
      if (global.data.threadBanned.has(String(thread.threadID))) continue;

      try {
        if (downloaded && fs.existsSync(imgPath)) {
          await api.sendMessage({ body: message, attachment: fs.createReadStream(imgPath) }, thread.threadID);
        } else {
          await api.sendMessage(message, thread.threadID);
        }
        
        await new Promise(r => setTimeout(r, 20000));

      } catch (e) {}
    }
    
    try { fs.unlinkSync(imgPath); } catch {}
    logs.success('NAMAZ_ALERT', `Finished ${namazName} alert.`);
  } catch (error) {
    logs.error('NAMAZ_ALERT', error.message);
  }
}

function setupSchedulers() {
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
  
  logs.info('BOT', 'Initializing AI Human Protocol...');
  
  const loginOptions = {
    listenEvents: true,
    selfListen: false,
    autoMarkRead: true,
    autoMarkDelivery: false,
    forceLogin: true,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  };

  ws3fca.login(appstate, loginOptions, async (err, loginApi) => {
    if (err) {
      logs.error('LOGIN', `Login Failed: ${err.error || err}`);
      return;
    }
    
    api = loginApi;
    
    // ✅ Initialize Global Memory
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
    // 🔥 LOAD BANNED GROUPS FROM DB TO MEMORY
    // =======================================================
    logs.info('SYSTEM', 'Syncing Database Bans...');
    try {
        const allThreads = await global.Threads.getAll();
        let bannedCount = 0;
        
        allThreads.forEach(thread => {
            if (thread.data && (thread.data.banned == 1 || thread.data.banned === true)) {
                const tID = String(thread.threadID || thread.id);
                if(tID) {
                    global.data.threadBanned.set(tID, 1);
                    bannedCount++;
                }
            }
        });
        logs.success('SYSTEM', `Ban List Synced. Blocked ${bannedCount} Groups.`);
    } catch (e) {
        logs.error('SYSTEM', 'Failed to load banned threads: ' + e.message);
    }

    // ✅ APPLY THE AI PATCH
    global.api = patchApi(api);
    global.startTime = Date.now();
    
    logs.success('LOGIN', 'Logged In! AI Delay + Instant Typing Active.');
    
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
    
    logs.success('BOT', `${config.BOTNAME} is Online & Protected.`);
    
    const adminID = config.ADMINBOT[0];
    if (adminID) {
      try {
        await api.sendMessage(
            `${config.BOTNAME} Online!\n` + 
            `🧠 Logic: AI Based Human\n` +
            `⚡ Typing: Instant Trigger\n` + 
            `🚫 Bans: Synced`, 
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

if (require.main === module) {
  startBot();
}
