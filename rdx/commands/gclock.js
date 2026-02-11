const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports.config = {
    name: "gclock",
    version: "4.0.0", // No-Kick Edition
    hasPermssion: 1, // Sirf Admin
    credits: "Ahmad RDX",
    description: "Prevent Group Changes (Name, Emoji, Photo)",
    commandCategory: "admin",
    usages: "[name/emoji/avt] [on/off]",
    cooldowns: 5
};

const pathData = path.join(__dirname, "cache", "guard_data.json");

function loadData() {
    if (!fs.existsSync(pathData)) fs.writeFileSync(pathData, JSON.stringify({}));
    return JSON.parse(fs.readFileSync(pathData));
}
function saveData(data) { fs.writeFileSync(pathData, JSON.stringify(data, null, 4)); }

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const type = args[0];
    const state = args[1];

    if (!type || !state) {
        return api.sendMessage(
            `🛡️ **RDX GUARD SETTINGS**\n━━━━━━━━━━━━━━\n` +
            `🔒 **#guard name on** (Name Lock)\n` +
            `🔒 **#guard emoji on** (Emoji Lock)\n` +
            `🔒 **#guard avt on** (Photo Lock)\n` +
            `🔓 **#guard name off** (Unlock)\n\n` +
            `⚠️ *Note: Bot Admin hona chahiye!*`, 
            threadID, messageID
        );
    }

    let data = loadData();
    if (!data[threadID]) data[threadID] = { name: false, emoji: false, avt: false, originalName: "", originalEmoji: "" };

    const threadInfo = await api.getThreadInfo(threadID);

    // --- 1. NAME LOCK ---
    if (type === "name") {
        if (state === "on") {
            data[threadID].name = true;
            data[threadID].originalName = threadInfo.threadName;
            api.sendMessage(`🔒 **Name Locked:** ${threadInfo.threadName}`, threadID);
        } else {
            data[threadID].name = false;
            api.sendMessage(`🔓 **Name Unlocked!**`, threadID);
        }
    } 
    // --- 2. EMOJI LOCK ---
    else if (type === "emoji") {
        if (state === "on") {
            data[threadID].emoji = true;
            data[threadID].originalEmoji = threadInfo.emoji;
            api.sendMessage(`🔒 **Emoji Locked:** ${threadInfo.emoji}`, threadID);
        } else {
            data[threadID].emoji = false;
            api.sendMessage(`🔓 **Emoji Unlocked!**`, threadID);
        }
    }
    // --- 3. PHOTO LOCK ---
    else if (type === "avt") {
        if (state === "on") {
            if (!threadInfo.imageSrc) return api.sendMessage("❌ Pehle koi photo lagayen!", threadID);
            
            const imgPath = path.join(__dirname, "cache", `guard_${threadID}.png`);
            const buf = (await axios.get(threadInfo.imageSrc, { responseType: 'arraybuffer' })).data;
            fs.writeFileSync(imgPath, Buffer.from(buf));

            data[threadID].avt = true;
            api.sendMessage(`🔒 **Photo Locked!** Backup saved.`, threadID);
        } else {
            data[threadID].avt = false;
            api.sendMessage(`🔓 **Photo Unlocked!**`, threadID);
        }
    }
    
    saveData(data);
};

// --- AUTOMATIC REVERTER (NO KICK) ---
module.exports.handleEvent = async function ({ api, event }) {
    const { threadID, logMessageType, logMessageData, author } = event;
    if (author === api.getCurrentUserID()) return; // Bot khud ko na rokay

    let data = loadData();
    if (!data[threadID]) return;

    // 1. ANTI-NAME CHANGE
    if (logMessageType === "log:thread-name" && data[threadID].name) {
        if (logMessageData.name !== data[threadID].originalName) {
            // Sirf wapis karo, kick nahi
            api.setTitle(data[threadID].originalName, threadID);
            api.sendMessage(`⚠️ **Warning:** @User Name lock hai!`, threadID);
        }
    }

    // 2. ANTI-EMOJI CHANGE
    if (logMessageType === "log:thread-icon" && data[threadID].emoji) {
        // Sirf wapis karo
        api.changeThreadEmoji(data[threadID].originalEmoji || "👍", threadID, () => {});
        api.sendMessage(`⚠️ **Warning:** Emoji change karna mana hai!`, threadID);
    }

    // 3. ANTI-PHOTO CHANGE
    if (logMessageType === "log:thread-image" && data[threadID].avt) {
        api.sendMessage(`⚠️ **Warning:** Photo wapis lagayi ja rahi hai...`, threadID);
        const imgPath = path.join(__dirname, "cache", `guard_${threadID}.png`);
        if (fs.existsSync(imgPath)) {
            api.changeGroupImage(fs.createReadStream(imgPath), threadID);
        }
    }
};
              
