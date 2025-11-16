const {
  GoogleGenAI,
  HarmCategory,
  HarmBlockThreshold,
} = require('@google/genai');

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

// In backend/services/aiService.js
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

/**
 * Analyzes issue text to predict category, sentiment, and a summary.
 * ... (function description is the same)
 */
const analyzeIssue = async (title, description, categories) => {
  try {
    const prompt = `
      Analyze the following community issue report.
      You must respond *only* with a valid JSON object.

      Issue Title: "${title}"
      Issue Description: "${description}"

      The *only* valid categories you can choose from are: [${categories.join(
        ', '
      )}]

      Return a JSON object with this exact structure:
      1. "predictedCategory": (string) Your best guess from the *only* the valid categories list.
      2. "sentiment": (string) The sentiment of the description (Choose one: 'positive', 'neutral', 'negative').
      3. "summary": (string) A concise one-sentence summary (max 25 words).
      4. "suggestedTags": (array of strings) 3-5 relevant keywords from the description.
    `;

    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      safetySettings,
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    // ### START FIX ###
    // We must change this to 'let' to allow modification
    let jsonText = response.text;
    if (!jsonText) {
      throw new Error('No text received from API.');
    }

    // Manually clean the response, as the model sometimes adds
    // markdown backticks even when asked for JSON.
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.substring(7, jsonText.length - 3).trim();
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.substring(3, jsonText.length - 3).trim();
    }
    // ### END FIX ###

    // This line (was line 74) will now parse the *cleaned* string
    return JSON.parse(jsonText);
    
  } catch (error) {
    console.error('Gemini API error:', error.message);
    console.error(error); // Log the full error
    return null;
  }
};

// *** NEW FUNCTION ***
/**
 * Generates a professional and empathetic reply for an admin
 * based on the issue's current status and details.
 */
const generateAiReply = async (issue) => {
  try {
    // Select a prompt based on the issue's status
    let promptInstruction = '';
    switch (issue.status) {
      case 'open':
        promptInstruction =
          "Acknowledge the user for reporting the issue and assure them that it has been received and will be reviewed by the admin team shortly. Be professional and empathetic.";
        break;
      case 'acknowledged':
        promptInstruction =
          "Inform the user that the issue has been acknowledged and is now in the queue for the maintenance or relevant team. Provide a soft assurance that it will be addressed.";
        break;
      case 'in_progress':
        promptInstruction =
          "Provide a brief update stating that the issue is actively being worked on. If an admin note is available from a previous status change, you can reference it. Reassure them that a resolution is underway.";
        break;
      case 'resolved':
        promptInstruction =
          "Inform the user that the issue has been marked as resolved. Thank them for their patience and (optional) ask them to confirm if the resolution is satisfactory.";
        break;
      default:
        promptInstruction =
          "Write a general, professional, and empathetic reply to the user about their issue report. Acknowledge their report.";
    }

    const prompt = `
      You are an AI assistant for a community admin.
      Your task is to generate a professional and empathetic reply to a resident about their reported issue.
      You must respond *only* with a valid JSON object.

      Issue Details:
      - Title: "${issue.title}"
      - Description: "${issue.description}"
      - Category: "${issue.category}"
      - Current Status: "${issue.status}"
      
      Your Instruction:
      ${promptInstruction}

      Return a JSON object with this exact structure:
      {
        "suggestedReply": "(string) The generated reply text. Keep it concise (2-3 sentences)."
      }
    `;

    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      safetySettings,
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    let jsonText = response.text;
    if (!jsonText) {
      throw new Error('No text received from AI.');
    }

    // Clean markdown backticks (your existing fix)
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.substring(7, jsonText.length - 3).trim();
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.substring(3, jsonText.length - 3).trim();
    }

    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Gemini API (generateAiReply) error:', error.message);
    // Return null or throw a specific error
    throw new Error(`AI reply generation failed: ${error.message}`);
  }
};

module.exports = { analyzeIssue, generateAiReply }; 