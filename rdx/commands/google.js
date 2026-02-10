const axios = require("axios");
const cheerio = require("cheerio");

module.exports.config = {
    name: "google",
    version: "4.0.0",
    hasPermssion: 0,
    credits: "Ahmad RDX",
    description: "گوگل سرچ کا اپڈیٹڈ ورژن (Urdu Results)",
    commandCategory: "tools",
    usages: "[search query]",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const query = args.join(" ");

    if (!query) return api.sendMessage("🔍 احمد بھائی، سرچ کرنے کے لیے کچھ لکھیں تو صحیح!", threadID, messageID);

    api.sendMessage(`🚀 **RDX سسٹم ڈیٹا نکال رہا ہے...**`, threadID, messageID);

    try {
        // Google Search URL (Urdu interface)
        const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=ur&gl=pk`;
        
        // Modern Browser Headers
        const headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9,ur;q=0.8"
        };

        const response = await axios.get(url, { headers });
        const $ = cheerio.load(response.data);
        
        let results = [];

        // Naye selectors jo zyada stable hain
        $("div.MjjYud").each((i, el) => {
            const title = $(el).find("h3").text();
            const link = $(el).find("a").attr("href");
            const snippet = $(el).find("div.VwiC3b").text() || $(el).find("div.kb0Odf").text();

            if (title && link && link.startsWith("http")) {
                results.push({ title, link, snippet });
            }
        });

        if (results.length === 0) {
            // Fallback: Agar upar wala fail ho jaye to purana tariqa try karein
            $("div.g").each((i, el) => {
                const title = $(el).find("h3").text();
                const link = $(el).find("a").attr("href");
                if (title && link) results.push({ title, link, snippet: "" });
            });
        }

        if (results.length === 0) {
            return api.sendMessage("❌ معذرت احمد بھائی، گوگل نے ڈیٹا دینے سے انکار کر دیا (Captcha یا Block)۔ تھوڑی دیر بعد دوبارہ کوشش کریں۔", threadID, messageID);
        }

        let replyMsg = `🌐 **گوگل رزلٹس (RDX اپڈیٹ)** 🌐\n\n`;

        results.slice(0, 4).forEach((item, index) => {
            replyMsg += `🔥 **${index + 1}. ${item.title}**\n`;
            replyMsg += `🔗 ${item.link}\n`;
            if (item.snippet) replyMsg += `📝 ${item.snippet.substring(0, 120)}...\n`;
            replyMsg += `\n`;
        });

        api.sendMessage(replyMsg, threadID, messageID);

    } catch (error) {
        console.log(error);
        api.sendMessage("❌ احمد بھائی، گوگل سائیڈ پر کوئی مسئلہ آ رہا ہے۔", threadID, messageID);
    }
};
