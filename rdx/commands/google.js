const axios = require("axios");
const cheerio = require("cheerio");

module.exports.config = {
    name: "google",
    version: "3.0.0",
    hasPermssion: 0,
    credits: "Ahmad RDX",
    description: "براہ راست گوگل سے سرچ کریں (اکیلی کمانڈ)",
    commandCategory: "tools",
    usages: "[سرچ کریں]",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const query = args.join(" ");

    if (!query) return api.sendMessage("🔍 احمد بھائی، کچھ لکھیں تو صحیح کہ سرچ کیا کرنا ہے؟", threadID, messageID);

    api.sendMessage(`🚀 **RDX سسٹم گوگل پر ڈھونڈ رہا ہے...**\n"${query}"`, threadID, messageID);

    try {
        // گوگل سرچ کا لنک
        const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=ur`;
        
        // گوگل کو دھوکہ دینے کے لیے براؤزر جیسا ہیڈر
        const headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        };

        const response = await axios.get(url, { headers });
        const $ = cheerio.load(response.data);
        let results = [];

        // گوگل کے رزلٹس نکالنے کا لاجک
        $(".tF2Cpc").each((i, el) => {
            const title = $(el).find("h3").text();
            const link = $(el).find("a").attr("href");
            const description = $(el).find(".VwiC3b").text();

            if (title && link) {
                results.push({ title, link, description });
            }
        });

        if (results.length === 0) return api.sendMessage("❌ معذرت احمد بھائی، گوگل پر کچھ نہیں ملا۔", threadID, messageID);

        // جواب کو خوبصورت بنانا
        let replyMsg = `🌐 **گوگل سرچ رزلٹس (RDX)** 🌐\n\n`;

        results.slice(0, 3).forEach((item, index) => {
            replyMsg += `📍 **${index + 1}. ${item.title}**\n`;
            replyMsg += `🔗 ${item.link}\n`;
            replyMsg += `📝 ${item.description.substring(0, 100)}...\n\n`;
        });

        api.sendMessage(replyMsg, threadID, messageID);

    } catch (error) {
        api.sendMessage("❌ سرور میں مسئلہ آ گیا ہے، دوبارہ کوشش کریں۔", threadID, messageID);
    }
};
