/**
 * tempmail.js - Sardar RDX Final Fixed Suite
 * Credits: Ahmad Ali Safdar | Sardar RDX
 * Fix: Removed 'undefined' via Robust Data Extraction
 */

const axios = require("axios");

module.exports.config = {
  name: "tempmail",
  version: "11.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Fixed Flash Temp Mail (No Undefined)",
  commandCategory: "utility",
  usages: "#tempmail [list | gen | check id]",
  cooldowns: 2
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const sub = args[0]?.toLowerCase();

  const API_KEY = "6f52b7d6a4msh63cfa1e9ad2f0bbp1c46a5jsna5344b9fe618";
  const API_HOST = "flash-temp-mail.p.rapidapi.com";
  const commonHeaders = {
    "x-rapidapi-key": API_KEY,
    "x-rapidapi-host": API_HOST,
    "Content-Type": "application/json"
  };

  // --- 1. GENERATE EMAIL ---
  if (sub === "gen") {
    api.sendMessage("✨ **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗s - Premium Access Verified. Creating...**", threadID);
    try {
      const res = await axios.post(`https://${API_HOST}/mailbox/create`, { not_required: "true" }, {
        params: { free_domains: "false" },
        headers: commonHeaders
      });

      // --- LOGGING FOR DEBUGGING ---
      console.log("--- RAW API RESPONSE ---");
      console.log(JSON.stringify(res.data, null, 2)); 

      // --- ROBUST EXTRACTION ---
      // Hum har jagah dhoondenge jahan email ho sakta hai
      const mailbox = res.data?.mailbox || res.data?.email || res.data?.address || res.data?.data?.mailbox;
      const id = res.data?.id || res.data?.token || res.data?.data?.id;

      if (!mailbox || !id) {
        return api.sendMessage("❌ API ne response diya par email/id nahi mili. Please check your Terminal logs!", threadID, messageID);
      }

      return api.sendMessage(`🦅 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐌𝐀𝐈𝐋**\n\n✉️ **Email:** ${mailbox}\n🆔 **ID:** ${id}\n\n💡 *Check OTP:* #tempmail check ${id}`, threadID, messageID);
    } catch (e) {
      console.error(e.response ? e.response.data : e.message);
      return api.sendMessage("❌ Error: API Connection Failed. Check RapidAPI Dashboard.", threadID);
    }
  }

  // --- 2. CHECK INBOX ---
  if (sub === "check") {
    const id = args[1];
    if (!id) return api.sendMessage("⚠️ Please provide the Mailbox ID!", threadID);
    try {
      const res = await axios.get(`https://${API_HOST}/mailbox/messages/${id}`, { headers: commonHeaders });
      
      const messages = res.data;
      if (!messages || messages.length === 0) return api.sendMessage("📭 Inbox is empty. Waiting for OTP...", threadID, messageID);

      let msg = "📥 **𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 𝐈𝐍𝐁𝐎𝐗**\n\n";
      messages.forEach((m, i) => {
        msg += `${i+1}. 👤 **From:** ${m.from}\n📝 **Sub:** ${m.subject}\n💬 **Text:** ${m.body_text || "Click to view HTML content"}\n---\n`;
      });
      return api.sendMessage(msg, threadID, messageID);
    } catch (e) { return api.sendMessage("❌ Error checking inbox. ID shayad purani hai.", threadID); }
  }

  // --- 3. LIST DOMAINS ---
  if (sub === "list") {
    try {
      const res = await axios.get(`https://${API_HOST}/mailbox/domains`, { headers: commonHeaders });
      let list = "🦅 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐃𝐎𝐌𝐀𝐈𝐍𝐒**\n\n";
      res.data.slice(0, 15).forEach((d, i) => list += `${i+1}. ${d}\n`);
      return api.sendMessage(list, threadID, messageID);
    } catch (e) { return api.sendMessage("❌ Domain list unavailable.", threadID); }
  }

  return api.sendMessage("🛠️ **Usage:**\n#tempmail gen\n#tempmail check [id]\n#tempmail list", threadID, messageID);
};
