/**
 * font.js - Sardar RDX 200+ Professional Font Engine
 * Credits: Ahmad Ali Safdar | Sardar RDX
 * Logic: Combinatorial Unicode Engine (1-200)
 */

module.exports.config = {
  name: "font",
  version: "20.0.0",
  hasPermssion: 0,
  credits: "Ahmad Ali",
  description: "200+ Professional Styles using Numbers 1-200",
  commandCategory: "text",
  usages: "#font [1-200] [text]",
  cooldowns: 0
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  if (args.length < 2) return api.sendMessage("⚠️ Ahmad bhai, use karein: #font [number] [text]\nExample: #font 52 Sardar RDX", threadID, messageID);

  const num = parseInt(args[0]);
  const text = args.slice(1).join(" ");
  
  if (isNaN(num) || num < 1 || num > 200) {
    return api.sendMessage("❌ Ahmad bhai, sirf 1 se 200 tak ka number likhein.", threadID, messageID);
  }

  const getStyledText = (str, n) => {
    const alpha = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const baseStyles = [
      [0x1D41A, 0x1D400, 0x1D7CE], // Bold
      [0x1D44E, 0x1D434, 0x30],    // Italic
      [0x1D5EE, 0x1D5D4, 0x1D7EC], // Sans Bold
      [0x1D622, 0x1D608, 0x30],    // Sans Italic
      [0x1D4B6, 0x1D49C, 0x30],    // Script
      [0x1D51E, 0x1D504, 0x30],    // Fraktur
      [0x1D552, 0x1D538, 0x1D7D8], // Double-struck
      [0x1D670, 0x1D670, 0x1D7F6], // Mono
      [0x1D400, 0x1D400, 0x30],    // Serif Bold
      [0x1D5BA, 0x1D5A0, 0x1D7E2]  // Sans Normal
    ];

    // Modifiers (Underlines, Dots, Strikes, etc.)
    const mods = ["", "\u0332", "\u0336", "\u0333", "\u0305", "\u0338", "\u0323", "\u0330", "\u0337", "\u0331", "\u0334", "\u0324", "\u032D", "\u032E", "\u035A", "\u035B", "\u032B", "\u032C", "\u035D", "\u035E"];

    let styleIdx = (n - 1) % baseStyles.length;
    let modIdx = Math.floor((n - 1) / baseStyles.length);
    
    let res = "";
    for (let char of str) {
      let i = alpha.indexOf(char);
      if (i !== -1) {
        let code;
        if (i < 26) code = baseStyles[styleIdx][0] + i;
        else if (i < 52) code = baseStyles[styleIdx][1] + (i - 26);
        else code = baseStyles[styleIdx][2] + (i - 52);
        res += String.fromCodePoint(code) + (mods[modIdx] || "");
      } else {
        res += char;
      }
    }
    return res;
  };

  const finalOutput = getStyledText(text, num);
  return api.sendMessage(finalOutput, threadID, messageID);
};
