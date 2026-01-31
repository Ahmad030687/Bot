module.exports.config = {
	name: "thread",
	version: "3.0",
	hasPermssion: 2,
	credits: "Ahmad Ali",
	description: "Ban/Unban group immediately",
	commandCategory: "system",
	usages: "thread ban / thread unban",
	cooldowns: 0
};

module.exports.run = async ({ api, event, args, Threads }) => {
    const { threadID, messageID } = event;
    const type = args[0]?.toLowerCase();
    
    // Agar ID di hai to wo use karo, warna current group ID
    const targetID = args[1] || threadID;
    const targetStr = String(targetID);

    if (type === "ban") {
        // 1. Database Update
        await Threads.setData(targetID, { banned: 1 });
        
        // 2. MEMORY UPDATE (Immediate Effect)
        global.data.threadBanned.set(targetStr, 1);
        
        return api.sendMessage(
            `🚫 **BANNED!**\nGroup ID: ${targetID}\n\nAb bot yahan reply nahi karega.`, 
            threadID, 
            null, 
            messageID // Reply to user message
        );
    }

    if (type === "unban") {
        // 1. Database Update
        await Threads.setData(targetID, { banned: 0 });
        
        // 2. Memory Update
        if (global.data.threadBanned.has(targetStr)) {
            global.data.threadBanned.delete(targetStr);
        }
        
        return api.sendMessage(
            `✅ **UNBANNED!**\nGroup ID: ${targetID}\n\nBot active ho gaya hai.`, 
            threadID, 
            null, 
            messageID
        );
    }

    return api.sendMessage(
        "⚠️ Usage:\n#thread ban\n#thread unban\n#thread ban [groupID]", 
        threadID, 
        null, 
        messageID
    );
};
