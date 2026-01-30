const ws3fca = require('./Data/rdx-fca');
const fs = require('fs-extra');
const path = require('path');
const cron = require('node-cron');
const moment = require('moment-timezone');
const axios = require('axios');

// ============================================================
// 🔒 AHMAD ALI "FORTRESS" SECURITY SYSTEM (High Level)
// ============================================================

// Global Cooldown Map to track last message time per Group
const threadCooldowns = new Map();

// 1. SLEEP MODE: Raat 2 se Subah 7 tak bot OFF
function isSleepTime() {
  const hour = moment().tz("Asia/Karachi").hour();
  return (hour >= 2 && hour < 7);
}

// 2. HEAVY SECURITY API PATCHER
// Ye function har message ko rok kar check karega
function patchApi(api) {
  const origSendMessage = api.sendMessage;

  api.sendMessage = async function(...args) {
    const msg = args[0];
    const threadID = args[1]; // Usually 2nd argument is threadID

    // Check 1: Sleep Time (Sone ke waqt disturb na ho)
    if (isSleepTime()) return;

    // Check 2: Rate Limit (1 Minute mein 1 Message per Group)
    if (threadID) {
        const lastSent = threadCooldowns.get(threadID) || 0;
        const now = Date.now();
        const timeDiff = now - lastSent;

        // Agar 60 Seconds (60000ms) nahi guzre
        if (timeDiff < 60000) {
            // EXCEPTION: Agar ye hamara Quran/Namaz broadcast hai to jaane do
            const isBroadcast = (typeof msg === 'string' && (msg.includes("𝐐𝐔𝐑𝐀𝐍") || msg.includes("𝐍𝐀𝐌𝐀𝐙"))) ||
                                (msg.body && (msg.body.includes("𝐐𝐔𝐑𝐀𝐍") || msg.body.includes("𝐍𝐀𝐌𝐀𝐙")));

            if (!isBroadcast) {
                // Spam detect hua - Ignore message
                // console.log(`[SECURITY] Blocked spam in ${threadID}.`);
                return; 
            }
        }
    }

    try {
        // 3. TYPING INDICATOR (3 Dots Blinking)
        // Message bhejne se pehle typing show karo taake natural lage
        if (threadID) api.sendTypingIndicator(threadID, (err) => {});
    } catch (e) {}

    // 4. RANDOM DELAY (5 to 10 Seconds)
    // Is doran "Typing..." show hota rahega
    const secureDelay = Math.floor(Math.random() * 5000) + 5000; // 5000ms (5s) to 10000ms (10s)
    await new Promise(r => setTimeout(r, secureDelay));

    // 5. UPDATE COOLDOWN TIMER
    if (threadID) threadCooldowns.set(threadID, Date.now());

    // 6. FINALLY SEND MESSAGE
    return origSendMessage.apply(api, args);
  };
  
  return api;
}

// ============================================================
// ⚙️ SYSTEM IMPORTS & CONFIGURATION
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

// 🖼️ ISLAMIC DATA ASSETS
const quranPics = [
  'https://i.ibb.co/JRBFpq8t/6c776cdd6b6c.gif', 
  'https://i.ibb.co/TDy4gPY3/3c32c5aa9c1d.gif',
  'https://i.ibb.co/8nr8qyQ4/6bc620dedb70.gif', 
  'https://i.ibb.co/7dTJ6CDr/fb08a62a841c.jpg',
  'https://i.ibb.co/6cPMkDjz/598fc7c4d477.jpg', 
  'https://i.ibb.co/Txn0TTps/7e729fcd56e1.jpg',
  'https://i.ibb.co/5WQY7xCn/dd0f3964d6cf.jpg'
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
// 🛠️ LOADING & HELPERS
// ============================================================

function loadConfig() {
  try {
    config = fs.readJsonSync(configPath);
    global.config = config;
  } catch (error) {
    logs.error('CONFIG', 'Failed to load config. Using default.');
    config = {
      BOTNAME: 'SARDAR RDX', PREFIX: '.', ADMINBOT: ['100009012838085'],
      TIMEZONE: 'Asia/Karachi', PREFIX_ENABLED: true, REACT_DELETE_EMOJI: '😡',
      ADMIN_ONLY_MODE: false, AUTO_ISLAMIC_POST: true, AUTO_GROUP_MESSAGE: true
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
  try { fs.writeJsonSync(configPath, config, { spaces: 2 }); global.config = config; } 
  catch (error) { logs.error('CONFIG', 'Failed to save config:', error.message); }
}

async function downloadImage(url, filePath) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });
    fs.writeFileSync(filePath, Buffer.from(response.data));
    return true;
  } catch (e) { return false; }
}

// ============================================================
// 📡 BROADCAST FUNCTIONS (Bypasses Rate Limit)
// ============================================================

async function sendQuranAyat() {
  if (!api || !config.AUTO_ISLAMIC_POST) return;
  
  try {
    // Database se groups uthao
    const threads = require('./Data/system/database/models/threads').getAll();
    // Sirf Approved aur Not Banned groups
    const approvedThreads = threads.filter(t => t.approved === 1 && t.banned !== 1);
    
    if (approvedThreads.length === 0) return;
    
    logs.info('BROADCAST', `Starting SAFE Quran Post...`);

    const randomAyat = quranAyats[Math.floor(Math.random() * quranAyats.length)];
    const randomPic = quranPics[Math.floor(Math.random() * quranPics.length)];
    const time = moment().tz('Asia/Karachi').format('hh:mm A');
    
    const message = `📖 𝐐𝐔𝐑𝐀𝐍 𝐀𝐘𝐀𝐓\n\n${randomAyat.arabic}\n\n𝐔𝐫𝐝𝐮 𝐓𝐫𝐚𝐧𝐬𝐥𝐚𝐭𝐢𝐨𝐧:\n${randomAyat.urdu}\n\n📍 ${randomAyat.surah}\n\n🕌 ${config.BOTNAME} | ${time} PKT`;
    
    const cacheDir = path.join(__dirname, 'rdx/commands/cache');
    fs.ensureDirSync(cacheDir);
    const imgPath = path.join(cacheDir, `quran_${Date.now()}.jpg`);
    
    const downloaded = await downloadImage(randomPic, imgPath);
    
    // ⚠️ BROADCAST LOOP: 30 Seconds Delay Per Group
    for (const thread of approvedThreads) {
      try {
        if (downloaded && fs.existsSync(imgPath)) {
          // Hum direct patchApi wale function ko call kar rahe hain lekin internal cooldown logic usay rokega nahi
          // kyunki humne "EXCEPTION" lagayi hai msg.includes("QURAN") par
          await api.sendMessage({ body: message, attachment: fs.createReadStream(imgPath) }, thread.id);
        } else {
          await api.sendMessage(message, thread.id);
        }
        
        // 30 Seconds Gap for Broadcast to be extra safe
        await new Promise(r => setTimeout(r, 30000));
        
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
      try {
        if (downloaded && fs.existsSync(imgPath)) {
          await api.sendMessage({ body: message, attachment: fs.createReadStream(imgPath) }, thread.id);
        } else {
          await api.sendMessage(message, thread.id);
        }
        
        // 30 Seconds Gap
        await new Promise(r => setTimeout(r, 30000));

      } catch (e) {}
    }
    
    try { fs.unlinkSync(imgPath); } catch {}
    logs.success('NAMAZ_ALERT', `Finished ${namazName} alert.`);
  } catch (error) {
    logs.error('NAMAZ_ALERT', error.message);
  }
}

// 🛡️ SECURE SCHEDULER
function setupSchedulers() {
  // Quran: Sirf 9:00 AM aur 9:00 PM (Spam Free)
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
  
  logs.success('SCHEDULER', 'Secured Schedulers Started');
}

// ============================================================
// 🚀 MAIN START FUNCTION
// ============================================================

async function startBot() {
  logs.banner();
  loadConfig();
  loadIslamicMessages();
  
  let appstate;
  try {
    appstate = fs.readJsonSync(appstatePath);
  } catch (error) {
    logs.error('APPSTATE', 'Failed to load appstate.json');
    return;
  }
  
  logs.info('BOT', 'Initializing Fortress Security System...');
  
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
    
    // ✅ APPLY HEAVY SECURITY PATCH
    global.api = patchApi(api);
    global.startTime = Date.now();
    
    logs.success('LOGIN', 'Login Success! Security Mode: HEAVY');
    
    const Users = new UsersController(api);
    const Threads = new ThreadsController(api);
    const Currencies = new CurrenciesController(api);
    
    global.Users = Users;
    global.Threads = Threads;
    global.Currencies = Currencies;
    
    // ✅ CRITICAL MEMORY FIX (For ThreadBan)
    global.data = {
      threadBanned: new Map(),
      userBanned: new Map(),
      allThreadID: [],
      allUserID: [],
      online: []
    };
    
    await loadCommands(client, commandsPath);
    await loadEvents(client, eventsPath);
    
    global.client = client;
    
    setupSchedulers();
    
    const listener = listen({
      api,
      client,
      Users,
      Threads,
      Currencies,
      config
    });
    
    api.listenMqtt(listener);
    
    // Stats Logging
    const uniqueCommands = new Set();
    client.commands.forEach((cmd) => {
      if (cmd.config && cmd.config.name) uniqueCommands.add(cmd.config.name.toLowerCase());
    });
    
    logs.success('BOT', `${config.BOTNAME} is Online & Protected.`);
    logs.info('SECURITY', 'Rate Limit: 1 Command / Min');
    logs.info('SECURITY', 'Response Delay: 5-10 Seconds');
    
    // Notify Admin
    const adminID = config.ADMINBOT[0];
    if (adminID) {
      try {
        await api.sendMessage(`${config.BOTNAME} is Online!\n🔒 Security Level: Fortress\n🛡️ Rate Limit: Active`, adminID);
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

// Auto Start
if (require.main === module) {
  startBot();
  }
                                           
