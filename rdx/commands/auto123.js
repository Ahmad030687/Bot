const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { ndown } = require("nayan-media-downloader"); // Anabot's Favorite Scraper
const { getFbVideoInfo } = require("fb-downloader-scrapper");
const instagramGetUrl = require("instagram-url-direct");

module.exports.config = {
    name: "auto",
    version: "11.0.0", // ANABOT SOURCE
    hasPermssion: 0,
    credits: "AHMAD RDX",
    description: "Real Anabot Scraper (No API Key)",
    commandCategory: "media",
    usages: "[link]",
    cooldowns: 2
};

// --- RDX PREMIUM FONT ENGINE ---
const toPremium = (text) => {
    if (!text) return "";
    const map = {
        a: "𝐚", b: "𝐛", c: "𝐜", d: "𝐝", e: "𝐞", f: "𝐟", g: "𝐠", h: "𝐡", i: "𝐢", j: "𝐣", k: "𝐤", l: "𝐥", m: "𝐦", n: "𝐧", o: "𝐨", p: "𝐩", q: "𝐪", r: "𝐫", s: "𝐬", t: "𝐭", u: "𝐮", v: "𝐯", w: "𝐰", x: "𝐱", y: "𝐲", z: "𝐳",
        A: "𝐀", B: "𝐁", C: "𝐂", D: "𝐃", E: "𝐄", F: "𝐅", G: "𝐆", H: "𝐇", I: "𝐈", J: "𝐉", K: "𝐊", L: "𝐋", M: "𝐌", N: "𝐍", O: "𝐎", P: "𝐏", Q: "𝐐", R: "𝐑", S: "𝐒", T: "𝐓", U: "𝐔", V: "𝐕", W: "𝐖", X: "𝐗", Y: "𝐘", Z: "𝐙",
        0: "𝟎", 1: "𝟏", 2: "𝟐", 3: "𝟑", 4: "𝟒", 5: "𝟓", 6: "𝟔", 7: "𝟕", 8: "𝟖", 9: "𝟗"
    };
    return text.split('').map(c => map[c] || c).join('');
};

// --- ANABOT SCRAPER LOGIC ---
async function anabotScraper(url, type) {
    let videoUrl = null;
    let quality = "SD";

    // 🔥 METHOD 1: Nayan Downloader (Anabot Base)
    try {
        console.log("Trying Nayan Scraper...");
        const res = await ndown(url);
        if (res.data && res.data[0] && res.data[0].url) {
            videoUrl = res.data[0].url;
            return { videoUrl, engine: "Nayan Scraper" };
        }
    } catch (e) {}

    // 🔥 METHOD 2: FB Scrapper (Library)
    if (type === 'Facebook') {
        try {
            console.log("Trying FB Lib Scraper...");
            const res = await getFbVideoInfo(url);
            videoUrl = res.sd; // SD is safer, HD sometimes expires
            if (res.hd) videoUrl = res.hd;
            return { videoUrl, engine: "FB Library" };
        } catch (e) {}
    }

    // 🔥 METHOD 3: Insta Scrapper (Library)
    if (type === 'Instagram') {
        try {
            console.log("Trying Insta Lib Scraper...");
            const res = await instagramGetUrl(url);
            if (res.url_list && res.url_list.length > 0) {
                videoUrl = res.url_list[0];
                return { videoUrl, engine: "Insta Library" };
            }
        } catch (e) {}
    }

    // 🔥 METHOD 4: Generic Backup (SnapSave Logic)
    if (!videoUrl) {
        try {
            // Using a hidden scraper used by many bots
            const res = await axios.get(`https://api.vreden.web.id/api/downloader/all?url=${encodeURIComponent(url)}`);
            if (res.data?.data?.url) {
                videoUrl = res.data.data.url;
                return { videoUrl, engine: "Vreden Scraper" };
            }
        } catch(e) {}
    }

    return { videoUrl: null, engine: "Failed" };
}

module.exports.handleEvent = async function({ api, event }) {
    const { body, threadID, messageID } = event;
    if (!body) return;

    const fbRegex = /(https?:\/\/)(www\.|web\.|m\.)?(facebook|fb)\.(com|watch)\/+/;
    const instaRegex = /(https?:\/\/)(www\.)?instagram\.com\/(p|reel|tv)\//;

    let url = null;
    let type = "";

    if (fbRegex.test(body)) {
        url = body.match(fbRegex)[0];
        if(url.length < 10) url = body.split(' ')[0];
        type = "Facebook";
    } else if (instaRegex.test(body)) {
        url = body.match(instaRegex)[0];
        if(url.length < 10) url = body.split(' ')[0];
        type = "Instagram";
    }

    if (url) {
        api.setMessageReaction("⏳", messageID, () => {}, true);

        try {
            // Call Anabot Logic
            const { videoUrl, engine } = await anabotScraper(url, type);

            if (!videoUrl) {
                api.setMessageReaction("❌", messageID, () => {}, true);
                return;
            }

            const stylizedHeader = toPremium("AHMAD RDX SYSTEM");
            const stylizedType = toPremium(type);
            const stylizedEngine = toPremium(engine);

            const filePath = path.join(__dirname, "cache", `anabot_${Date.now()}.mp4`);
            const writer = fs.createWriteStream(filePath);
            
            const videoStream = await axios({
                url: videoUrl,
                method: 'GET',
                responseType: 'stream'
            });

            videoStream.data.pipe(writer);

            writer.on('finish', () => {
                api.setMessageReaction("✅", messageID, () => {}, true);
                
                const finalMsg = `🦅 ${stylizedHeader} 🦅\n` +
                                 `━━━━━━━━━━━━━━━━\n` +
                                 `📥 ${stylizedType} 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐝\n` +
                                 `⚙️ 𝐓𝐞𝐜𝐡: ${stylizedEngine}\n` +
                                 `━━━━━━━━━━━━━━━━\n` +
                                 `✨ 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗`;

                api.sendMessage({
                    body: finalMsg,
                    attachment: fs.createReadStream(filePath)
                }, threadID, () => {
                    fs.unlinkSync(filePath);
                }, messageID);
            });

        } catch (error) {
            console.error(error);
            api.setMessageReaction("⚠️", messageID, () => {}, true);
        }
    }
};

module.exports.run = async function({ api, event }) {
    api.sendMessage("Link bhejo, yeh Anabot Wala System hai! 🦅", event.threadID);
};
