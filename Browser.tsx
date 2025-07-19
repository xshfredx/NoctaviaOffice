import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';

interface GroundingChunk {
    web: {
        uri: string;
        title: string;
    };
}

interface SearchResult {
    text: string;
    sources: GroundingChunk[];
}

const Browser: React.FC = () => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<SearchResult | null>(null);

    const handleSearch = useCallback(async () => {
        if (!query.trim() || loading) return;

        if (!process.env.API_KEY) {
            setError("API_KEY environment variable not found.");
            return;
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        setLoading(true);
        setError(null);
        setResults(null);

        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: query,
                config: {
                    tools: [{ googleSearch: {} }],
                },
            });

            const text = response.text;
            const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
            const sources = groundingMetadata?.groundingChunks?.filter(chunk => chunk.web) as GroundingChunk[] || [];

            setResults({ text, sources });

        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(`Failed to fetch results: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    }, [query, loading]);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };
    
    return (
        <div className="w-full h-full p-2 sm:p-4 flex flex-col bg-black text-orange-500">
            {/* Header */}
            <div className="flex-shrink-0 flex items-center gap-2 mb-4 p-2 border-2 border-orange-800 bg-black">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Search with Googlavia..."
                    className="flex-grow bg-black text-orange-400 text-lg placeholder-gray-600 focus:outline-none px-2"
                    disabled={loading}
                />
                <button 
                    onClick={handleSearch} 
                    disabled={loading || !query.trim()}
                    className="px-4 py-1 bg-black text-orange-500 border border-orange-500 hover:bg-orange-500 hover:text-black transition-colors duration-200 uppercase text-lg text-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:text-orange-500"
                >
                    {loading ? '...' : 'Go'}
                </button>
            </div>

            {/* Content */}
            <div className="flex-grow border-2 border-orange-500 p-4 overflow-y-auto bg-black">
                {loading && (
                    <div className="flex justify-center items-center h-full">
                         <p className="text-2xl text-glow blink">Searching the net...</p>
                    </div>
                )}
                {error && (
                    <div className="flex justify-center items-center h-full text-center">
                        <div>
                            <p className="text-2xl text-red-500 text-glow">Network Error</p>
                            <p className="text-gray-400 mt-2">{error}</p>
                        </div>
                    </div>
                )}
                {results && (
                    <div className="fade-in space-y-4">
                        <p className="text-lg whitespace-pre-wrap leading-relaxed">{results.text}</p>
                        {results.sources.length > 0 && (
                            <div className="pt-4 mt-4 border-t-2 border-orange-800">
                                <h3 className="text-xl font-bold uppercase tracking-widest text-glow mb-2">Sources</h3>
                                <ul className="space-y-2 list-decimal list-inside">
                                    {results.sources.map((source, index) => (
                                        <li key={index} className="truncate">
                                            <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-white hover:underline transition-colors">
                                                {source.web.title || source.web.uri}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
                {!loading && !error && !results && (
                    <div className="flex flex-col justify-center items-center h-full text-center">
                        <h1 className="text-6xl font-bold text-glow" style={{fontVariant: 'small-caps'}}>Googlavia</h1>
                        <p className="text-gray-500 mt-2 text-lg">Your portal to the digital sea.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Browser;