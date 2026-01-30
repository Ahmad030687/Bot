module.exports.config = {
  name: "bot",
  version: "2.0.0",
  hasPermssion: 2, // Sirf Admin
  credits: "Ahmad Ali Safdar",
  description: "Bot ko on ya off karein (No Main File Change)",
  commandCategory: "admin",
  usages: "bot [on/off]",
  cooldowns: 2
};

// --- STARTUP LOGIC ---
module.exports.onLoad = function () {
    // Agar bot restart ho to ye default ON rahega
    if (typeof global.rdx_status === "undefined") {
        global.rdx_status = true; 
    }
};

// --- INTERCEPTOR LOGIC ---
// Ye hissa bot ki har command chalne se pehle usay check karega
module.exports.handleEvent = async function ({ api, event, client }) {
    const { body, senderID, threadID } = event;
    if (!body) return;

    const isAdmin = global.config.ADMINBOT.includes(senderID);
    const isEnableCommand = body.toLowerCase().startsWith(global.config.PREFIX + "bot on");

    // Agar bot OFF hai
    if (global.rdx_status === false) {
        // Agar admin "bot on" bole to rasta do
        if (isAdmin && isEnableCommand) return;
        
        // Baki sab ke liye STOP
        return; 
    }
};

// --- RUN LOGIC ---
module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  const state = args[0]?.toLowerCase();

  if (state === "on") {
    global.rdx_status = true;
    return api.sendMessage("✅ AHMAD RDX: System Active. Sabhi commands ab kaam karengi.", threadID, messageID);
  } 
  else if (state === "off") {
    global.rdx_status = false;
    return api.sendMessage("🛑 AHMAD RDX: System Disabled. Bot ab kisi command ka jawab nahi dega.", threadID, messageID);
  } 
  else {
    const status = global.rdx_status ? "ON ✅" : "OFF 🛑";
    return api.sendMessage(`🤖 Current Status: ${status}\n\nSahi tariqa: #bot on ya #bot off`, threadID, messageID);
  }
};
