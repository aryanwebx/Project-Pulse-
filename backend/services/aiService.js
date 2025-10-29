const {
  GoogleGenAI,
  HarmCategory,
  HarmBlockThreshold,
} = require('@google/genai');

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
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

module.exports = { analyzeIssue };