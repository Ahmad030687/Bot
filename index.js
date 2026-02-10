// --- IPV6 ERROR FIX (RDX) ---
const dns = require("dns");
try {
    dns.setDefaultResultOrder("ipv4first");
} catch (e) {
    console.log("IPv4 Force Failed (Old Node Version), ignoring...");
}
// -----------------------------

const fs = require('fs-extra');
const path = require('path');
const express = require('express'); // Express shamil kiya

const app = express();
const PORT = process.env.PORT || 10000;

// Render ke health check ke liye aik route
app.get('/', (req, res) => {
  res.send('🦅 SARDAR RDX BOT is Active & Live!');
});

// Server start karein taake Render deploy "Live" ho jaye
app.listen(PORT, () => {
  console.log(`[SERVER] Health check server is running on port ${PORT}`);
});

const configPath = path.join(__dirname, 'config.json');
const appstatePath = path.join(__dirname, 'appstate.json');

let botModule = null;
let botStarted = false;

const BRAND_NAME = "SARDAR RDX";
const BOT_VERSION = "0.6";
const BRAND_WHATSAPP = "+923301068874";
const BRAND_EMAIL = "sardarrdx@gmail.com";

function getConfig() {
  try {
    return fs.readJsonSync(configPath);
  } catch {
    return {
      BOTNAME: 'SARDAR RDX',
      PREFIX: '.',
      ADMINBOT: ['100009012838085'],
      TIMEZONE: 'Asia/Karachi',
      PREFIX_ENABLED: true,
      REACT_DELETE_EMOJI: '😡',
      ADMIN_ONLY_MODE: false,
      AUTO_ISLAMIC_POST: true,
      AUTO_GROUP_MESSAGE: true,
      APPROVE_ONLY: false
    };
  }
}

async function startBot() {
  try {
    if (!fs.existsSync(appstatePath)) {
      console.log('❌ AppState not found. Please add appstate.json to start the bot.');
      return;
    }
    
    console.log(`\n╔═══════════════════════════════════════════════════╗`);
    console.log(`║  ██████╗ ██████╗ ██╗  ██╗    ██████╗  ██████╗  ████████╗║`);
    console.log(`║  ██╔══██╗██╔══██╗╚██╗██╔╝    ██╔══██╗██╔═══██╗ ╚══██╔══╝║`);
    console.log(`║  ██████╔╝██║  ██║ ╚███╔╝     ██████╔╝██║   ██║    ██║   ║`);
    console.log(`║  ██╔══██╗██║  ██║ ██╔██╗     ██╔══██╗██║   ██║    ██║   ║`);
    console.log(`║  ██║  ██║██████╔╝██╔╝ ██╗    ██████╔╝╚██████╔╝    ██║   ║`);
    console.log(`║  ╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝    ╚═════╝  ╚═════╝     ╚═╝   ║`);
    console.log(`╠═══════════════════════════════════════════════════╣`);
    console.log(`║                    v${BOT_VERSION}                              ║`);
    console.log(`║ WhatsApp: ${BRAND_WHATSAPP}                           ║`);
    console.log(`║ Email: ${BRAND_EMAIL}                      ║`);
    console.log(`╚═══════════════════════════════════════════════════╝\n`);
    
    console.log('[BOT] Starting SARDAR RDX...');
    
    botModule = require('./rdx');
    botModule.startBot();
    botStarted = true;
    
    console.log('[BOT] SARDAR RDX is now online! 🚀');
  } catch (error) {
    console.error('❌ Error starting bot:', error.message);
    process.exit(1);
  }
}

startBot();
