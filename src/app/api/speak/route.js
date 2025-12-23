import { TextToSpeechClient } from '@google-cloud/text-to-speech';

export const runtime = 'nodejs';

const client = new TextToSpeechClient({
    credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON),
});

// 🔑 BYTE-SAFE TEXT SPLITTER
function splitText(text, maxBytes = 4500) {
    const encoder = new TextEncoder();
    const chunks = [];
    let current = '';

    const push = () => {
        if (current.trim()) {
            chunks.push(current.trim());
            current = '';
        }
    };

    const sentences = text.split(/(?<=[.!?])\s+|\n+/);

    for (let sentence of sentences) {
        while (encoder.encode(sentence).length > maxBytes) {
            let size = sentence.length;
            while (encoder.encode(sentence.slice(0, size)).length > maxBytes) {
                size = Math.floor(size * 0.9);
            }
            chunks.push(sentence.slice(0, size));
            sentence = sentence.slice(size);
        }

        const test = current ? current + ' ' + sentence : sentence;

        if (encoder.encode(test).length > maxBytes) {
            push();
            current = sentence;
        } else {
            current = test;
        }
    }

    push();
    return chunks;
}

// CORS preflight
export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}

export async function POST(req) {
    const { text, languageCode, name, pitch, playbackSpeed } = await req.json();

    if (!text) {
        return new Response(JSON.stringify({ error: 'No text' }), { status: 400 });
    }

    try {
        const chunks = splitText(text);
        const audioBuffers = [];

        for (const chunk of chunks) {
            const [response] = await client.synthesizeSpeech({
                input: { text: chunk },
                voice: { languageCode, name },
                audioConfig: {
                    audioEncoding: 'MP3',
                    sampleRateHertz: 48000,
                    speakingRate: playbackSpeed ?? 1.0,
                    pitch: pitch ?? 0,
                },
            });

            audioBuffers.push(Buffer.from(response.audioContent, 'base64'));
        }

        const finalAudio = Buffer.concat(audioBuffers);

        return new Response(finalAudio, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'audio/mpeg',
            },
        });

    } catch (err) {
        console.error(err);
        return new Response(
            JSON.stringify({ error: err.message }),
            { status: 500 }
        );
    }
}
