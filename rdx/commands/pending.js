module.exports.config = {
  name: "pending",
  version: "3.0",
  hasPermssion: 2, // Sirf Admin Use Kare
  credits: "Ahmad Ali Safdar",
  description: "Approve new groups (Database Linked)",
  commandCategory: "system",
  usages: "pending",
  cooldowns: 0
};

module.exports.run = async ({ api, event, send, Threads }) => {
    try {
        const { threadID, senderID } = event;

        // 1. Database se saare groups mangwao
        const allThreads = await Threads.getAll();
        
        // 2. Filter karo: Jo Approved NAHI hain aur Banned bhi NAHI hain
        const pendingList = allThreads.filter(t => {
            // Data check (kabhi kabhi data null hota hai)
            if (!t.data) return true; 
            return t.data.approved !== 1 && t.data.banned !== 1;
        });

        if (pendingList.length === 0) {
            return api.sendMessage("✅ Sab All-Right hai! Koi naya group pending nahi hai.", threadID);
        }

        // 3. List banao
        let msg = "📋 **PENDING REQUESTS**\nReply with number to approve:\n══════════════════\n";
        
        pendingList.forEach((t, i) => {
            const name = t.name || "Unknown Group";
            msg += `${i + 1}. ${name}\n🆔 ID: ${t.threadID}\n\n`;
        });

        msg += "══════════════════\nReply with the number (e.g., 1) to activate bot.";

        // 4. Message bhejo aur Reply ka intezar karo
        return api.sendMessage(msg, threadID, (err, info) => {
            global.client.replies.set(info.messageID, {
                commandName: 'pending',
                author: senderID,
                pendingList: pendingList
            });
        });

    } catch (e) {
        return api.sendMessage(`❌ Error: ${e.message}`, event.threadID);
    }
};

module.exports.handleReply = async ({ api, event, handleReply, Threads }) => {
    const { threadID, senderID, body } = event;

    // Security: Sirf wahi reply kare jisne command chalayi thi
    if (senderID !== handleReply.author) return;

    const num = parseInt(body);
    const targetGroup = handleReply.pendingList[num - 1];

    if (!targetGroup) {
        return api.sendMessage("❌ Ghalat number bhai! List dobara check karein.", threadID);
    }

    try {
        // 1. Database Update
        await Threads.setData(targetGroup.threadID, { approved: 1 });
        
        // 2. Admin ko confirmation
        api.sendMessage(`✅ **Success!**\nGroup: ${targetGroup.name || targetGroup.threadID}\nStatus: APPROVED`, threadID);
        
        // 3. Us naye Group mein Welcome Message (Taake unhein pata chale bot on ho gaya)
        api.sendMessage(
            `✅ **BOT ACTIVATED!**\n\nApproved By: Ahmad Ali Safdar\nPrefix: ${global.config.PREFIX}\n\nType ${global.config.PREFIX}help to start.`, 
            targetGroup.threadID
        );

    } catch (e) {
        console.log(e);
        api.sendMessage("❌ Error updating database.", threadID);
    }
};
