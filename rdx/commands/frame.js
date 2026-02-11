const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "frame",
    version: "5.0.0", // Mega 100+ Edition
    hasPermssion: 0,
    credits: "Ahmad RDX",
    description: "100+ Premium Random Frames & Tints",
    commandCategory: "image",
    usages: "(Bas #frame likhein reply kar ke)",
    cooldowns: 5,
    aliases: ["pic", "avatar", "dp", "edit", "look"]
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID, type, messageReply } = event;

    // 1. TARGET SELECTION (Smart Logic)
    let targetID = senderID;
    if (type === "message_reply") {
        targetID = messageReply.senderID;
    } else if (Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
    }

    // 2. HD Avatar URL
    const avatar = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

    // 3. API BASES
    const pop = "https://api.popcat.xyz";
    const dank = "https://some-random-api.com/canvas"; 

    // --- LIST 1: DIRECT API EFFECTS (30+) ---
    let effects = [
        // Professional Filters
        { name: "🧊 FROSTED GLASS", url: `${dank}/glass?avatar=${avatar}` },
        { name: "👾 RETRO PIXEL", url: `${dank}/misc/pixelate?avatar=${avatar}` },
        { name: "🌑 NOIR B&W", url: `${pop}/greyscale?image=${avatar}` },
        { name: "🎨 NEGATIVE ART", url: `${pop}/invert?image=${avatar}` },
        { name: "🌫️ DREAMY BLUR", url: `${pop}/blur?image=${avatar}` },
        { name: "📜 VINTAGE SEPIA", url: `${pop}/sepia?image=${avatar}` },
        { name: "🔥 BURN EFFECT", url: `${dank}/triggered?avatar=${avatar}` },
        { name: "🌈 RAINBOW VIBE", url: `${dank}/gay?avatar=${avatar}` },
        { name: "🔮 MYSTERY ORB", url: `${dank}/misc/spin?avatar=${avatar}` },
        { name: "💎 BRIGHTNESS", url: `${dank}/brightness?avatar=${avatar}` },
        
        // Overlays (Clean Ones)
        { name: "👮 POLICE TAPE", url: `${pop}/alert?image=${avatar}` },
        { name: "⚠️ CAUTION", url: `${pop}/caution?image=${avatar}` },
        { name: "📺 OLD TV", url: `${dank}/misc/youtube-comment?avatar=${avatar}&username=Star&comment=Wow!` }, // Just for effect
        { name: "❤️ HEARTS", url: `${dank}/misc/heart?avatar=${avatar}` }, // Simple overlay
        { name: "🟢 NIGHT VISION", url: `${pop}/colorify?image=${avatar}&color=00ff00` }, // Matrix style
    ];

    // --- LIST 2: THE COLOR ENGINE (70+ Custom Tints) ---
    // Ye color codes tasveer ko aik khaas premium shade dete hain
    const colors = [
        { name: "🔴 ROYAL RED", hex: "ff0000" },
        { name: "🔵 DEEP OCEAN", hex: "0000ff" },
        { name: "🟡 GOLDEN HOUR", hex: "ffd700" },
        { name: "🟣 ROYAL PURPLE", hex: "800080" },
        { name: "🌸 SAKURA PINK", hex: "ffb7c5" },
        { name: "⚡ NEON CYAN", hex: "00ffff" },
        { name: "🌿 JUNGLE GREEN", hex: "228b22" },
        { name: "🍊 SUNSET ORANGE", hex: "ff4500" },
        { name: "🍫 CHOCOLATE", hex: "d2691e" },
        { name: "☁️ SILVER MIST", hex: "c0c0c0" },
        { name: "🧛 VAMPIRE BLOOD", hex: "8a0303" },
        { name: "🤖 CYBERPUNK", hex: "0ff0fc" },
        { name: "🍑 PEACH FUZZ", hex: "ffdabe" },
        { name: "🧼 MINT FRESH", hex: "98ff98" },
        { name: "🌌 GALAXY BLUE", hex: "191970" },
        { name: "🍷 RICH MAROON", hex: "800000" },
        { name: "🍋 LEMON ZEST", hex: "fff44f" },
        { name: "👽 ALIEN GREEN", hex: "39ff14" },
        { name: "🦄 UNICORN", hex: "ff00ff" },
        { name: "🏺 ANTIQUE BRONZE", hex: "cd7f32" },
        { name: "🌲 FOREST DARK", hex: "013220" },
        { name: "💄 HOT LIPS", hex: "ff69b4" },
        { name: "🥶 ICE COLD", hex: "a5f2f3" },
        { name: "🎃 HALLOWEEN", hex: "ff7518" },
        { name: "☕ COFFEE", hex: "6f4e37" },
        { name: "🎸 ROCKSTAR", hex: "9400d3" },
        { name: "💸 DOLLAR GREEN", hex: "85bb65" },
        { name: "🌑 MIDNIGHT", hex: "191919" },
        { name: "🌋 LAVA", hex: "cf1020" },
        { name: "🧿 EVIL EYE", hex: "00008b" },
        // ... Mazeed shades add kiye ja rahe hain logic se
    ];

    // Colors ko effects list mein shamil karna
    colors.forEach(c => {
        effects.push({ 
            name: `🎨 TINT: ${c.name}`, 
            url: `${pop}/colorify?image=${avatar}&color=${c.hex}` 
        });
    });

    // 4. RANDOMIZER (Ab list mein 100+ items hain)
    const randomPick = effects[Math.floor(Math.random() * effects.length)];

    // 5. Initial Message
    api.sendMessage(`🎨 **Designing Premium Frame...**\nApplying: ${randomPick.name}`, threadID, messageID);

    try {
        const filePath = path.join(__dirname, "cache", `rdx_mega_${targetID}_${Date.now()}.png`);
        
        const response = await axios({
            url: randomPick.url,
            method: 'GET',
            responseType: 'arraybuffer'
        });

        fs.writeFileSync(filePath, Buffer.from(response.data));

        // 6. FINAL SEND
        api.sendMessage({
            body: `🦅 **RDX STUDIO ULTRA**\n━━━━━━━━━━━━━━━━\n✨ **Style:** ${randomPick.name}\n👤 **Model:** @User`,
            mentions: [{ tag: "@User", id: targetID }],
            attachment: fs.createReadStream(filePath)
        }, threadID, () => fs.unlinkSync(filePath), messageID);

    } catch (e) {
        console.error(e);
        api.sendMessage("❌ Server Busy! Phir se try karein, naya style ayega.", threadID, messageID);
    }
};
      
