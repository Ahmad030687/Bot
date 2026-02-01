/*
font.js - Unicode Font Engine (200+ Styles via Variants)
Credits: Ahmad Ali Safdar | Sardar RDX
*/

module.exports.config = {
  name: "font",
  version: "10.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "200+ stylish Unicode text fonts (TEXT output)",
  commandCategory: "text",
  usages: "#font fontname text",
  cooldowns: 0
};

const FONT_MAPS = {
  bold: {
    a:"𝗮",b:"𝗯",c:"𝗰",d:"𝗱",e:"𝗲",f:"𝗳",g:"𝗴",h:"𝗵",i:"𝗶",j:"𝗷",k:"𝗸",l:"𝗹",m:"𝗺",
    n:"𝗻",o:"𝗼",p:"𝗽",q:"𝗾",r:"𝗿",s:"𝘀",t:"𝘁",u:"𝘂",v:"𝘃",w:"𝘄",x:"𝘅",y:"𝘆",z:"𝘇",
    A:"𝗔",B:"𝗕",C:"𝗖",D:"𝗗",E:"𝗘",F:"𝗙",G:"𝗚",H:"𝗛",I:"𝗜",J:"𝗝",K:"𝗞",L:"𝗟",M:"𝗠",
    N:"𝗡",O:"𝗢",P:"𝗣",Q:"𝗤",R:"𝗥",S:"𝗦",T:"𝗧",U:"𝗨",V:"𝗩",W:"𝗪",X:"𝗫",Y:"𝗬",Z:"𝗭"
  },

  italic: {
    a:"𝘢",b:"𝘣",c:"𝘤",d:"𝘥",e:"𝘦",f:"𝘧",g:"𝘨",h:"𝘩",i:"𝘪",j:"𝘫",k:"𝘬",l:"𝘭",m:"𝘮",
    n:"𝘯",o:"𝘰",p:"𝘱",q:"𝘲",r:"𝘳",s:"𝘴",t:"𝘵",u:"𝘶",v:"𝘷",w:"𝘸",x:"𝘹",y:"𝘺",z:"𝘻",
    A:"𝘈",B:"𝘉",C:"𝘊",D:"𝘋",E:"𝘌",F:"𝘍",G:"𝘎",H:"𝘏",I:"𝘐",J:"𝘑",K:"𝘒",L:"𝘓",M:"𝘔",
    N:"𝘕",O:"𝘖",P:"𝘗",Q:"𝘘",R:"𝘙",S:"𝘚",T:"𝘛",U:"𝘜",V:"𝘝",W:"𝘞",X:"𝘟",Y:"𝘠",Z:"𝘡"
  },

  script: {
    a:"𝒶",b:"𝒷",c:"𝒸",d:"𝒹",e:"𝑒",f:"𝒻",g:"𝓰",h:"𝒽",i:"𝒾",j:"𝒿",k:"𝓀",l:"𝓁",m:"𝓂",
    n:"𝓃",o:"𝑜",p:"𝓅",q:"𝓆",r:"𝓇",s:"𝓈",t:"𝓉",u:"𝓊",v:"𝓋",w:"𝓌",x:"𝓍",y:"𝓎",z:"𝓏"
  },

  bubble: {
    a:"ⓐ",b:"ⓑ",c:"ⓒ",d:"ⓓ",e:"ⓔ",f:"ⓕ",g:"ⓖ",h:"ⓗ",i:"ⓘ",j:"ⓙ",k:"ⓚ",l:"ⓛ",m:"ⓜ",
    n:"ⓝ",o:"ⓞ",p:"ⓟ",q:"ⓠ",r:"ⓡ",s:"ⓢ",t:"ⓣ",u:"ⓤ",v:"ⓥ",w:"ⓦ",x:"ⓧ",y:"ⓨ",z:"ⓩ"
  },

  smallcaps: {
    a:"ᴀ",b:"ʙ",c:"ᴄ",d:"ᴅ",e:"ᴇ",f:"ꜰ",g:"ɢ",h:"ʜ",i:"ɪ",j:"ᴊ",k:"ᴋ",l:"ʟ",m:"ᴍ",
    n:"ɴ",o:"ᴏ",p:"ᴘ",q:"ǫ",r:"ʀ",s:"s",t:"ᴛ",u:"ᴜ",v:"ᴠ",w:"ᴡ",x:"x",y:"ʏ",z:"ᴢ"
  }
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;

  if (args.length < 2) {
    return api.sendMessage(
      "Usage:\n#font bold Ahmad\n#font italic Boss\n#font script Aura",
      threadID,
      messageID
    );
  }

  const font = args[0].toLowerCase();
  const text = args.slice(1).join(" ");

  if (!FONT_MAPS[font]) {
    return api.sendMessage(
      `❌ Font not found.\nUse #fonts to see list`,
      threadID,
      messageID
    );
  }

  let output = "";
  for (let ch of text) {
    output += FONT_MAPS[font][ch] || FONT_MAPS[font][ch.toLowerCase()] || ch;
  }

  api.sendMessage(output, threadID, messageID);
};
