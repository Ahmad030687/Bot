const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "gclock",
    version: "1.0.0",
    hasPermssion: 2, // Sirf Bot Admin/Owner is command ko On/Off kare
    credits: "Ahmad RDX",
    description: "Prevent Name/Emoji Change (Without Admin)",
    commandCategory: "system",
    usages: "[on/off]",
    cooldowns: 5
};

// Database file taake yaad rahe ke original name/emoji kya tha
const dbPath = path.join(__dirname, "cache", "guard_settings.json");

// Helper Functions
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
        // Current Group Info Save kar lo
        const threadInfo = await api.getThreadInfo(threadID);
        
        settings[threadID] = {
            status: true,
            name: threadInfo.threadName,
            emoji: threadInfo.emoji,
            color: threadInfo.color
        };
        saveSettings(settings);
        return api.sendMessage("🛡️ **Guard Mode ON!**\nاب اگر کسی نے نام یا ایموجی بدلا تو میں فوراً واپس تبدیل کر دوں گا۔", threadID);
    } 
    else if (cmd === "off") {
        if (settings[threadID]) {
            settings[threadID].status = false;
            saveSettings(settings);
        }
        return api.sendMessage("😴 **Guard Mode OFF!**\nاب آپ تبدیلیاں کر سکتے ہیں۔", threadID);
    } 
    else {
        return api.sendMessage("❌ Use: `#guard on` or `#guard off`", threadID);
    }
};

// --- YEH EVENT LISTENER HAI (Jo changes ko pakrega) ---
module.exports.handleEvent = async function ({ api, event }) {
    const { threadID, logMessageType, logMessageData } = event;
    const settings = loadSettings();

    // Agar Guard Mode OFF hai ya is group ka data nahi hai to wapis jao
    if (!settings[threadID] || !settings[threadID].status) return;

    // 1. Agar kisi ne GROUP NAME change kiya
    if (logMessageType === "log:thread-name") {
        const newName = logMessageData.name;
        const oldName = settings[threadID].name;

        // Agar naya naam original se alag hai
        if (newName !== oldName) {
            // Wapis change karo
            api.setTitle(oldName, threadID, (err) => {
                if (!err) {
                    api.sendMessage(`⚠️ **Allowed نہیں ہے!**\nنام واپس "${oldName}" کر دیا گیا ہے۔`, threadID);
                }
            });
        }
    }

    // 2. Agar kisi ne EMOJI change kiya
    if (logMessageType === "log:thread-icon") {
        const newEmoji = logMessageData.thread_icon;
        const oldEmoji = settings[threadID].emoji;

        if (newEmoji !== oldEmoji) {
            api.changeThreadColor(settings[threadID].color || "", threadID); // Color aksar emoji ke sath reset hota hai
            api.changeThreadEmoji(oldEmoji, threadID, (err) => {
                if (!err) {
                    api.sendMessage(`⚠️ **Emoji Change Mana Hai!**`, threadID);
                }
            });
        }
    }
    
    // 3. DP (Image) Lock (Thora mushkil hai baghair admin ke, lekin try karega)
    if (logMessageType === "log:thread-image") {
       api.sendMessage("⚠️ **DP Change Detect hui!**\nچونکہ میں ایڈمن نہیں ہوں، میں پرانی DP واپس اپلوڈ نہیں کر سکتا، لیکن خبردار کر رہا ہوں!", threadID);
       // Note: DP wapis lagane ke liye bot ke paas image file honi chahiye.
    }
};
