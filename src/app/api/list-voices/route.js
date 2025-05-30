import { TextToSpeechClient } from '@google-cloud/text-to-speech';

const client = new TextToSpeechClient({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON),
});

export async function GET() {
  try {
    const [result] = await client.listVoices({});
    const languages = result.voices.map((voice) => ({
      code: voice.languageCodes[0],
      name: voice.name,
      ssmlGender:voice.ssmlGender,
    }));
    // console.log(result);

    // Filter unique language codes
    // const uniqueLanguages = Array.from(new Set(languages.map((lang) => lang.code))).map((code) => ({
    //   code,
    //   name: languages.find((lang) => lang.code === code).name,
    // }));

    // return new Response(JSON.stringify({ languages: uniqueLanguages }), {
      return new Response(JSON.stringify({ languages: languages }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error listing voices:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch voices.' }), { status: 500 });
  }
}
