module.exports.config = {
  name: "thread",
  version: "1.0.0",
  hasPermssion: 1, // admin only
  credits: "Ahmad Ali",
  description: "Ban / Unban thread with reaction confirmation",
  commandCategory: "Admin",
  usages: "thread ban | thread unban",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;

  if (!global.data) global.data = {};
  if (!global.data.threadBanned) global.data.threadBanned = new Map();

  const action = args[0]?.toLowerCase();

  if (!["ban", "unban"].includes(action)) {
    return api.sendMessage(
      "📌 Usage:\n• thread ban\n• thread unban",
      threadID,
      messageID
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

module.exports.handleReaction = async function ({
  api,
  event,
  handleReaction
}) {
  const { userID, reaction, threadID } = event;
  const { author, action } = handleReaction;

  if (userID !== author) return;

  if (reaction === "👍") {
    if (action === "ban") {
      global.data.threadBanned.set(threadID.toString(), true);
      return api.sendMessage(
        "🔒 **Thread BANNED successfully**\nBot will stay silent here.",
        threadID
      );
    }

    if (action === "unban") {
      global.data.threadBanned.delete(threadID.toString());
      return api.sendMessage(
        "🔓 **Thread UNBANNED successfully**\nBot is active again.",
        threadID
      );
    }
  } else {
    return api.sendMessage("❌ Action cancelled.", threadID);
  }
};
