import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query } = req.body || {};
  if (!query) return res.status(400).json({ error: 'Missing query' });

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      // tools: [{ type: 'retrieval_tool' }] ❌ NON SUPPORTATO
    });

    const result = await model.generateContent(query);
    const text = await result.response.text();

    const sources =
      result.response.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter((c: any) => c.web) || [];

    res.status(200).json({
      text,
      sources: sources.map((c: any) => c.web),
    });
  } catch (err: any) {
    console.error('[Googlavia Error]', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
