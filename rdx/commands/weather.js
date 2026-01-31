module.exports.config = {
  name: "weather",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Get real-time weather info",
  commandCategory: "utility",
  usages: "weather [city name]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const axios = require("axios");
  const { threadID, messageID } = event;
  const city = args.join(" ");

  if (!city) return api.sendMessage("⚠️ Shehar ka naam to likho Ahmad bhai! (e.g. #weather Faisalabad)", threadID, messageID);

  const apiKey = "c1e0e18e477442ac9410418d8835de56";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

  try {
    const res = await axios.get(url);
    const data = res.data;

    const temp = data.main.temp;
    const feelsLike = data.main.feels_like;
    const weather = data.weather[0].main;
    const humidity = data.main.humidity;
    const wind = data.wind.speed;
    const country = data.sys.country;

    // Sigma Aura Logic based on weather
    let auraMsg = "";
    if (temp > 35) auraMsg = "🔥 Garmi zyada hai, Sigma ko thanda rehna chahiye.";
    else if (temp < 15) auraMsg = "❄️ Mausam thanda hai, coding ke liye best vibes hain.";
    else auraMsg = "🌤️ Mausam perfect hai, Aura +500.";

    const emoji = {
      Clear: "☀️",
      Clouds: "☁️",
      Rain: "🌧️",
      Thunderstorm: "⛈️",
      Drizzle: "🌦️",
      Snow: "❄️",
      Mist: "🌫️"
    };

    const statusEmoji = emoji[weather] || "🌍";

    let msg = `🌍 **WEATHER REPORT: ${data.name}, ${country}** ${statusEmoji}\n`;
    msg += `──────────────────\n`;
    msg += `🌡️ **Temp:** ${temp}°C\n`;
    msg += `🤔 **Feels Like:** ${feelsLike}°C\n`;
    msg += `☁️ **Condition:** ${weather}\n`;
    msg += `💧 **Humidity:** ${humidity}%\n`;
    msg += `💨 **Wind Speed:** ${wind} m/s\n`;
    msg += `──────────────────\n`;
    msg += `💡 **WEATHER Status:** ${auraMsg}\n`;
    msg += `🦅 AHMAD RDX SYSTEM`;

    return api.sendMessage(msg, threadID, messageID);

  } catch (e) {
    if (e.response && e.response.status === 404) {
      return api.sendMessage("❌ Shehar ka naam ghalat hai ya nahi mila.", threadID, messageID);
    }
    return api.sendMessage("❌ API Error: Mausam ka hal nahi mil saka.", threadID, messageID);
  }
};
