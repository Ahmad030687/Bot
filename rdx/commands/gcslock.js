const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "gclock",
    version: "4.0.0", // Debug Version
    hasPermssion: 0, // Sab ke liye on rakha hai testing ke liye
    credits: "Ahmad RDX",
    description: "Guard with Live Debugging",
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
            return api.sendMessage(`🛡️ **GUARD ACTIVE!**\n💾 Saved Name: "${threadInfo.threadName}"\n💾 Saved Emoji: "${threadInfo.emoji}"\nAb agar change hua to main cheekh kar bataunga!`, threadID);
        } catch (e) {
            return api.sendMessage(`❌ Error saving info: ${e.message}`, threadID);
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
        return api.sendMessage("Likhein: `#guard on`", threadID);
    }
};

module.exports.handleEvent = async function ({ api, event }) {
    // 1. Sirf Log messages check karo (Name/Emoji change events)
    if (!event.logMessageType) return;

    const { threadID, logMessageType, logMessageData } = event;
    const settings = loadSettings();

    // 2. Check karo Guard ON hai ya nahi
    if (!settings[threadID] || !settings[threadID].status) return;

    // --- CASE 1: NAME CHANGE ---
    if (logMessageType === "log:thread-name") {
        console.log(`[DEBUG] Name change event detected in ${threadID}`);
        
        const newName = logMessageData.name;
        const oldName = settings[threadID].originalName;

        // Group mein batao ke event pakra gaya
        // api.sendMessage(`🕵️ **Detect:** Name change hua hai!\nNew: ${newName}\nOld: ${oldName}`, threadID);

        if (newName !== oldName) {
            api.sendMessage(`🚨 **Alert:** Name Change Detect Hua!\nWapis "${oldName}" kar raha hoon...`, threadID);
            
            api.setTitle(oldName, threadID, (err) => {
                if (err) {
                    console.error(err);
                    api.sendMessage(`❌ **Fail:** Main naam wapis nahi badal saka!\nReason: ${err.error || err.message || "Unknown Error"}\n(Shayad main Admin nahi hoon?)`, threadID);
                } else {
                    api.sendMessage(`✅ **Success:** Naam wapis set kar diya!`, threadID);
                }
            });
        }
    }

    // --- CASE 2: EMOJI CHANGE ---
    if (logMessageType === "log:thread-icon") {
        console.log(`[DEBUG] Emoji change event detected in ${threadID}`);

        const newEmoji = logMessageData.thread_icon;
        const oldEmoji = settings[threadID].originalEmoji;

        if (newEmoji !== oldEmoji) {
            api.sendMessage(`🚨 **Alert:** Emoji Change Detect Hua! Reverting...`, threadID);

            api.changeThreadEmoji(oldEmoji, threadID, (err) => {
                if (err) {
                    api.sendMessage(`❌ **Fail:** Emoji revert nahi ho saka.`, threadID);
                } else {
                    api.sendMessage(`✅ **Success:** Emoji wapis set kar diya!`, threadID);
                }
            });
        }
    }
};
