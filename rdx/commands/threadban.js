module.exports.config = {
  name: "thread",
  version: "2.5.0",
  hasPermssion: 2, // Sirf SARDAR RDX Admin ke liye
  credits: "Ahmad Ali",
  description: "Group ko Sleep ya Active mode mein dalein",
  commandCategory: "admin",
  usages: "ban/unban",
  cooldowns: 2
};

module.exports.run = async function ({ api, event, args, Threads }) {
  const { threadID, messageID } = event;
  const action = args[0]?.toLowerCase();

  if (action === "ban") {
    // Database mein update
    await Threads.setData(threadID, { banned: 1 });
    // Runtime cache mein update taake foran asar ho
    global.data.threadBanned.set(String(threadID), 1);

    return api.sendMessage({
      body: `╔══════════════════════════╗\n` +
            `║       🛡️ 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 🛡️       ║\n` +
            `╠══════════════════════════╣\n` +
            `║ 𝐒𝐓𝐀𝐓𝐔𝐒: 𝐁𝐀𝐍 𝐌𝐎𝐃𝐄     ║\n` +
            `║ 𝐆𝐑𝐎𝐔𝐏: 𝐁𝐀𝐍𝐍𝐄𝐃           ║\n` +
            `╠══════════════════════════╣\n` +
            `║ Bot is now in sleep mode.    ║\n` +
            `║ It will ignore everyone      ║\n` +
            `║ except the Admin (RDX).      ║\n` +
            `╚══════════════════════════╝`
    }, threadID, messageID);
  } 
  
  else if (action === "unban") {
    await Threads.setData(threadID, { banned: 0 });
    global.data.threadBanned.delete(String(threadID));

    return api.sendMessage({
      body: `╔══════════════════════════╗\n` +
            `║       🛡️ 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 🛡️       ║\n` +
            `╠══════════════════════════╣\n` +
            `║ 𝐒𝐓𝐀𝐓𝐔𝐒: ⚡ 𝐀𝐂𝐓𝐈𝐕𝐄 𝐌𝐎𝐃𝐄       ║\n` +
            `║ 𝐆𝐑𝐎𝐔𝐏: 𝐔𝐍𝐁𝐀𝐍𝐍𝐄𝐃         ║\n` +
            `╠══════════════════════════╣\n` +
            `║ Bot is back online! Now all  ║\n` +
            `║ members can use commands.    ║\n` +
            `╚══════════════════════════╝`
    }, threadID, messageID);
  } 
  
  else {
    return api.sendMessage("❌ Sahi tarika: #thread ban ya unban", threadID, messageID);
  }
};
