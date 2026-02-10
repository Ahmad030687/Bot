const axios = require("axios");
const cheerio = require("cheerio");

module.exports.config = {
    name: "google", // Naam google hi rakha hai taake command purani hi chale
    version: "5.0.0",
    hasPermssion: 0,
    credits: "Ahmad RDX",
    description: "DuckDuckGo ke zariye search (Google ka behtareen badal)",
    commandCategory: "tools",
    usages: "[search query]",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const query = args.join(" ");

    if (!query) return api.sendMessage("🔍 احمد بھائی، کچھ لکھیں تو صحیح کہ کیا ڈھونڈنا ہے؟", threadID, messageID);

    api.sendMessage(`📡 **RDX سسٹم متبادل سرور سے ڈیٹا نکال رہا ہے...**`, threadID, messageID);

    try {
        // DuckDuckGo HTML version (Scraping ke liye best hai)
        const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
        
        const headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        };

        const response = await axios.get(url, { headers });
        const $ = cheerio.load(response.data);
        let results = [];

        // DuckDuckGo results nikalne ka logic
        $(".result").each((i, el) => {
            const title = $(el).find(".result__title").text().trim();
            const link = $(el).find(".result__url").text().trim();
            const snippet = $(el).find(".result__snippet").text().trim();

            if (title && link) {
                results.push({ title, link, snippet });
            }
        });

        if (results.length === 0) {
            return api.sendMessage("❌ معذرت احمد بھائی، اس وقت ڈیٹا نہیں مل سکا۔", threadID, messageID);
        }

        let replyMsg = `🌐 **سرچ رزلٹس (RDX متبادل انجن)** 🌐\n\n`;

        // Pehle 4 results
        results.slice(0, 4).forEach((item, index) => {
            replyMsg += `🔥 **${index + 1}. ${item.title}**\n`;
            replyMsg += `🔗 https://${item.link}\n`;
            replyMsg += `📝 ${item.snippet.substring(0, 150)}...\n\n`;
        });

        replyMsg += `💡 *نوٹ: گوگل بلاک ہونے کی وجہ سے ڈیٹا DuckDuckGo سے لایا گیا ہے۔*`;

        api.sendMessage(replyMsg, threadID, messageID);

    } catch (error) {
        api.sendMessage("❌ احمد بھائی، سرچ سسٹم ابھی ڈاؤن ہے۔", threadID, messageID);
    }
};
