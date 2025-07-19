// File: api/search.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
  runtime: 'edge', // compatibilità Vercel edge runtime
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
    });
  }

  try {
    const { query } = await req.json();
    if (!query) {
      return new Response(JSON.stringify({ error: 'Missing query' }), {
        status: 400,
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(query);
    const text = await result.response.text();

    const sources =
      result.response.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter(
        (c: any) => c.web
      ) ?? [];

    return new Response(
      JSON.stringify({
        text,
        sources: sources.map((c: any) => c.web),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error('[Googlavia API Error]', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
      status: 500,
    });
  }
}
