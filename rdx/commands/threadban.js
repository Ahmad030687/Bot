module.exports.config = {
	name: "thread",
	version: "3.0",
	hasPermssion: 2, // Sirf Admin
	credits: "Ahmad Ali Safdar",
	description: "Ban or Unban a group immediately",
	commandCategory: "system",
	usages: "thread ban / thread unban",
	cooldowns: 0
};

module.exports.run = async ({ api, event, args, Threads }) => {
    const { threadID, messageID } = event;
    
    // Command: .thread ban (Current Group) ya .thread ban 12345 (Specific Group)
    const type = args[0]?.toLowerCase();
    const targetID = args[1] || threadID; // Agar ID nahi di, to jis group mein ho usay ban karo
    const targetIDString = String(targetID);

    if (!type || (type !== "ban" && type !== "unban")) {
        return api.sendMessage("⚠️ **Usage:**\n#thread ban\n#thread unban\n#thread ban [GroupID]", threadID, messageID);
    }

    try {
        if (type === "ban") {
            // 1. Database Update (Permanent storage)
            await Threads.setData(targetID, { banned: 1 });
            
            // 2. MEMORY UPDATE (Immediate Effect - Ye line bot ko foran chup karayegi)
            global.data.threadBanned.set(targetIDString, 1);
            
            return api.sendMessage(`🚫 **BANNED!**\nGroup ID: ${targetID}\n\nAb Bot yahan kisi command ka jawab nahi dega.`, threadID, messageID);
        }

        if (type === "unban") {
            // 1. Database Update
            await Threads.setData(targetID, { banned: 0 });
            
            // 2. MEMORY UPDATE
            if (global.data.threadBanned.has(targetIDString)) {
                global.data.threadBanned.delete(targetIDString);
            }
            
            return api.sendMessage(`✅ **UNBANNED!**\nGroup ID: ${targetID}\n\nBot is now active here.`, threadID, messageID);
        }

    } catch (e) {
        return api.sendMessage(`❌ Error: ${e.message}`, threadID, messageID);
    }
};
