const ws3fca = require('./Data/rdx-fca');
const fs = require('fs-extra');
const path = require('path');
const cron = require('node-cron');
const moment = require('moment-timezone');
const axios = require('axios');

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

// [SAFETY VARIABLES - ADDED TO YOUR ORIGINAL CODE]
const threadCooldowns = new Map();
let globalMessageCount = 0;        
let isEmergencyMode = false;       

// Reset count every minute
setInterval(() => {
  if (globalMessageCount > 0) logs.info('SAFETY', `Resetting Message Count (Last min: ${globalMessageCount})`);
  globalMessageCount = 0;
}, 60000);

// [SLEEP SYSTEM] 02:00 AM to 07:00 AM
function isSleepTime() {
  const hour = moment().tz('Asia/Karachi').hour();
  if (hour >= 2 && hour < 7) return true;
  return false;
}

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
  { arabic: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ", urdu: "بے شک اللہ صبر کرنے والوں کے ساتھ ہے", surah: "Surah Al-Baqarah: 153" }
];

function loadConfig() {
  try {
    config = fs.readJsonSync(configPath);
    global.config = config;
  } catch (error) {
    logs.error('CONFIG', 'Failed to load config:', error.message);
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
    const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 });
    fs.writeFileSync(filePath, Buffer.from(response.data));
    return true;
  } catch {
    return false;
  }
}

async function sendQuranAyat() {
  if (!api || !config.AUTO_ISLAMIC_POST) return;
  // [MODIFIED] Sleep Check
  if (isSleepTime()) { logs.info('SLEEP', 'Skipping Quran Post (Sleeping)'); return; }

  try {
    const threads = require('./Data/system/database/models/threads').getAll();
    const approvedThreads = threads.filter(t => t.approved === 1 && t.banned !== 1);
    
    if (approvedThreads.length === 0) return;
    
    const randomAyat = quranAyats[Math.floor(Math.random() * quranAyats.length)];
    const randomPic = quranPics[Math.floor(Math.random() * quranPics.length)];
    const time = moment().tz('Asia/Karachi').format('hh:mm A');
    
    const message = `📖 𝐐𝐔𝐑𝐀𝐍 𝐀𝐘𝐀𝐓\n\n${randomAyat.arabic}\n\n𝐔𝐫𝐝𝐮 𝐓𝐫𝐚𝐧𝐬𝐥𝐚𝐭𝐢𝐨𝐧:\n${randomAyat.urdu}\n\n📍 ${randomAyat.surah}\n\n🕌 ${config.BOTNAME} | ${time} PKT`.trim();
    
    const cacheDir = path.join(__dirname, 'rdx/commands/cache');
    fs.ensureDirSync(cacheDir);
    const imgPath = path.join(cacheDir, `quran_${Date.now()}.jpg`);
    
    const downloaded = await downloadImage(randomPic, imgPath);
    
    for (const thread of approvedThreads) {
      if (isEmergencyMode) break; // [SAFETY]
      try {
        if (downloaded && fs.existsSync(imgPath)) {
          await api.sendMessage({ body: message, attachment: fs.createReadStream(imgPath) }, thread.id);
        } else { await api.sendMessage(message, thread.id); }
        
        // [SAFETY] Random Broadcast Delay
        globalMessageCount++;
        await new Promise(r => setTimeout(r, Math.floor(Math.random() * 30000) + 15000));
      } catch (e) { logs.error('QURAN_POST', `Failed to send to ${thread.id}:`, e.message); }
    }
    
    try { fs.unlinkSync(imgPath); } catch {}
  } catch (error) { logs.error('QURAN_POST', error.message); }
}

async function sendNamazAlert(namazName) {
  if (!api) return;
  
  try {
    const threads = require('./Data/system/database/models/threads').getAll();
    const approvedThreads = threads.filter(t => t.approved === 1 && t.banned !== 1);
    
    if (approvedThreads.length === 0) return;
    
    const randomPic = namazPics[Math.floor(Math.random() * namazPics.length)];
    const time = moment().tz('Asia/Karachi').format('hh:mm A');
    
    const message = `🕌 𝐍𝐀𝐌𝐀𝐙 𝐀𝐋𝐄𝐑𝐓\n\n⏰ ${namazName.toUpperCase()} کا وقت ہو گیا!\n\n📍 نماز پڑھیں - جنت کی چابی\n\n🕌 ${config.BOTNAME} | ${time} PKT`.trim();
    
    const cacheDir = path.join(__dirname, 'rdx/commands/cache');
    fs.ensureDirSync(cacheDir);
    const imgPath = path.join(cacheDir, `namaz_${Date.now()}.jpg`);
    const downloaded = await downloadImage(randomPic, imgPath);
    
    for (const thread of approvedThreads) {
      if (isEmergencyMode) break; // [SAFETY]
      try {
        if (downloaded && fs.existsSync(imgPath)) {
          await api.sendMessage({ body: message, attachment: fs.createReadStream(imgPath) }, thread.id);
        } else { await api.sendMessage(message, thread.id); }
        
        // [SAFETY] Random Broadcast Delay
        globalMessageCount++;
        await new Promise(r => setTimeout(r, Math.floor(Math.random() * 30000) + 15000));
      } catch (e) { logs.error('NAMAZ_ALERT', `Failed to send to ${thread.id}:`, e.message); }
    }
    try { fs.unlinkSync(imgPath); } catch {}
  } catch (error) { logs.error('NAMAZ_ALERT', error.message); }
}

function setupSchedulers() {
  // [SAFETY] Helper for random start delay
  const runDelay = (task, cb) => setTimeout(cb, Math.floor(Math.random() * 600000) + 60000);
  
  cron.schedule('0 * * * *', () => runDelay('Quran', sendQuranAyat), { timezone: 'Asia/Karachi' });
  cron.schedule('43 5 * * *', () => runDelay('Fajr', () => sendNamazAlert('Fajr')), { timezone: 'Asia/Karachi' });
  cron.schedule('23 12 * * *', () => runDelay('Dhuhr', () => sendNamazAlert('Dhuhr')), { timezone: 'Asia/Karachi' });
  cron.schedule('7 16 * * *', () => runDelay('Asr', () => sendNamazAlert('Asr')), { timezone: 'Asia/Karachi' });
  cron.schedule('43 17 * * *', () => runDelay('Maghrib', () => sendNamazAlert('Maghrib')), { timezone: 'Asia/Karachi' });
  cron.schedule('4 19 * * *', () => runDelay('Isha', () => sendNamazAlert('Isha')), { timezone: 'Asia/Karachi' });
  
  logs.success('SCHEDULER', 'Humanized Schedulers Active');
}

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
  
  logs.info('BOT', 'Starting SARDAR RDX...');
  logs.info('BOT', `Timezone: ${config.TIMEZONE}`);
  logs.info('BOT', `Prefix: ${config.PREFIX}`);
  
  ws3fca.login(appstate, {
    listenEvents: true,
    selfListen: false,
    autoMarkRead: true,
    autoMarkDelivery: false,
    forceLogin: true,
    // [SAFETY] Fake User Agent ADDED
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  }, async (err, loginApi) => {
    if (err) {
      logs.error('LOGIN', 'Failed to login:', err.message || err);
      return;
    }
    
    api = loginApi;
    global.api = api;
    global.startTime = Date.now();
    
    logs.success('LOGIN', 'Successfully logged in!');
    
    const Users = new UsersController(api);
    const Threads = new ThreadsController(api);
    const Currencies = new CurrenciesController(api);
    
    global.Users = Users;
    global.Threads = Threads;
    global.Currencies = Currencies;
    
    // [COMMANDS LOADING - SAME AS ORIGINAL]
    await loadCommands(client, commandsPath);
    await loadEvents(client, eventsPath);
    
    global.client = client;
    
    setupSchedulers();
    
    // [SAFETY] Traffic Controller Logic Wraps the Original Listener
    const originalListener = listen({ api, client, Users, Threads, Currencies, config });
    
    const safeListener = (err, event) => {
      if (!event) return;

      // 1. SLEEP MODE CHECK
      if (isSleepTime()) return;

      // 2. EMERGENCY BRAKE
      if (globalMessageCount > 15 && !isEmergencyMode) {
        isEmergencyMode = true;
        logs.warn('🚨 EMERGENCY', 'High Traffic! Cooling down for 2 mins...');
        setTimeout(() => { isEmergencyMode = false; globalMessageCount = 0; }, 120000);
        return;
      }
      if (isEmergencyMode) return;

      // 3. ANTI-SPAM (Group Level)
      if (event.threadID && event.senderID !== api.getCurrentUserID()) {
        const lastTime = threadCooldowns.get(event.threadID) || 0;
        const now = Date.now();
        if (now - lastTime < 5000) return; // 5 Sec Delay
        
        threadCooldowns.set(event.threadID, now);
        globalMessageCount++;
      }

      // Call Original Listener (Commands yahan se load hongi)
      return originalListener(err, event);
    };
    
    api.listenMqtt(safeListener);
    
    // Startup Message Logic
    const uniqueCommands = new Set();
    client.commands.forEach((cmd, key) => {
      if (cmd.config && cmd.config.name) {
        uniqueCommands.add(cmd.config.name.toLowerCase());
      }
    });
    const actualCommandCount = uniqueCommands.size;
    const actualEventCount = client.events.size;
    
    logs.success('BOT', `${config.BOTNAME} is now online (God Mode Active)!`);
    logs.info('BOT', `Commands loaded: ${actualCommandCount}`);
    
    const adminID = config.ADMINBOT[0];
    if (adminID) {
      try {
        await api.sendMessage(`${config.BOTNAME} is now online!\nCommands: ${actualCommandCount}\nMode: Safe Humanized`, adminID);
      } catch (e) {}
    }
  });
}

process.on('unhandledRejection', (reason, promise) => {
  logs.warn('UNHANDLED', 'Unhandled Promise Rejection:', reason?.message || reason);
});

process.on('uncaughtException', (error) => {
  logs.error('EXCEPTION', 'Uncaught Exception:', error.message);
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
