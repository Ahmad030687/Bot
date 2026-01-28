module.exports.config = {
	name: "thread",
	version: "1.0.0",
	hasPermssion: 2,
	credits: "Ahmad Ali",
	description: "Ban or unblock a group (Fixed)",
	commandCategory: "system",
	usages: "[unban/ban/search] [ID or text]",
	cooldowns: 5
};

module.exports.handleReaction = async ({ event, api, Threads, handleReaction }) => {
	if (parseInt(event.userID) !== parseInt(handleReaction.author)) return;
	
	// ✅ FIXED: ID ko String rakhein, Number nahi banayein
	const targetID = String(handleReaction.target);

	switch (handleReaction.type) {
		case "ban": {
			const data = (await Threads.getData(targetID)).data || {};
			data.banned = 1;
			await Threads.setData(targetID, { data });
			
			// Global Cache Update (String Key)
			global.data.threadBanned.set(targetID, 1);
			
			api.sendMessage(`🚫 [${targetID}] Group Banned Successfully!`, event.threadID, () => api.unsendMessage(handleReaction.messageID));
			break;
		}
		case "unban": {
			const data = (await Threads.getData(targetID)).data || {};
			data.banned = 0;
			await Threads.setData(targetID, { data });
			
			// Global Cache Update
			global.data.threadBanned.delete(targetID);
			
			api.sendMessage(`✅ [${targetID}] Group Unbanned Successfully!`, event.threadID, () => api.unsendMessage(handleReaction.messageID));
			break;
		}
		default:
			break;
	}
};

module.exports.run = async ({ event, api, args, Threads }) => {
    // Arguments handling logic kept same but optimized
    let content = args.slice(1, args.length);
	
	switch (args[0]) {
		case "ban": {
			if (content.length == 0) return api.sendMessage("⚠️ Thread ID likhein jise ban karna hai!", event.threadID);
			for (let idThread of content) {
				// ✅ FIXED: String conversion only
				idThread = String(idThread);
				
				let dataThread = (await Threads.getData(idThread)).data || {};
				
				if (dataThread.banned) return api.sendMessage(`⚠️ [${idThread}] Ye group pehle se banned hai.`, event.threadID);
				
				return api.sendMessage(`🚫 [${idThread}] Kya aap is group ko Ban karna chahte hain?\n\nReaction dein to confirm.`, event.threadID, (error, info) => {
					global.client.handleReaction.push({
						name: this.config.name,
						messageID: info.messageID,
						author: event.senderID,
						type: "ban",
						target: idThread
					});
				});
			}
			break;
		}
		case "unban": {
			if (content.length == 0) return api.sendMessage("⚠️ Thread ID likhein jise unban karna hai!", event.threadID);
			for (let idThread of content) {
				idThread = String(idThread);
				
				let dataThread = (await Threads.getData(idThread)).data || {};
				
				if (!dataThread.banned) return api.sendMessage(`⚠️ [${idThread}] Ye group banned nahi hai.`, event.threadID);
				
				return api.sendMessage(`✅ [${idThread}] Kya aap is group ko Unban karna chahte hain?\n\nReaction dein to confirm.`, event.threadID, (error, info) => {
					global.client.handleReaction.push({
						name: this.config.name,
						messageID: info.messageID,
						author: event.senderID,
						type: "unban",
						target: idThread
					});
				});
			}
			break;
		}
		case "search": {
			let contentJoin = content.join(" ");
			let getThreads = (await Threads.getAll(['threadID', 'name'])).filter(item => !!item.name);
			let matchThreads = [], a = '', b = 0;
			getThreads.forEach(i => {
				if (i.name.toLowerCase().includes(contentJoin.toLowerCase())) {
					matchThreads.push({
						name: i.name,
						id: i.threadID
					});
				}
			});
			matchThreads.forEach(i => a += `\n${b += 1}. ${i.name} - ${i.id}`);
			(matchThreads.length > 0) ? api.sendMessage(`🔍 Search Result:\n${a}`, event.threadID) : api.sendMessage("❌ Koi group nahi mila.", event.threadID);
			break;
		}
		default: {
			return api.sendMessage("⚠️ Use: #thread ban [ID] or #thread unban [ID]", event.threadID);
		}
	}
};
