/**
 * tempmail.js - Sardar RDX Complete Temp Mail Suite
 * Credits: Ahmad Ali Safdar | Sardar RDX
 * Functions: Generate, List Domains, Check Inbox
 */

const axios = require('axios');

module.exports.config = {
  name: "tempmail",
  version: "5.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "Complete Temp Mail: #tempmail gen | list | check [id]",
  commandCategory: "tools",
  usages: "#tempmail [gen/list/check] [id]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const subCommand = args[0]?.toLowerCase();

  const API_KEY = '6f52b7d6a4msh63cfa1e9ad2f0bbp1c46a5jsna5344b9fe618';
  const API_HOST = 'flash-temp-mail.p.rapidapi.com';

  // --- Sub-Command 1: GEN (Naya Mailbox Banana) ---
  if (subCommand === "gen") {
    try {
      api.sendMessage("📧 Creating your mailbox...", threadID);
      const res = await axios.post(`https://${API_HOST}/mailbox/create`, { not_required: 'not_required' }, {
        params: { free_domains: 'false' },
        headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': API_HOST, 'Content-Type': 'application/json' }
      });
      const { mailbox, id } = res.data;
      return api.sendMessage(`🦅 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐌𝐀𝐈𝐋**\n\n✉️ Email: ${mailbox}\n🆔 ID: ${id}\n\n💡 *OTP dekhne ke liye check karein:* \n#tempmail check ${id}`, threadID, messageID);
    } catch (e) { return api.sendMessage("❌ Error creating mailbox.", threadID); }
  }

  // --- Sub-Command 2: LIST (Available Domains Dekhna) ---
  if (subCommand === "list") {
    try {
      const res = await axios.get(`https://${API_HOST}/mailbox/domains`, {
        headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': API_HOST }
      });
      let msg = "🦅 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 - Domains**\n\n";
      res.data.forEach((d, i) => msg += `${i + 1}. ${d}\n`);
      return api.sendMessage(msg, threadID, messageID);
    } catch (e) { return api.sendMessage("❌ Error fetching domains.", threadID); }
  }

  // --- Sub-Command 3: CHECK (OTP/Inbox Dekhna) ---
  if (subCommand === "check") {
    const mailboxId = args[1];
    if (!mailboxId) return api.sendMessage("⚠️ Ahmad bhai, Mailbox ID to likhein!\nUsage: #tempmail check [id]", threadID, messageID);

    try {
      api.sendMessage("📥 Checking inbox for OTP...", threadID);
      const res = await axios.get(`https://${API_HOST}/mailbox/messages/${mailboxId}`, {
        headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': API_HOST }
      });
      
      const messages = res.data;
      if (!messages || messages.length === 0) {
        return api.sendMessage("📭 Inbox khali hai Ahmad bhai. Thori der baad check karein.", threadID, messageID);
      }

      let msg = `🦅 **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐈𝐍𝐁𝐎𝐗**\n\n`;
      messages.forEach((m, i) => {
        msg += `📩 **From:** ${m.from}\n📝 **Subject:** ${m.subject}\n💬 **Content:** ${m.body_text || "No text"}\n---\n`;
      });
      return api.sendMessage(msg, threadID, messageID);
    } catch (e) { return api.sendMessage("❌ Error checking inbox. ID sahi hai?", threadID); }
  }

  // --- Agar koi sub-command na di ho ---
  return api.sendMessage("🛠️ **𝐀𝐇𝐌𝐀𝐃 𝐑𝐃𝐗 𝐌𝐀𝐈𝐋 𝐌𝐄𝐍𝐔**\n\n1. #tempmail gen (Naya email)\n2. #tempmail list (Domains dekhna)\n3. #tempmail check [ID] (OTP dekhna)", threadID, messageID);
};
