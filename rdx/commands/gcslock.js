const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "gclock",
    version: "2.0.0", // Updated Version
    hasPermssion: 1, // Admin/Group Admin
    credits: "Ahmad RDX",
    description: "Anti-Change Name & Emoji",
    commandCategory: "system",
    usages: "[on/off]",
    cooldowns: 5
};

const dbPath = path.join(__dirname, "cache", "guard_settings.json");

// Settings Load/Save Functions
function loadSettings() {
    if (!fs.existsSync(dbPath)) {
        fs.writeFileSync(dbPath, JSON.stringify({}));
    }
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
            // Current Group Info fetch karna zaroori hai
            const threadInfo = await api.getThreadInfo(threadID);
            
            settings[threadID] = {
                status: true,
                originalName: threadInfo.threadName,
                originalEmoji: threadInfo.emoji,
                originalColor: threadInfo.color
            };
            
            saveSettings(settings);
            console.log(`[GUARD] Saved Settings for Group: ${threadID}`);
            return api.sendMessage(`🛡️ **Guard Active!**\nName: ${threadInfo.threadName}\nEmoji: ${threadInfo.emoji}\nAb agar koi change karega to mai wapis yehi laga dunga.`, threadID);
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
        return api.sendMessage("Usage: `#guard on` or `#guard off`", threadID);
    }
};

// --- MAIN EVENT HANDLER ---
module.exports.handleEvent = async function ({ api, event }) {
    // Sirf Admin logs check karne hain
    if (!event.logMessageType) return;

    const { threadID, logMessageType, logMessageData } = event;
    const settings = loadSettings();

    // 1. Check agar Guard ON hai
    if (!settings[threadID] || !settings[threadID].status) return;

    // --- CASE 1: NAME CHANGE ---
    if (logMessageType === "log:thread-name") {
        console.log(`[GUARD] Name Change Detected in ${threadID}`);
        
        const newName = logMessageData.name;
        const oldName = settings[threadID].originalName;

        // Agar naam different hai
        if (newName !== oldName) {
            console.log(`[GUARD] Reverting Name to: ${oldName}`);
            
            // Wapis Old Name set karo
            api.setTitle(oldName, threadID, (err) => {
                if (err) {
                    console.error("[GUARD ERROR] Cannot change name (No Permission?)");
                    api.sendMessage("❌ Mai Name wapis nahi badal saka! Shayad mujhe Admin permission chahiye.", threadID);
                } else {
                    api.sendMessage(`⚠️ **Not Allowed!**\nName wapis "${oldName}" kar diya gaya hai.`, threadID);
                }
            });
        }
    }

    // --- CASE 2: EMOJI CHANGE ---
    if (logMessageType === "log:thread-icon") {
        console.log(`[GUARD] Emoji Change Detected in ${threadID}`);

        const newEmoji = logMessageData.thread_icon;
        const oldEmoji = settings[threadID].originalEmoji;

        if (newEmoji !== oldEmoji) {
            console.log(`[GUARD] Reverting Emoji to: ${oldEmoji}`);
            
            api.changeThreadEmoji(oldEmoji, threadID, (err) => {
                if (err) {
                    console.error("[GUARD ERROR] Cannot change emoji");
                    api.sendMessage("❌ Emoji wapis change nahi ho raha! (Check Admin Rights)", threadID);
                } else {
                    api.sendMessage(`⚠️ **Emoji Change Mana Hai!**`, threadID);
                }
            });
        }
    }
};
