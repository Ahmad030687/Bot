const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "edit",
  version: "1.3.0",
  hasPermssion: 0,
  credits: "SARDAR RDX (Fixed by Gemini)",
  description: "Edit images using NanoBanana AI",
  commandCategory: "Media",
  usages: "[prompt] - Reply to an image",
  prefix: true,
  cooldowns: 10
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, messageReply, type } = event;

  if (type !== "message_reply" || !messageReply) {
    return api.sendMessage(
      "⚠️ Please reply to an image with your edit prompt!\n\n📝 Usage: edit [prompt]",
      threadID,
      messageID
    );
  }

  if (!messageReply.attachments || messageReply.attachments.length === 0) {
    return api.sendMessage(
      "❌ The message you replied to doesn't contain any image!",
      threadID,
      messageID
    );
  }

  const attachment = messageReply.attachments[0];
  if (attachment.type !== "photo") {
    return api.sendMessage(
      "❌ Please reply to an image, not a " + attachment.type + "!",
      threadID,
      messageID
    );
  }

  const prompt = args.join(" ");
  if (!prompt) {
    return api.sendMessage(
      "❌ Please provide an edit prompt!\n\n📝 Usage: edit [prompt]",
      threadID,
      messageID
    );
  }

  const imageUrl = attachment.url;

  const processingMsg = await api.sendMessage(
    "🎨 Processing your image edit request...\n⏳ This may take a few moments...",
    threadID
  );

  try {
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir);
    }

    // UPDATED: Fresh Cookie String from your latest input
    const cookie = "_gcl_au=1.1.378371578.1770294559; _ga=GA1.1.44598217.1770294562; __Secure-BUCKET=CLgH; AEC=AaJma5ucOx7hfsGBPXZhSu-GfCcekK3S4gGoX4u1BIwTzfdbNf66sYEwdw; SID=g.a0006QiwLyYuoTfkKUVNkbYYzc9QRSFaHVYRXTHOmZdf4LcBTeWmcvb4ugiOJ7qPFxXeozSZ9gACgYKATsSARMSFQHGX2Mivx6862AkewAphnDGuxFS5BoVAUF8yKo5px01bMIwGF7rMUnLrxWB0076; __Secure-1PSID=g.a0006QiwLyYuoTfkKUVNkbYYzc9QRSFaHVYRXTHOmZdf4LcBTeWmtYFGIZFcxBGElmMMkAnM2AACgYKAToSARMSFQHGX2MiMEr6sujisKxyvMSg3hZstRoVAUF8yKrVem0XeaBxpjsCOrrjzpaN0076; __Secure-3PSID=g.a0006QiwLyYuoTfkKUVNkbYYzc9QRSFaHVYRXTHOmZdf4LcBTeWmhe3hUUTPF-OQY9vD9HvMzAACgYKAbUSARMSFQHGX2MiPjP4zyW_5ejnoPUMHu6V5xoVAUF8yKpY9mayOt2nqN7kbaAhh46r0076; HSID=AX-zetFyNV00ue4Zj; SSID=ASZhYGIDDxe6FAXFO; APISID=TXAuWqcLxVqM9gsy/AZfSZ1RADQjbS_qqc; SAPISID=jfGEetuq2LhNFL1O/AFLTbRz0sk_Vmtg7Z; __Secure-1PAPISID=jfGEetuq2LhNFL1O/AFLTbRz0sk_Vmtg7Z; __Secure-3PAPISID=jfGEetuq2LhNFL1O/AFLTbRz0sk_Vmtg7Z; SEARCH_SAMESITE=CgQIiaAB; __Secure-STRP=AD6DogvT11qSV_7jtMFLPgQSLWjkCSUaftZRLBaV05m3upP0meWb2ZqQwqQOYfhuuNw4TfDijPxY9LrLk7ELcm_68M5G6_K4M5nG; NID=528=MlBanOf6nsohsR98geV4_mAkYRUMg-8OfLnmP7UcrizJcMztC9h3gLUq420CM7qwQD6MMd6Rowjz9Fo7d7nTYtkdIaEIZYuTyPT59k-caBF0v1W5i-V7zyEzw1hMAiOkygHAR_RpcGAsLMKUL7K-bgfBjwsYvCQs3nXcme37GNCMGFcxzyKdoTwMwaYhLGB6_KY53fV1PZS6bbMRcEsBUzNnnH6ELCFjFIIHc-DBI4Ofd2SqnelPtE8Dk7kS5_RO4b7RKE7ZhNYcgvMsxKaYwOYKrp67rx1LFrBuduycyiQcxX-aLPiQdhg-MX6UNERgYjQ7S2vRcKF3P20xwv6IcjeDbcGIkEeGl2oYZLnxhbPhv7MM9JwclOd0tXs2If-rQLzo87Fl3zhVodMVnJzHSY1q1ErTbClAAVTsrl21z5uVEP17TYCpAIgZps8jmHcrZ2g30IJsaezArqkiOLyJVR397NDMkXtnJjUna0kDuZe5PlT8XUpKANthxHE7_YIo63Fw6svsZgMawwzkAstiLXvkhDoV8D-bvmCFtqSnbVaj0gW7ZiGp9voagFS23ghNM78jgPivDx7GSSqM2_ZBd0MbZm6rnBxlvOEmpaAL9MS2tDHLuWWMbMr6KnU9fkKPc_arJR0Jn4Tqsv2ajaOQxtzKjSkN6tXxeaZxK1eMKd8Q-fH0GeSGYOnorfShNDFQRbBBINEv31ck8hWd9GwD6GFY; SIDCC=AKEyXzVnpveJrnCBbrcn5u9kwzZ8hlNZEHp1RtXSErcx1Bux6jZuslCdhQE0R52h3P0FH9QvGg; __Secure-1PSIDCC=AKEyXzWXCD75z0WDXdQoC_jqWJrLsK2MadeqeMR_L4pQ_F3MWCac1qS0Leqvcj34Xts_KaTF; __Secure-3PSIDCC=AKEyXzWBle74lQd0GSRLR6-3jL096HJho6S2bjCwxPTSaA-MgYkk_CtWMaByZbCNg3A27Vi_qw;";
    
    const apiUrl = `https://anabot.my.id/api/ai/geminiOption?prompt=${encodeURIComponent(prompt)}&type=NanoBanana&imageUrl=${encodeURIComponent(imageUrl)}&cookie=${encodeURIComponent(cookie)}&apikey=freeApikey`;

    // 1. Request as TEXT first to avoid JSON parse errors
    const response = await axios.get(apiUrl, {
      responseType: 'text',
      timeout: 60000
    });

    // 2. Manual JSON Parsing with Error Check
    let data;
    try {
        data = JSON.parse(response.data);
    } catch (e) {
        // If parsing fails, it's HTML (API Down/Auth Failed)
        if (response.data.includes("<!doctype html>") || response.data.includes("<html>")) {
            throw new Error("API_DOWN_HTML");
        }
        throw new Error("API returned invalid data (Not JSON)");
    }

    // 3. Handle Logical Errors
    if (data.status === 500 || data.error) {
      throw new Error(`API Error: ${data.error || 'Unknown Server Error'}`);
    }

    const resultUrl = data.result?.url || data.data?.result?.url || data.url;
    
    if (!resultUrl) {
      console.log("Debug Response:", data); // For debugging purposes
      throw new Error("No edited image URL found in API response.");
    }

    // 4. Download Image
    const fileName = `edit_${Date.now()}.png`;
    const filePath = path.join(cacheDir, fileName);
    
    const imageResponse = await axios({
      url: resultUrl,
      method: "GET",
      responseType: "stream",
      timeout: 60000
    });

    const writer = fs.createWriteStream(filePath);
    imageResponse.data.pipe(writer);

    writer.on("finish", () => {
      api.unsendMessage(processingMsg.messageID);

      api.sendMessage(
        {
          body: `✨ Image edited successfully!\n\n📝 Prompt: ${prompt}\n\n🎨 Powered by NanoBanana AI`,
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        () => {
          fs.unlinkSync(filePath);
        },
        messageID
      );
    });

    writer.on("error", (err) => {
      console.error("Error downloading edited image:", err);
      api.unsendMessage(processingMsg.messageID);
      api.sendMessage(
        "❌ Failed to download the edited image.",
        threadID,
        messageID
      );
    });

  } catch (error) {
    console.error("Error in edit command:", error);
    api.unsendMessage(processingMsg.messageID);
    
    let errorMessage = "❌ An error occurred.";
    
    if (error.message === 'API_DOWN_HTML') {
        errorMessage = "❌ **API Error:** The external server is down and returned a webpage instead of data.\n\n💡 Reason: The API `anabot.my.id` might be rejecting the cookie or is temporarily unstable.";
    } else if (error.message.includes('Not JSON')) {
        errorMessage = "❌ **API Error:** The server returned garbled data. Please try again later.";
    } else if (error.code === 'ETIMEDOUT') {
        errorMessage = "❌ Request timeout. The API is taking too long.";
    } else {
        errorMessage += `\n\n📌 Error: ${error.message}`;
    }
    
    api.sendMessage(errorMessage, threadID, messageID);
  }
};
