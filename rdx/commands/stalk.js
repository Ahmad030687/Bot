/**
 * Stalk Command - Fixed by Ahmad RDX
 */

const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { Readable } = require("stream");
const fsp = fs.promises;

// API Endpoint
const API_ENDPOINT = "https://priyanshuapi.xyz/api/runner/fb-stalk/stalk";

function preventLinkPreview(value) {
  if (!value || value === "No data") return value;
  return value.replace(/https?:\/\/\S+/gi, (url) => url.replace("://", "://\u200b"));
}

module.exports = {
  config: {
    name: 'stalk',
    aliases: ['userinfo', 'whois'],
    description: 'Get detailed information about a Facebook user',
    usage: '{prefix}stalk [@mention] or reply',
    credits: '𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭',
    cooldown: 5,
    hasPrefix: true,
    permission: 0, // Mirai format mein level 0 is public
    category: 'UTILITY'
  },
  
  // Ahmad Bhai: Yahan 'message' ko hata kar 'event' kiya hai
  run: async function({ api, event, args }) {
    const { threadID, messageID, senderID, mentions, messageReply } = event;
    
    try {
      let userId = null;
      let targetLink = null;
      
      // Target Detection Logic
      if (Object.keys(mentions).length > 0) {
        userId = Object.keys(mentions)[0];
      } else if (messageReply) {
        userId = messageReply.senderID;
      } else if (args.length > 0 && /^\d+$/.test(args[0])) {
        userId = args[0];
      } else if (args.length === 0) {
        userId = senderID;
      }
      
      if (!userId) {
        return api.sendMessage('❌ **Ahmad Systems:** Please mention someone or reply to a message!', threadID, messageID);
      }
      
      const processingMsg = await api.sendMessage('🔍 **Ahmad RDX Intelligence:** Scanning Meta Nodes...', threadID);
      
      // IMPORTANT: Agar aapke paas key nahi hai, toh ye niche wala hissa error dega
      const apiKey = "priyanshu-official"; // Yahan apni key likhein ya check karein
      
      const payload = { userId: String(userId) };
      
      const response = await axios.post(API_ENDPOINT, payload, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });
      
      if (!response.data?.success || !response.data?.data) {
        throw new Error('Failed to fetch user information');
      }
      
      const userData = response.data.data;
      const formattedBody = buildFormattedMessage(userData);
      
      let attachmentStream = null;
      
      if (userData.profilePictureUrl) {
        try {
          const picResponse = await axios.get(userData.profilePictureUrl, { responseType: "arraybuffer" });
          const imageBuffer = Buffer.from(picResponse.data);
          attachmentStream = Readable.from(imageBuffer);
          attachmentStream.path = "profile.jpg"; // Stream metadata
        } catch (e) { console.log("Pic error", e); }
      }
      
      api.unsendMessage(processingMsg.messageID);
      
      const messagePayload = {
        body: formattedBody,
        mentions: [{ tag: userData.name || "User", id: userId }]
      };
      
      if (attachmentStream) messagePayload.attachment = attachmentStream;
      
      await api.sendMessage(messagePayload, threadID, messageID);
      
    } catch (error) {
      console.error(error);
      return api.sendMessage('❌ **Meta Shield:** Could not fetch details for this profile.', threadID, messageID);
    }
  }
};

function buildFormattedMessage(data = {}) {
  return (
    `👤 𝐍𝐚𝐦𝐞: ${data.name || "No data"}\n` +
    `🆔 𝐈𝐃: ${data.userId || "No data"}\n` +
    `⚤ 𝐆𝐞𝐧𝐝𝐞𝐫: ${data.gender || "No data"}\n` +
    `🎂 𝐁𝐢𝐫𝐭𝐡𝐝𝐚𝐲: ${data.birthday || "No data"}\n` +
    `💑 𝐒𝐭𝐚𝐭𝐮𝐬: ${data.relationshipStatus || "No data"}\n` +
    `🏡 𝐇𝐨𝐦𝐞𝐭𝐨𝐰𝐧: ${data.hometown || "No data"}\n` +
    `📍 𝐋𝐨𝐜𝐚𝐭𝐢𝐨𝐧: ${data.location || "No data"}\n` +
    `👥 𝐅𝐨𝐥𝐥𝐨𝐰𝐞𝐫𝐬: ${data.subscribersCount ?? "No data"}\n\n` +
    `*Aura: Intelligence Specialist v4*`
  );
}
