module.exports.config = {
	name: "thread",
	version: "2.0.0",
	hasPermssion: 2, // Sirf Admin/Owner ke liye
	credits: "Ahmad Ali",
	description: "Instant Group Ban/Unban (No Reaction Needed)",
	commandCategory: "system",
	usages: "[ban/unban] [ThreadID]",
	cooldowns: 0
};

module.exports.run = async ({ event, api, args, Threads }) => {
	const { threadID, messageID } = event;
	const type = args[0];
	const targetID = args[1] || threadID; // Agar ID nahi di, to current group ban hoga

	if (!type) {
		return api.sendMessage("⚠️ Use: #thread ban [ID] OR #thread unban [ID]", threadID, messageID);
	}

	// 🛡️ MODE 1: BAN
	if (type === "ban") {
		try {
			// Database Update
			let data = (await Threads.getData(targetID)).data || {};
			data.banned = 1;
			await Threads.setData(targetID, { data });

			// Global Memory Update (Instant Effect)
			// Hum String use kar rahe hain taake long ID match ho jaye
			global.data.threadBanned.set(String(targetID), 1);

			return api.sendMessage(`🚫 **Group Banned Successfully!**\n━━━━━━━━━━━━━━━━━━\n🆔 **ID:** ${targetID}\n🔒 **Status:** Locked\n━━━━━━━━━━━━━━━━━━\nAb bot is group mein reply nahi karega.`, threadID, messageID);
		} catch (e) {
			return api.sendMessage(`❌ Error: ${e.message}`, threadID);
		}
	}

	// 🛡️ MODE 2: UNBAN
	else if (type === "unban") {
		try {
			// Database Update
			let data = (await Threads.getData(targetID)).data || {};
			data.banned = 0;
			await Threads.setData(targetID, { data });

			// Global Memory Update
			global.data.threadBanned.delete(String(targetID));

			return api.sendMessage(`✅ **Group Unbanned!**\n━━━━━━━━━━━━━━━━━━\n🆔 **ID:** ${targetID}\n🔓 **Status:** Active\n━━━━━━━━━━━━━━━━━━`, threadID, messageID);
		} catch (e) {
			return api.sendMessage(`❌ Error: ${e.message}`, threadID);
		}
	}
    
    // 🛡️ MODE 3: CHECK STATUS
    else if (type === "check") {
        const isBanned = global.data.threadBanned.has(String(targetID));
        return api.sendMessage(`ℹ️ **Status:** ${isBanned ? "🚫 Banned" : "✅ Active"}`, threadID);
    }

	else {
		return api.sendMessage("⚠️ Unknown command. Use: ban, unban, check", threadID);
	}
};
