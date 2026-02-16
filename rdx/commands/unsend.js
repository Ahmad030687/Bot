module.exports = {
  config: {
    name: 'unsend',
    aliases: ['uns', 'del'],
    description: 'Unsend bot message (Admins only)',
    credits: 'SARDAR RDX',
    usage: 'unsend (reply to bot message)',
    category: 'Admin',
    adminOnly: false, // Isay false rakhein taake hum manual check kar saken
    prefix: true
  },
  
  async run({ api, event, send }) {
    const { messageReply, threadID, senderID } = event;
    
    // 1. Check ke reply kiya hai ya nahi
    if (!messageReply) {
      return send.reply('⚠️ Ahmad bhai, bot ke message pe reply to karein!');
    }
    
    const botID = api.getCurrentUserID();
    
    // 2. Check ke message bot ka hai ya nahi
    if (messageReply.senderID !== botID) {
      return send.reply('❌ Main sirf apne hi messages unsend kar sakta hoon.');
    }

    try {
      // 3. Thread info nikalna admins check karne ke liye
      const threadInfo = await api.getThreadInfo(threadID);
      const { adminIDs } = threadInfo;
      
      // 4. Bot Admins ki List (Apni ID yahan likhein)
      const botAdmins = ["61577631137537", "ID_YAHAN_DALAIN"]; // Apni Facebook ID yahan dalein
      
      const isGroupAdmin = adminIDs.some(admin => admin.id === senderID);
      const isBotAdmin = botAdmins.includes(senderID);

      // 5. Final Permission Check
      if (!isGroupAdmin && !isBotAdmin) {
        return send.reply('🚫 Maafi ustad! Ye command sirf Group Admins ya AHMAD RDX Admin use kar sakta hai.');
      }

      // 6. Unsend Action
      await api.unsendMessage(messageReply.messageID);
      
    } catch (error) {
      console.error(error);
      return send.reply('❌ Error: Message unsend nahi ho saka.');
    }
  }
};
