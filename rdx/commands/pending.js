module.exports = {
  config: {
    name: 'pending',
    aliases: ['pendinglist', 'pendingreq'],
    description: 'Facebook pending requests se groups approve karein',
    credits: 'Ahmad Ali',
    usage: 'pending',
    category: 'Utility',
    adminOnly: true,
    prefix: true
  },

  async run({ api, event, send, client, Threads }) {
    const { threadID, senderID } = event;

    try {
      // 1. LIVE FETCH FROM FACEBOOK (Database par depend nahi)
      const spam = await api.getThreadList(100, null, ['OTHER']);
      const pending = await api.getThreadList(100, null, ['PENDING']);
      
      const combinedList = [...spam, ...pending].filter(t => t.isGroup && t.isSubscribed);

      if (combinedList.length === 0) {
        return send.reply('✅ Inbox mein koi pending group request nahi hai!');
      }

      let msg = `📋 PENDING REQUESTS (${combinedList.length})\n`;
      msg += `═══════════════════════\n\n`;

      const pendingList = [];

      combinedList.forEach((t, i) => {
        pendingList.push({
          index: i + 1,
          id: t.threadID,
          name: t.name || 'Unknown Group'
        });
        if (i < 20) {
          msg += `${i + 1}. ${t.name || 'Unknown'}\n🆔 ID: ${t.threadID}\n\n`;
        }
      });

      msg += `═══════════════════════\n`;
      msg += `📌 Reply with number to APPROVE\n`;
      msg += `📌 Reply "all" for all groups`;

      const info = await send.reply(msg);

      // Reply handle karne ke liye data save karein
      if (global.client.handleReply) {
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: senderID,
          pendingList
        });
      }

    } catch (e) {
      return send.reply(`❌ Error fetching: ${e.message}`);
    }
  },

  async handleReply({ api, event, send, handleReply, Threads }) {
    const { body, senderID } = event;
    const { pendingList, author } = handleReply;

    if (senderID !== author) return;

    const input = body.trim().toLowerCase();
    let toApprove = [];

    if (input === 'all') {
      toApprove = pendingList;
    } else {
      const nums = input.split(',').map(n => parseInt(n.trim()));
      nums.forEach(n => {
        const item = pendingList.find(p => p.index === n);
        if (item) toApprove.push(item);
      });
    }

    if (toApprove.length === 0) return send.reply('❌ Sahi number choose karein.');

    await send.reply(`⏳ ${toApprove.length} groups ko approve kiya ja raha hai...`);

    let count = 0;
    for (const group of toApprove) {
      try {
        // 1. Facebook par approve karein
        await api.addUserToGroup(api.getCurrentUserID(), group.id);
        
        // 2. Database mein active karein
        await Threads.setData(group.id, { threadID: group.id, approved: 1, banned: 0 });
        
        await api.sendMessage(`✅ Group Approved by Ahmad Ali Safdar.\nPrefix: ${global.config.PREFIX}`, group.id);
        count++;
        // Speed protection delay
        await new Promise(r => setTimeout(r, 1000)); 
      } catch (e) {
        console.log(`Failed to approve ${group.id}:`, e);
      }
    }

    return send.reply(`✅ Success! ${count} groups approve ho gaye aur bot wahan active ho gaya.`);
  }
};
