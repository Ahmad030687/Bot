module.exports = {
  config: {
    name: 'lockgroup',
    aliases: ['lock', 'lockgc'],
    description: 'Lock group name and emoji with Savage Roasting',
    usage: 'lockgroup [name/emoji/all] [on/off]',
    category: 'Group',
    groupOnly: true,
    prefix: true
  },

  // --- 🔥 MONITORING SYSTEM (BACKGROUND WATCHER) ---
  async handleEvent({ api, event, Threads }) {
    const { threadID, logMessageType, author, logMessageData } = event;
    const botID = api.getCurrentUserID();

    if (author == botID) return; // Bot khud change kare toh ignore

    const settings = await Threads.getSettings(threadID) || {};

    // 1. NAME LOCK REVERT
    if (logMessageType === "log:thread-name" && settings.lockName) {
      return api.setTitle(settings.originalName, threadID, () => {
        api.sendMessage(`[ ⚠️ NAME LOCK ]\n\nOye saste hero! 🖕 Naam badalne ki jurrat kaise ki? Idhar Sardar RDX ka lock laga hai. Tera system hila dungi! 😏🔥`, threadID);
      });
    }

    // 2. EMOJI LOCK REVERT
    if (logMessageType === "log:thread-icon" && settings.lockEmoji) {
      return api.setThreadEmoji(settings.originalEmoji || "", threadID, () => {
        api.sendMessage(`[ ⚠️ EMOJI LOCK ]\n\nAbe churan farosh! 🖕 Emoji mat badal, software update karwana hai kya? 😏🔥`, threadID);
      });
    }
  },

  async run({ api, event, args, send, Threads, config }) {
    const { threadID, senderID } = event;
    const threadInfo = await api.getThreadInfo(threadID);
    
    // Admin check
    const isBotAdmin = config.ADMINBOT.includes(senderID) || threadInfo.adminIDs.some(a => a.id == senderID);
    if (!isBotAdmin) return send.reply('Oye do takey ke insaan! 🖕 Teri aukat nahi hai lock lagane ki. Pehle admin ban kar aa! 😏🔥');

    let settings = await Threads.getSettings(threadID) || {};
    const target = args[0]?.toLowerCase();
    const action = args[1]?.toLowerCase();
    const enable = action === 'on' || action === 'enable' || action === 'true';

    if (!target || !['name', 'emoji', 'all'].includes(target)) {
      return send.reply(`🔒 LOCK CONTROL\n══════════════\nName: ${settings.lockName ? 'ON' : 'OFF'}\nEmoji: ${settings.lockEmoji ? 'ON' : 'OFF'}\n══════════════\nUsage: lockgroup [name/emoji/all] on/off`);
    }

    // --- LOGIC FOR TARGETS ---
    if (target === 'name' || target === 'all') {
      settings.lockName = enable;
      settings.originalName = threadInfo.threadName;
    }
    
    if (target === 'emoji' || target === 'all') {
      settings.lockEmoji = enable;
      settings.originalEmoji = threadInfo.emoji;
    }

    await Threads.setSettings(threadID, settings);

    return send.reply(`${target.toUpperCase()} Lock: ${enable ? 'ENABLED ✅' : 'DISABLED ❌'}\n\n${enable ? 'Ab kisi hawabaz ne cheda-khani ki toh uska system format kar dungi! 😏🔥' : 'Jao aish karo, khula chorr diya maidan. 😂'}`);
  }
};
