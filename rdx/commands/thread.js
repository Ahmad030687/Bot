module.exports.config = {
  name: "thread",
  version: "5.0.0",
  hasPermssion: 2, 
  credits: "Ahmad Ali",
  description: "Group ko Sleep/Active mode mein dalein",
  commandCategory: "admin",
  usages: "ban/unban",
  cooldowns: 2
};

module.exports.run = async function ({ api, event, args, Threads }) {
  const { threadID, messageID } = event;
  const action = args[0]?.toLowerCase();

  if (action === "ban") {
    // 1. Pehle message bhejein
    return api.sendMessage({
      body: `╔══════════════════════════╗\n` +
            `║       🛡️ 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 🛡️       ║\n` +
            `╠══════════════════════════╣\n` +
            `║ 𝐒𝐓𝐀𝐓𝐔𝐒: 😴 𝐁𝐀𝐍 𝐌𝐎𝐃𝐄     ║\n` +
            `║ 𝐆𝐑𝐎𝐔𝐏: 𝐁𝐀𝐍𝐍𝐄𝐃           ║\n` +
            `╠══════════════════════════╣\n` +
            `║ Bot ab group mein ban ho gaya ║\n` +
            `║ hai. Sirf Admin ki     ║\n` +
            `║ commands kaam karengi.       ║\n` +
            `╚══════════════════════════╝`
    }, threadID, async () => {
        // 2. Message bhejne ke BAAD database aur cache update karein
        await Threads.setData(threadID, { banned: 1 });
        global.data.threadBanned.set(String(threadID), 1);
    }, messageID);
  } 
  
  else if (action === "unban") {
    // Unban mein pehle status clear karein taake bot message bhej sake
    await Threads.setData(threadID, { banned: 0 });
    global.data.threadBanned.delete(String(threadID));

    return api.sendMessage({
      body: `╔══════════════════════════╗\n` +
            `║       🛡️ 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 🛡️       ║\n` +
            `╠══════════════════════════╣\n` +
            `║ 𝐒𝐓𝐀𝐓𝐔𝐒: ⚡ 𝐔𝐍𝐁𝐀𝐍 𝐌𝐎𝐃𝐄       ║\n` +
            `║ 𝐆𝐑𝐎𝐔𝐏: 𝐔𝐍𝐁𝐀𝐍𝐍𝐄𝐃         ║\n` +
            `╠══════════════════════════╣\n` +
            `║ Bot unban ho gaya hai! Ab sab    ║\n` +
            `║ commands use kar     ║\n` +
            `║ sakte hain.                  ║\n` +
            `╚══════════════════════════╝`
    }, threadID, messageID);
  } 
  
  else {
    return api.sendMessage("❌ AHMAD RDX: Sahi tarika #thread ban ya unban hai.", threadID, messageID);
  }
};
