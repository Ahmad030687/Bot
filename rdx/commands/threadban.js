module.exports.config = {
	name: "thread",
	version: "4.0.0",
	hasPermssion: 2, // Sirf Admin
	credits: "Ahmad Ali",
	description: "Instant Hard Ban System",
	commandCategory: "system",
	usages: "ban [ID] | unban [ID]",
	cooldowns: 0
};

// Start hote hi memory check karo
module.exports.onLoad = function () {
    if (!global.data.threadBanned) {
        global.data.threadBanned = new Map();
    }
};

module.exports.run = async ({ event, api, args, Threads }) => {
	const { threadID, messageID } = event;
	const type = args[0];
	const targetID = args[1] || threadID;

	if (!type) return api.sendMessage("⚠️ Use: #thread ban or #thread unban", threadID, messageID);

	// ID ko Hamesha String bana kar handle karo (Bug Fix)
	const safeID = String(targetID);

	try {
		if (type === "ban") {
			// 1. DATABASE UPDATE (Permanent)
			let data = (await Threads.getData(safeID)).data || {};
			data.banned = 1;
			await Threads.setData(safeID, { data });

			// 2. MEMORY UPDATE (Instant Silence)
			global.data.threadBanned.set(safeID, 1);

			return api.sendMessage(`🚫 **Group HARD BANNED!**\n━━━━━━━━━━━━━━━━\n🆔 ID: ${safeID}\n🔒 Status: Locked Forever\n\nAb Bot yahan 'Typing' bhi nahi karega aur na Reply dega.`, threadID, messageID);
		}

		if (type === "unban") {
			// 1. DATABASE UPDATE
			let data = (await Threads.getData(safeID)).data || {};
			data.banned = 0;
			await Threads.setData(safeID, { data });

			// 2. MEMORY UPDATE
			global.data.threadBanned.delete(safeID);

			return api.sendMessage(`✅ **Group Unbanned!**\n━━━━━━━━━━━━━━━━\n🆔 ID: ${safeID}\n🔓 Status: Active\n\nBot is back online here.`, threadID, messageID);
		}
	} catch (e) {
		return api.sendMessage(`❌ Error: ${e.message}`, threadID);
	}
};
