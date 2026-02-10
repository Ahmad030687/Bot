const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "gclock",
    version: "3.0.0", // Network Fix Version
    hasPermssion: 1, // Admin Only
    credits: "Ahmad RDX",
    description: "Anti-Change Name & Emoji (Crash Proof)",
    commandCategory: "system",
    usages: "[on/off]",
    cooldowns: 5
};

const dbPath = path.join(__dirname, "cache", "guard_settings.json");

function loadSettings() {
    if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));
    return JSON.parse(fs.readFileSync(dbPath));
}

function saveSettings(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 4));
}

module.exports.run = async function ({ api, event, args }) {
    const { threadID } = event;
    const settings = loadSettings();
    const cmd = args[0] ? args[0].toLowerCase() : "";

    if (cmd === "on") {
        try {
            const threadInfo = await api.getThreadInfo(threadID);
            settings[threadID] = {
                status: true,
                originalName: threadInfo.threadName,
                originalEmoji: threadInfo.emoji,
                originalColor: threadInfo.color
            };
            saveSettings(settings);
            return api.sendMessage(`🛡️ **Guard Active!**\nName: ${threadInfo.threadName}\nEmoji: ${threadInfo.emoji}`, threadID);
        } catch (e) {
            return api.sendMessage("❌ Error: Mai group info nahi le pa raha.", threadID);
        }
    } 
    else if (cmd === "off") {
        if (settings[threadID]) {
            settings[threadID].status = false;
            saveSettings(settings);
        }
        return api.sendMessage("😴 **Guard OFF!**", threadID);
    }
    else {
        return api.sendMessage("Use: `#guard on`", threadID);
    }
};

module.exports.handleEvent = async function ({ api, event }) {
    if (!event.logMessageType) return;

    const { threadID, logMessageType, logMessageData } = event;
    const settings = loadSettings();

    if (!settings[threadID] || !settings[threadID].status) return;

    // --- NAME REVERT ---
    if (logMessageType === "log:thread-name") {
        const newName = logMessageData.name;
        const oldName = settings[threadID].originalName;

        if (newName !== oldName) {
            console.log(`[GUARD] Changing Name back to: ${oldName}`);
            
            // Yahan hum promise use karenge taake error catch ho sake
            api.setTitle(oldName, threadID, (err) => {
                if (err) {
                    console.log("[GUARD ERROR] Failed to change name (Network/Permission Issue)");
                    // Agar fail ho jaye to user ko bata do
                    api.sendMessage("⚠️ Group Name change detect hua, lekin network error ki wajah se wapis nahi kar saka.", threadID);
                } else {
                    api.sendMessage(`⚠️ **Allowed nahi hai!** Name wapis "${oldName}" kar diya gaya hai.`, threadID);
                }
            });
        }
    }

    // --- EMOJI REVERT ---
    if (logMessageType === "log:thread-icon") {
        const newEmoji = logMessageData.thread_icon;
        const oldEmoji = settings[threadID].originalEmoji;

        if (newEmoji !== oldEmoji) {
            console.log(`[GUARD] Changing Emoji back to: ${oldEmoji}`);
            
            api.changeThreadEmoji(oldEmoji, threadID, (err) => {
                if (!err) {
                    api.sendMessage(`⚠️ **Emoji Change Mana Hai!**`, threadID);
                }
            });
        }
    }
};
