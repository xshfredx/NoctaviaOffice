import React, { useState, useCallback } from 'react';

interface Source {
  uri: string;
  title: string;
}

const Browser: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [sources, setSources] = useState<Source[]>([]);
  const [error, setError] = useState('');

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResponse('');
    setSources([]);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Unknown error');
      setResponse(data.text);
      setSources(data.sources || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }, [query]);

  return (
    <div className="p-4 text-orange-400 bg-black h-full">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSearch()}
        placeholder="Ask Googlavia..."
        className="w-full p-2 bg-black border border-orange-500 text-lg"
      />
      <button
        onClick={handleSearch}
        disabled={loading}
        className="mt-2 px-4 py-2 border text-orange-400 border-orange-500 hover:bg-orange-500 hover:text-black"
      >
        {loading ? 'Loading...' : 'Search'}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}
      {response && <pre className="mt-4 whitespace-pre-wrap">{response}</pre>}

      {sources.length > 0 && (
        <div className="mt-4 border-t border-orange-700 pt-2">
          <h3 className="text-orange-300 uppercase text-sm mb-2">Sources</h3>
          <ul className="space-y-1 text-sm list-disc list-inside">
            {sources.map((s, i) => (
              <li key={i}>
                <a href={s.uri} target="_blank" rel="noopener noreferrer" className="hover:underline text-orange-400">
                  {s.title || s.uri}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Browser;
