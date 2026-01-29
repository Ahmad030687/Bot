module.exports.config = {
  name: "thread",
  version: "1.1.0",
  hasPermssion: 1,
  credits: "Ahmad Ali",
  description: "Thread ban/unban with reaction (fixed)",
  commandCategory: "Admin",
  usages: "thread ban | thread unban",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, senderID } = event;

  if (!global.data) global.data = {};
  if (!global.data.threadBanned) global.data.threadBanned = new Map();
  if (!global.client) global.client = {};
  if (!global.client.handleReaction) global.client.handleReaction = [];

  const action = args[0]?.toLowerCase();

  if (!["ban", "unban"].includes(action)) {
    return api.sendMessage(
      "📌 Usage:\nthread ban\nthread unban",
      threadID
    );
  }

  const msg = await api.sendMessage(
    action === "ban"
      ? "⚠️ **Thread Ban Confirmation**\nReact 👍 to CONFIRM ban\nReact 👎 to CANCEL"
      : "♻️ **Thread Unban Confirmation**\nReact 👍 to CONFIRM unban\nReact 👎 to CANCEL",
    threadID
  );

  global.client.handleReaction.push({
    name: "thread",
    messageID: msg.messageID,
    author: senderID,
    action,
    threadID
  });
};

module.exports.handleReaction = async function ({ api, event, handleReaction }) {
  const { userID, reaction, threadID } = event;
  const { author, action, messageID } = handleReaction;

  if (userID !== author) return;

  // delete confirmation message
  api.unsendMessage(messageID);

  if (reaction === "👍") {
    if (action === "ban") {
      global.data.threadBanned.set(threadID.toString(), true);
      return api.sendMessage("🔒 **Thread BANNED successfully**", threadID);
    }

    if (action === "unban") {
      global.data.threadBanned.delete(threadID.toString());
      return api.sendMessage("🔓 **Thread UNBANNED successfully**", threadID);
    }
  } else {
    return api.sendMessage("❌ Action cancelled.", threadID);
  }
};
