const fs = require("fs");
const path = require("path");
const axios = require("axios");

const cacheFolder = path.join(__dirname, "cache");
if (!fs.existsSync(cacheFolder)) fs.mkdirSync(cacheFolder);

const pathDP = path.join(cacheFolder, "gcdplock.json");
const pathName = path.join(cacheFolder, "gclock.json");

if (!fs.existsSync(pathDP)) fs.writeFileSync(pathDP, JSON.stringify({}));
if (!fs.existsSync(pathName)) fs.writeFileSync(pathName, JSON.stringify({}));

module.exports = {
  config: {
    name: "gclock_gcdplock",
    version: "1.0.2",
    hasPermssion: 1,
    credits: "Ahmad Ali Safdar",
    description: "Lock Group Name and DP in single file",
    commandCategory: "System",
    usages: "[name/dp] [on/off]",
    prefix: true,
    cooldowns: 5
  },

  run: async function({ api, event, args }) {
    const { threadID, messageID } = event;
    const type = args[0];
    const command = args[1];

    if(!type || !command) return api.sendMessage("❌ Format: *gclock_gcdplock name|dp on/off", threadID, messageID);

    if(type === "name") await handleNameLock(api, event, command);
    else if(type === "dp") await handleDPLock(api, event, command);
    else api.sendMessage("❌ Type invalid! Use 'name' or 'dp'", threadID, messageID);
  },

  handleEvent: async function({ api, event }) {
    const { threadID, author, logMessageType } = event;

    // --------- DP LOCK EVENT ---------
    if (logMessageType === "log:thread-image") {
      let dpData = {};
      try { dpData = JSON.parse(fs.readFileSync(pathDP)); } catch(e){ console.log("DP read error:", e); }
      if(!dpData[threadID] || author === api.getCurrentUserID()) return;

      const oldImage = dpData[threadID];
      try { api.sendMessage("⚠ Group DP Locked! Restoring...", threadID); } catch(e){}

      setTimeout(async ()=>{
        try {
          const response = await axios.get(oldImage, { responseType: "stream" });
          await api.changeGroupImage(response.data, threadID, (err)=>{
            if(err){
              console.log("DP restore error:", err);
              try{ api.sendMessage("❌ DP restore failed! Make bot admin.", threadID); }catch(e){}
            }
          });
        } catch(e){
          console.log("Axios fetch DP error:", e);
          try{ api.sendMessage("❌ DP restore fetch error", threadID); }catch(e){}
        }
      }, 2500); // 2.5 sec delay to avoid FB rate limit
    }

    // --------- NAME LOCK EVENT ---------
    if (logMessageType === "log:thread-name") {
      let nameData = {};
      try { nameData = JSON.parse(fs.readFileSync(pathName)); } catch(e){ console.log("Name read error:", e); }
      if(!nameData[threadID] || author === api.getCurrentUserID()) return;

      const oldName = nameData[threadID];
      const newName = event.logMessageData.name;

      if(oldName !== newName){
        setTimeout(async ()=>{
          try {
            await api.setTitle(threadID, oldName);
            await api.sendMessage(`⚠ Group Name Locked! Restored: ${oldName}`, threadID);
          } catch(e){
            if(e.error === 1390008){
              console.log("⚠ Rate limit: Cannot change name now, try later.");
            } else {
              console.log("Name restore error:", e);
              try{ api.sendMessage("❌ Name restore failed! Make bot admin.", threadID); }catch(e){}
            }
          }
        }, 2500); // 2.5 sec delay
      }
    }
  }
};

// ========================= FUNCTIONS =========================
async function handleNameLock(api, event, command){
  const { threadID, messageID } = event;
  let data = {};
  try{ data = JSON.parse(fs.readFileSync(pathName)); } catch(e){}

  if(command === "on"){
    if(data[threadID]) return api.sendMessage("⚠ Name already locked!", threadID, messageID);
    try{
      const info = await api.getThreadInfo(threadID);
      const currentName = info.threadName;
      if(!currentName) return api.sendMessage("❌ Cannot fetch thread name.", threadID, messageID);
      data[threadID] = currentName;
      fs.writeFileSync(pathName, JSON.stringify(data, null, 4));
      return api.sendMessage(`🔒 Name Locked: ${currentName}`, threadID, messageID);
    } catch(e){ console.log("Error fetching name:", e); return api.sendMessage("❌ Error fetching name", threadID, messageID);}
  }
  if(command === "off"){
    if(!data[threadID]) return api.sendMessage("⚠ Name lock already OFF.", threadID, messageID);
    delete data[threadID];
    fs.writeFileSync(pathName, JSON.stringify(data, null, 4));
    return api.sendMessage("🔓 Name unlock successful.", threadID, messageID);
  }
  return api.sendMessage("❌ Invalid command! Use on/off", threadID, messageID);
}

async function handleDPLock(api, event, command){
  const { threadID, messageID } = event;
  let data = {};
  try{ data = JSON.parse(fs.readFileSync(pathDP)); } catch(e){}

  if(command === "on"){
    if(data[threadID]) return api.sendMessage("⚠ DP already locked!", threadID, messageID);
    try{
      const info = await api.getThreadInfo(threadID);
      const currentImage = info.imageSrc;
      if(!currentImage) return api.sendMessage("❌ No DP found.", threadID, messageID);
      data[threadID] = currentImage;
      fs.writeFileSync(pathDP, JSON.stringify(data, null, 4));
      return api.sendMessage("🔒 DP Locked! Bot will restore if changed.", threadID, messageID);
    } catch(e){ console.log("DP fetch error:", e); return api.sendMessage("❌ Error fetching DP", threadID, messageID);}
  }
  if(command === "off"){
    if(!data[threadID]) return api.sendMessage("⚠ DP lock already OFF.", threadID, messageID);
    delete data[threadID];
    fs.writeFileSync(pathDP, JSON.stringify(data, null, 4));
    return api.sendMessage("🔓 DP unlock successful.", threadID, messageID);
  }
  return api.sendMessage("❌ Invalid command! Use on/off", threadID, messageID);
}

// ============== GLOBAL UNHANDLED PROMISE ==============
process.on("unhandledRejection", (reason, promise)=>{
  console.log("⚠ Unhandled Rejection caught:", reason);
});
