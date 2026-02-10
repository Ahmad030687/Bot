const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "openaccount",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Ahmad RDX",
    description: "Open a bank account step by step",
    commandCategory: "economy",
    usages: "",
    cooldowns: 5
};

const dataPath = path.join(__dirname, "cache", "rdx_economy.json");
const statePath = path.join(__dirname, "cache", "reg_state.json");

module.exports.handleEvent = async function ({ api, event }) {
    const { threadID, senderID, body } = event;
    if (!fs.existsSync(statePath)) fs.writeJsonSync(statePath, {});
    let states = fs.readJsonSync(statePath);

    if (!states[senderID]) return; // Agar user registration process mein nahi hai

    let step = states[senderID].step;
    let economy = fs.readJsonSync(dataPath);

    if (step === 1) { // Name input
        states[senderID].name = body;
        states[senderID].step = 2;
        api.sendMessage("✅ Name save ho gaya! Ab apne **Father ka Name** likhein:", threadID);
    } 
    else if (step === 2) { // Father's Name input
        states[senderID].fatherName = body;
        states[senderID].step = 3;
        api.sendMessage("✅ Father's Name save ho gaya! Ab apni **Age** likhein:", threadID);
    } 
    else if (step === 3) { // Age input
        states[senderID].age = body;
        states[senderID].step = 4;
        api.sendMessage("✅ Age save ho gayi! Ab apni **City** ka naam likhein:", threadID);
    } 
    else if (step === 4) { // City input
        let userData = states[senderID];
        economy[senderID] = {
            name: userData.name,
            fatherName: userData.fatherName,
            age: userData.age,
            city: body,
            xp: 0,
            level: 0,
            coins: 100, // Opening balance
            isRegistered: true
        };
        fs.writeJsonSync(dataPath, economy);
        delete states[senderID];
        
        api.sendMessage(`🎊 **MUBARAK HO!** 🎊\nAhmad bhai, aapka account open ho gaya hai!\n\n👤 Name: ${userData.name}\n👨‍👦 Father: ${userData.fatherName}\n🎂 Age: ${userData.age}\n🏙️ City: ${body}\n💰 Opening Balance: 100rs`, threadID);
    }
    fs.writeJsonSync(statePath, states);
};

module.exports.run = async function ({ api, event }) {
    const { threadID, senderID } = event;
    if (!fs.existsSync(dataPath)) fs.writeJsonSync(dataPath, {});
    let economy = fs.readJsonSync(dataPath);

    if (economy[senderID] && economy[senderID].isRegistered) {
        return api.sendMessage("⚠️ Ahmad bhai, aapka account pehle se open hai!", threadID);
    }

    if (!fs.existsSync(statePath)) fs.writeJsonSync(statePath, {});
    let states = fs.readJsonSync(statePath);

    states[senderID] = { step: 1 };
    fs.writeJsonSync(statePath, states);

    api.sendMessage("🏦 **RDX BANK REGISTRATION** 🏦\n\nChaliye account kholte hain! Sabse pehle apna **Full Name** likhein:", threadID);
};
