/**
 * tempmail.js - Sardar RDX Power Suite (3-in-1)
 * Credits: Ahmad Ali Safdar | Sardar RDX
 * Logic: One file for Domains, Generation, and OTP Checking
 */

const axios = require("axios");

module.exports.config = {
  name: "tempmail",
  version: "10.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Complete Flash Temp Mail Suite",
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
    "x-rapidapi-host": API_HOST
  };

  // --- 1. DOMAINS LIST (#tempmail list) ---
  if (sub === "list") {
    api.sendMessage("📨 **𝐀𝐇𝐌𝐀𝐃 𝐏𝐇𝐎𝐓𝐎𝐒𝐓𝐀𝐓𝐄 - Loading Domains...**", threadID);
    try {
      const res = await axios.get(`https://${API_HOST}/mailbox/domains`, { headers: commonHeaders });
      const domains = res.data;
      if (!domains || domains.length === 0) return api.sendMessage("❌ No domains found.", threadID, messageID);

      let msg = "🦅 **𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 𝐃𝐎𝐌𝐀𝐈𝐍𝐒**\n\n";
      domains.slice(0, 15).forEach((d, i) => msg += `${i + 1}. ${d}\n`);
      msg += `\n✅ Total: ${domains.length} | Use #tempmail gen to create!`;
      return api.sendMessage(msg, threadID, messageID);
    } catch (e) { return api.sendMessage("❌ Domain API error.", threadID); }
  }

  // --- 2. GENERATE EMAIL (#tempmail gen) ---
  if (sub === "gen") {
    api.sendMessage("✨ Generating Premium Temp-Mail...", threadID);
    try {
      const res = await axios.post(`https://${API_HOST}/mailbox/create`, { not_required: "true" }, {
        params: { free_domains: "false" },
        headers: { ...commonHeaders, "Content-Type": "application/json" }
      });
      const { mailbox, id } = res.data;
      return api.sendMessage(`🦅 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐌𝐀𝐈𝐋**\n\n✉️ Email: ${mailbox}\n🆔 ID: ${id}\n\n💡 *Check OTP:* #tempmail check ${id}`, threadID, messageID);
    } catch (e) { return api.sendMessage("❌ Error generating email.", threadID); }
  }

  // --- 3. CHECK INBOX (#tempmail check id) ---
  if (sub === "check") {
    const id = args[1];
    if (!id) return api.sendMessage("⚠️ Please provide the Mailbox ID!", threadID);
    try {
      const res = await axios.get(`https://${API_HOST}/mailbox/messages/${id}`, { headers: commonHeaders });
      if (!res.data || res.data.length === 0) return api.sendMessage("📭 Inbox is empty.", threadID);

      let msg = "📥 **𝐒𝐀𝐑𝐃𝐀𝐑 𝐑𝐃𝐗 𝐈𝐍𝐁𝐎𝐗**\n\n";
      res.data.forEach((m, i) => {
        msg += `${i+1}. From: ${m.from}\nSub: ${m.subject}\nBody: ${m.body_text}\n\n`;
      });
      return api.sendMessage(msg, threadID, messageID);
    } catch (e) { return api.sendMessage("❌ Error checking messages.", threadID); }
  }

  // DEFAULT MENU
  return api.sendMessage("🛠️ **𝐓𝐄𝐌𝐏𝐌𝐀𝐈𝐋 𝐌𝐄𝐍𝐔**\n\n#tempmail list - Show domains\n#tempmail gen - New email\n#tempmail check [id] - View OTP", threadID, messageID);
};
