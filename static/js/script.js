// Variables
let userName = ""; // Store user's name
let chatHistory = []; // Store conversation context
const apiKey = "5LzA4S5WJNKAi5u7VpwYjePWCTs9mCkptiX021W666lqMmRhgYxzJQQJ99BAACYeBjFXJ3w3AAABACOGhRDz"; // Azure OpenAI API key
const apiUrl = "https://cpd-accreditors-oai.openai.azure.com/openai/deployments/CPDAccreditor/chat/completions?api-version=2024-08-01-preview"; // Azure OpenAI endpoint
const storageAccountUrl = "https://cpdaccrfunctionstorage.blob.core.windows.net"; // Azure Blob Storage URL
const sasToken = "?sv=2022-11-02&ss=b&srt=co&sp=rwdlx&se=2026-01-22T14:25:11Z&st=2025-01-22T06:25:11Z&spr=https&sig=43OKpijD1btncv4AFKxelAjTvWsuhiC27YLZdLGB9EA%3D"; // SAS token for uploads
const speechApiKey = "EnSj467Qqpf14u8q8V2wtQr1gwwStUvVMiJZQq6QvhZ0DOO9RvxyJQQJ99BAACYeBjFXJ3w3AAAYACOGshHm"; // Azure Speech API key
const speechEndpoint = "https://eastus.api.cognitive.microsoft.com/"; // Azure Speech Service endpoint
let isBotProcessing = false; // Prevent overlapping responses
let lastUploadedFileUrl = ""; // Store last uploaded file URL for transcription
const MAX_FILE_SIZE_MB = 100; // Maximum file size for uploads

// Knowledge Base for Static Responses
const knowledgeBase = {
  "what is cpd accreditation?": `
  📘 **What is CPD Accreditation?**
  CPD accreditation ensures professional development activities meet industry standards. It is designed for Australian Relevant Providers and GTPAs.
  ✅ **Next Steps**:
  If you'd like to submit content for CPD accreditation, let me know! I'll guide you through the process.`,
  "what file types are supported?": `
  📂 **Supported File Types**
  - **Audio/Video**: MP4, AVI, MOV, MKV, MP3, WAV, OGG
  - **Articles**: PDF, DOC, DOCX, TXT
  - **Presentations**: PPT, PPTX, PDF`,
};

// Scroll the chat area to the bottom
function scrollChatToBottom() {
  const chatArea = document.getElementById("chat-area");
  chatArea.scrollTop = chatArea.scrollHeight; // Scroll to the bottom
}

// Attach Event Listeners on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  const videoUpload = document.getElementById("video-upload");
  const articleUpload = document.getElementById("article-upload");
  const presentationUpload = document.getElementById("presentation-upload");

  videoUpload.addEventListener("change", (event) => handleFileUpload(event, "video"));
  articleUpload.addEventListener("change", (event) => handleFileUpload(event, "article"));
  presentationUpload.addEventListener("change", (event) => handleFileUpload(event, "presentation"));

  document.getElementById("message-box").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      processUserMessage(event.target.value);
      event.target.value = ""; // Clear the input field
    }
  });

  startNewChat();
});

// Start a new chat
function startNewChat() {
  userName = "";
  chatHistory = [];
  const chatArea = document.getElementById("chat-area");
  chatArea.innerHTML = ""; // Clear the chat area
  displayBotMessage("Welcome to Ensombl CPD Accreditation. How can I assist you today?");
}

// Detect user intention for uploading files
function detectFileUploadIntent(message) {
  const lowerMessage = message.toLowerCase();
  const uploadKeywords = ["upload", "video", "audio", "file", "transcription"];
  return uploadKeywords.some((keyword) => lowerMessage.includes(keyword));
}

// Process user messages
async function processUserMessage(userMessage) {
  if (isBotProcessing) return;

  displayUserMessage(userMessage);
  isBotProcessing = true;

  try {
    if (userMessage.toLowerCase() === "yes" && lastUploadedFileUrl) {
      displayBotMessage("Starting transcription... Please wait.");
      const transcription = await transcribeAudioFile(lastUploadedFileUrl);
      if (transcription) {
        displayBotMessage("✅ Transcription completed successfully.");
        displayBotMessage(`**Transcription Text:** ${transcription}`);
      } else {
        displayBotMessage("❌ Transcription failed. Please try again.");
      }
      lastUploadedFileUrl = ""; // Reset after processing
    } else if (userMessage.toLowerCase() === "no") {
      displayBotMessage("Transcription skipped. Let me know if you need any other assistance.");
      lastUploadedFileUrl = ""; // Reset after user declines
    } else if (detectFileUploadIntent(userMessage)) {
      displayBotMessage(`
        It seems you'd like to upload a file! Please use the buttons above to upload:
        - **Video or Audio**: Click "Upload Video or Audio."
        - **Written Content**: Click "Upload Written Content."
        - **Presentation**: Click "Upload Upcoming Presentation."
        Supported file types include:
        - **Video/Audio**: MP4, AVI, MOV, MKV, MP3, WAV, OGG
        - **Written Files**: PDF, DOC, DOCX, TXT
        - **Presentations**: PPT, PPTX, PDF.
      `);
    } else {
      const staticResponse = knowledgeBase[userMessage.toLowerCase()];
      if (staticResponse) {
        displayBotMessage(staticResponse);
      } else {
        const botResponse = await getBotResponse(userMessage);
        displayBotMessage(botResponse);
      }
    }
  } catch (error) {
    console.error("Error processing user message:", error);
    displayBotMessage("I'm sorry, something went wrong. Please try again.");
  } finally {
    isBotProcessing = false;
  }
}

// Handle file uploads
async function handleFileUpload(event, fileType) {
  const file = event.target.files[0];
  if (!file) {
    displayBotMessage("No file selected. Please try again.");
    return;
  }

  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    displayBotMessage(`File too large. Please upload a file smaller than ${MAX_FILE_SIZE_MB} MB.`);
    return;
  }

  const allowedExtensions = {
    video: [".mp4", ".avi", ".mov", ".mkv", ".mp3", ".wav", ".ogg"],
    article: [".pdf", ".doc", ".docx", ".txt"],
    presentation: [".ppt", ".pptx", ".pdf"],
  };

  const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
  if (!allowedExtensions[fileType]?.includes(fileExtension)) {
    displayBotMessage(`Invalid file type. "${file.name}" cannot be uploaded as a "${fileType}". Please upload a valid file.`);
    return;
  }

  const containerMap = {
    video: "video-audio-files",
    article: "articles",
    presentation: "presentations",
  };
  const containerName = containerMap[fileType];

  try {
    displayBotMessage(`Uploading "${file.name}" (${fileType})...`);
    const blobServiceClient = new AzureStorageBlob.BlobServiceClient(`${storageAccountUrl}${sasToken}`);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(file.name);

    await blockBlobClient.uploadBrowserData(file);
    lastUploadedFileUrl = blockBlobClient.url; // Save the file URL for transcription
    displayBotMessage(`File "${file.name}" uploaded successfully to "${containerName}". Would you like to transcribe this file? Type **"yes"** to proceed or **"no"** to skip.`);
  } catch (error) {
    console.error("File upload error:", error);
    displayBotMessage("❌ An error occurred during the upload. Please try again.");
  }
}

// Transcribe audio or video file using Batch speechtotext
async function transcribeAudioFile(audioUrl) {
  try {
    const transcriptionRequestBody = {
      displayName: "Batch Transcription Job",
      locale: "en-US",
      contentUrls: [audioUrl],
      properties: {
        punctuationMode: "DictatedAndAutomatic",
        profanityFilterMode: "Masked",
      },
    };

    const response = await fetch(`${speechEndpoint}speechtotext/v3.2/transcriptions`, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": speechApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transcriptionRequestBody),
    });

    if (!response.ok) {
    const errorDetails = await response.json();
    console.error("Error in transcription request:", errorDetails);
    throw new Error(`Transcription failed: ${errorDetails.error.message}`);
	}


    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in transcription request:", error);
    return null;
  }
}

// Fetch dynamic bot response
async function getBotResponse(userMessage) {
  try {
    const headers = { "Content-Type": "application/json", "api-key": apiKey };
    chatHistory.push({ role: "user", content: userMessage });

    const body = {
      messages: [
        { role: "system", content: "You are a highly intelligent assistant specializing in CPD accreditation." },
        ...chatHistory,
      ],
      max_tokens: 4000,
      temperature: 0.7,
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

    const data = await response.json();
    const botResponse = data.choices[0].message.content.trim();

    chatHistory.push({ role: "assistant", content: botResponse });
    return botResponse;
  } catch (error) {
    console.error("Error fetching bot response:", error);
    return "I'm sorry, I couldn't fetch a response right now. Please try again later.";
  }
}


// Display bot message
function displayBotMessage(message) {
  const chatArea = document.getElementById("chat-area");
  const botBubble = document.createElement("div");
  botBubble.classList.add("chat-bubble", "bot-message");

  const formattedMessage = message.split("\n").map((line) => `<p>${line}</p>`).join("");
  botBubble.innerHTML = formattedMessage;

  chatArea.appendChild(botBubble);
  scrollChatToBottom();
}

// Display user message
function displayUserMessage(message) {
  const chatArea = document.getElementById("chat-area");
  const userBubble = document.createElement("div");
  userBubble.classList.add("chat-bubble", "user-message");
  userBubble.textContent = message;

  chatArea.appendChild(userBubble);
  scrollChatToBottom();
}
