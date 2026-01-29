module.exports.config = {
	name: "thread",
	version: "2.1.0",
	hasPermssion: 2, // Sirf Admin ke liye
	credits: "Ahmad Ali",
	description: "Instant Group Ban/Unban (Fixed)",
	commandCategory: "system",
	usages: "ban [ID], unban [ID]",
	cooldowns: 0
};

// 🛡️ LOAD FIX: Agar Main file mein memory na bani ho, to yahan bana lo
module.exports.onLoad = function () {
    if (!global.data.threadBanned) {
        global.data.threadBanned = new Map();
    }
};

module.exports.run = async ({ event, api, args, Threads }) => {
	const { threadID, messageID } = event;
	const type = args[0];
	const targetID = args[1] || threadID; // ID di to wo, warna current group

	if (!type) {
		return api.sendMessage("⚠️ Use: #thread ban [ID] OR #thread unban [ID]", threadID, messageID);
	}

	try {
		// ==========================
		// 🚫 BAN COMMAND
		// ==========================
		if (type === "ban") {
			let data = (await Threads.getData(targetID)).data || {};
			data.banned = 1;
			await Threads.setData(targetID, { data });

			// String use karein taake lambi ID kharab na ho
			global.data.threadBanned.set(String(targetID), 1);

			return api.sendMessage(`🚫 **Group Banned Successfully!**\n━━━━━━━━━━━━━━━━━━\n🆔 **ID:** ${targetID}\n🔒 **Status:** Locked\n━━━━━━━━━━━━━━━━━━`, threadID, messageID);
		}

		// ==========================
		// ✅ UNBAN COMMAND
		// ==========================
		else if (type === "unban") {
			let data = (await Threads.getData(targetID)).data || {};
			data.banned = 0;
			await Threads.setData(targetID, { data });

			global.data.threadBanned.delete(String(targetID));

			return api.sendMessage(`✅ **Group Unbanned!**\n━━━━━━━━━━━━━━━━━━\n🆔 **ID:** ${targetID}\n🔓 **Status:** Unlocked\n━━━━━━━━━━━━━━━━━━`, threadID, messageID);
		}

		else {
			return api.sendMessage("⚠️ Unknown Option. Use: ban or unban", threadID);
		}

	} catch (e) {
		return api.sendMessage(`❌ Error: ${e.message}`, threadID);
	}
};
