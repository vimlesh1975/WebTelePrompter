import { TranslationServiceClient } from '@google-cloud/translate';

// Handle preflight OPTIONS requests
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*', // Change to your frontend origin
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}


const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

const client = new TranslationServiceClient({
  credentials,
});

function splitTextForTranslation(text, maxChars = 25000) {
  const chunks = [];
  let currentChunk = '';

  const sentenceDelimiterRegex = /(?<=[.?!।|।۔])\s*/g;
  const sentences = text.split(sentenceDelimiterRegex);

  sentences.forEach((sentence) => {
    if ((currentChunk + sentence).length > maxChars) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence + ' ';
    }
  });

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

export async function POST(request) {
  const { text, targetLanguage } = await request.json();

  if (!text || !targetLanguage) {
    return new Response(JSON.stringify({ error: 'Text and target language are required.' }), {
      status: 400, headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const projectId = credentials.project_id;
    const location = 'global'; // Use 'global' for non-regionalized translations
    const parent = `projects/${projectId}/locations/${location}`;

    // Split text into chunks if necessary
    const textChunks = splitTextForTranslation(text, 30000);

    // Translate each chunk
    const translatedChunks = await Promise.all(
      textChunks.map(async (chunk) => {
        const [response] = await client.translateText({
          contents: [chunk],
          targetLanguageCode: targetLanguage,
          parent,
        });
        return response.translations[0].translatedText;
      })
    );

    // Combine all translated chunks
    const translatedText = translatedChunks.join(' ');

    return new Response(JSON.stringify({ translatedText }), {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Translation API error:', error);
    return new Response(JSON.stringify({ error: 'Failed to translate text.' }), {
      status: 500, headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }
}
