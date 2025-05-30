// app/api/speak/route.js
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

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


const client = new TextToSpeechClient({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON),
});



function splitText(text, maxBytes = 4900) {
  const chunks = [];
  let currentChunk = '';

  const splitAndAddChunk = (sentence) => {
    // If the sentence itself is too large, split further
    while (new TextEncoder().encode(sentence).length > maxBytes) {
      const part = sentence.slice(0, Math.floor(maxBytes / 2));
      chunks.push(part);
      sentence = sentence.slice(Math.floor(maxBytes / 2));
    }
    return sentence;
  };

  text.split(/(?<=\.)|(?<=\n)/g).forEach((sentence) => {
    const encodedChunk = new TextEncoder().encode(currentChunk + sentence);
    if (encodedChunk.length > maxBytes) {
      chunks.push(currentChunk);
      currentChunk = splitAndAddChunk(sentence);
    } else {
      currentChunk += sentence;
    }
  });

  if (currentChunk) chunks.push(currentChunk);
  return chunks;
}

export async function POST(request) {
  const { text, languageCode, name } = await request.json();

  if (!text) {
    return new Response(JSON.stringify({ error: 'No text provided.' }), {
      status: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const chunks = splitText(text);
    const audioChunks = [];

    for (const chunk of chunks) {
      const [response] = await client.synthesizeSpeech({
        input: { text: chunk },
        voice: { languageCode, name },
        audioConfig: { audioEncoding: 'MP3' },
      });
      audioChunks.push(response.audioContent);
    }

    // Concatenate audio chunks
    const combinedAudio = Buffer.concat(audioChunks.map((chunk) => Buffer.from(chunk, 'base64')));

    return new Response(combinedAudio, {
      headers: {
        'Access-Control-Allow-Origin': '*',  // ✅ Correct placement
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error) {
    console.error('Error synthesizing speech:', error);
    return new Response(JSON.stringify({ error: 'Error synthesizing speech.' }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }
}
