module.exports.config = {
  name: "pending",
  version: "3.0",
  hasPermssion: 2, // Only Admin
  credits: "Ahmad Ali",
  description: "Approve pending groups",
  commandCategory: "system",
  usages: "pending",
  cooldowns: 0
};

module.exports.run = async ({ api, event, Threads }) => {
    try {
        const { threadID, messageID } = event;
        
        // Database se groups lo
        const allThreads = await Threads.getAll();
        
        // Filter: Jo Approved nahi hain aur Banned bhi nahi hain
        const pending = allThreads.filter(t => t.data && t.data.approved !== 1 && t.data.banned !== 1);

        if (pending.length === 0) {
            return api.sendMessage("✅ Koi pending request nahi hai.", threadID, null, messageID);
        }

        let msg = "📋 **PENDING GROUPS LIST**\n\n";
        pending.forEach((t, i) => {
            msg += `${i + 1}. ${t.name || "Unnamed Group"}\n🆔 ID: ${t.threadID}\n\n`;
        });
        msg += "👉 Reply with number to approve.";

        return api.sendMessage(msg, threadID, (err, info) => {
            global.client.replies.set(info.messageID, {
                commandName: 'pending',
                author: event.senderID,
                pendingList: pending
            });
        }, messageID); // Yahan bhi Reply to User logic lagayi hai

    } catch (e) {
        return api.sendMessage("❌ Error: " + e.message, event.threadID);
    }
};

module.exports.handleReply = async ({ api, event, handleReply, Threads }) => {
    const { threadID, messageID, body } = event;
    if (event.senderID !== handleReply.author) return;

    const num = parseInt(body);
    const target = handleReply.pendingList[num - 1];

    if (!target) return api.sendMessage("❌ Ghalat number.", threadID, null, messageID);

    // Approve
    await Threads.setData(target.threadID, { approved: 1 });
    
    api.sendMessage(`✅ Group Approved!\nID: ${target.threadID}`, threadID, null, messageID);
    
    // Send Welcome
    api.sendMessage(
        `✅ **BOT ACTIVATED!**\nApproved by Ahmad Ali.\nPrefix: ${global.config.PREFIX}`, 
        target.threadID
    );
};
