import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.API_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Missing query' });

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      tools: [{ googleSearch: {} }],
    });

    const result = await model.generateContent(query);
    const text = result.response.text();
    const sources = result.response.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter(c => c.web) || [];

    return res.status(200).json({ text, sources });

  } catch (err: any) {
    console.error('[Googlavia Error]', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
