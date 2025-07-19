import React, { useState, useCallback, useRef, useEffect } from 'react';

// Interfaces
interface TokenInfo {
    name: string;
    symbol: string;
    priceUsd: string;
    marketCapUsd: string;
    volumeUsd: { h24: string };
}

type ChartDataPoint = [number, number, number, number, number, number];
type Timeframe = '5m' | '1H' | '4H' | '1D';

// Helper to format large numbers
const formatNumber = (numStr: string | undefined): string => {
    if (!numStr) return 'N/A';
    const num = parseFloat(numStr);
    if (isNaN(num)) return 'N/A';
    if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `$${(num / 1_000).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
};

const DexTerm: React.FC = () => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingChart, setLoadingChart] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
    const [chartData, setChartData] = useState<ChartDataPoint[] | null>(null);
    const [poolAddress, setPoolAddress] = useState<string | null>(null);
    const [timeframe, setTimeframe] = useState<Timeframe>('1H');
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const fetchChartData = useCallback(async (poolAddr: string, tf: Timeframe) => {
        setLoadingChart(true);
        setChartData(null);
        setError(null);

        let url: string;
        switch (tf) {
            case '5m':
                url = `https://api.geckoterminal.com/api/v2/networks/solana/pools/${poolAddr}/ohlcv/minute?aggregate=5&limit=200`;
                break;
            case '4H':
                url = `https://api.geckoterminal.com/api/v2/networks/solana/pools/${poolAddr}/ohlcv/hour?aggregate=4&limit=200`;
                break;
            case '1D':
                 url = `https://api.geckoterminal.com/api/v2/networks/solana/pools/${poolAddr}/ohlcv/day?limit=200`;
                break;
            case '1H':
            default:
                url = `https://api.geckoterminal.com/api/v2/networks/solana/pools/${poolAddr}/ohlcv/hour?limit=200`;
                break;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch ${tf} chart data.`);
            const data = await response.json();
            const ohlcvList = data.data.attributes.ohlcv_list;
            if (!ohlcvList || ohlcvList.length === 0) throw new Error('No chart data available for this timeframe.');
            setChartData(ohlcvList);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(errorMessage);
        } finally {
            setLoadingChart(false);
        }
    }, []);

    const handleSearch = useCallback(async () => {
        if (!query.trim() || loading) return;

        setLoading(true);
        setError(null);
        setTokenInfo(null);
        setChartData(null);
        setPoolAddress(null);

        try {
            const searchResponse = await fetch(`https://api.geckoterminal.com/api/v2/search/pools?query=${query}`);
            if (!searchResponse.ok) throw new Error('Failed to find token pool.');
            const searchData = await searchResponse.json();
            const poolAddr = searchData.data?.[0]?.attributes?.address;
            if (!poolAddr) throw new Error('No liquidity pool found for this token address.');
            
            setPoolAddress(poolAddr);

            const poolResponse = await fetch(`https://api.geckoterminal.com/api/v2/networks/solana/pools/${poolAddr}`);
            if (!poolResponse.ok) throw new Error('Failed to fetch token details.');
            
            const poolData = await poolResponse.json();
            const baseToken = poolData.data?.relationships?.base_token?.data;
            if (!baseToken) throw new Error('Could not identify base token in pool.');
            
            const attributes = poolData.data.attributes;
            const extractedInfo: TokenInfo = {
                name: attributes.name,
                symbol: baseToken.id.split('_')[1] || 'N/A',
                priceUsd: attributes.base_token_price_usd,
                marketCapUsd: attributes.market_cap_usd,
                volumeUsd: attributes.volume_usd,
            };

            setTokenInfo(extractedInfo);
            await fetchChartData(poolAddr, timeframe);

        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [query, loading, timeframe, fetchChartData]);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSearch();
    };

    const handleTimeframeChange = (tf: Timeframe) => {
        setTimeframe(tf);
        if (poolAddress) {
            fetchChartData(poolAddress, tf);
        }
    };
    
    // Canvas drawing effect for candlestick chart
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas || !chartData || chartData.length === 0) {
            if (ctx && canvas) {
                ctx.fillStyle = '#0c0c0c';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            return;
        }

        const highs = chartData.map(d => d[2]);
        const lows = chartData.map(d => d[3]);
        const minPrice = Math.min(...lows);
        const maxPrice = Math.max(...highs);
        const priceRange = maxPrice - minPrice;

        const rightPadding = 60;
        const chartWidth = canvas.width - rightPadding;
        
        ctx.fillStyle = '#0c0c0c';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const candleWidth = Math.max(1, (chartWidth / chartData.length) * 0.7);

        chartData.forEach((d, index) => {
            const [timestamp, open, high, low, close] = d;
            
            const x = (index / chartData.length) * chartWidth + candleWidth * 0.5;

            const yHigh = canvas.height - ((high - minPrice) / priceRange) * canvas.height;
            const yLow = canvas.height - ((low - minPrice) / priceRange) * canvas.height;
            const yOpen = canvas.height - ((open - minPrice) / priceRange) * canvas.height;
            const yClose = canvas.height - ((close - minPrice) / priceRange) * canvas.height;

            const isUpCandle = close >= open;
            ctx.strokeStyle = isUpCandle ? '#f97316' : '#ffffff';
            ctx.fillStyle = isUpCandle ? '#f97316' : '#ffffff';

            // Wick
            ctx.beginPath();
            ctx.moveTo(x + candleWidth / 2, yHigh);
            ctx.lineTo(x + candleWidth / 2, yLow);
            ctx.stroke();

            // Body
            ctx.fillRect(x, Math.min(yOpen, yClose), candleWidth, Math.max(1, Math.abs(yOpen - yClose)));
        });

        // Price Axis
        ctx.fillStyle = '#f97316';
        ctx.font = "14px 'VT323', monospace";
        ctx.textAlign = 'left';
        
        const numLabels = 5;
        for (let i = 0; i <= numLabels; i++) {
            const price = minPrice + (priceRange / numLabels) * i;
            const y = canvas.height - (canvas.height / numLabels) * i;
            ctx.fillText(`$${price.toPrecision(4)}`, chartWidth + 5, y - 5);
            
            ctx.strokeStyle = 'rgba(249, 115, 22, 0.2)';
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(chartWidth, y);
            ctx.stroke();
        }

    }, [chartData]);
    
    return (
        <div className="w-full h-full p-2 sm:p-4 flex flex-col bg-black text-orange-500 font-mono">
            {/* Header */}
            <div className="flex-shrink-0 flex items-center gap-2 mb-4 p-2 border-2 border-orange-800 bg-black">
                <label htmlFor="ca-input" className="text-glow text-lg uppercase">CA:</label>
                <input
                    id="ca-input"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter Solana contract address..."
                    className="flex-grow bg-black text-orange-400 text-lg placeholder-gray-600 focus:outline-none px-2"
                    disabled={loading}
                />
                <button 
                    onClick={handleSearch} 
                    disabled={loading || !query.trim()}
                    className="px-4 py-1 bg-black text-orange-500 border border-orange-500 hover:bg-orange-500 hover:text-black transition-colors duration-200 uppercase text-lg text-glow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? '...' : 'Scan'}
                </button>
            </div>

            {/* Content */}
            <div className="flex-grow border-2 border-orange-500 p-4 bg-black overflow-hidden flex flex-row gap-4">
                {(loading && !tokenInfo) && (
                    <div className="w-full flex justify-center items-center">
                         <p className="text-2xl text-glow blink">Scanning GeckoTerminal...</p>
                    </div>
                )}
                {error && !loadingChart && (
                    <div className="w-full flex justify-center items-center text-center">
                        <div>
                            <p className="text-2xl text-red-500 text-glow">Scan Failed</p>
                            <p className="text-gray-400 mt-2">{error}</p>
                        </div>
                    </div>
                )}
                {tokenInfo && (
                    <div className="w-full h-full flex flex-row gap-4 fade-in">
                        {/* Left Panel: Stats */}
                        <div className="w-1/3 flex flex-col space-y-3 pr-4 border-r-2 border-orange-800">
                            <h2 className="text-3xl font-bold text-glow truncate" title={tokenInfo.name}>{tokenInfo.name} (${tokenInfo.symbol})</h2>
                            <div className="space-y-2 text-xl">
                                <p>Price: <span className="text-white">${parseFloat(tokenInfo.priceUsd).toPrecision(5)}</span></p>
                                <p>Market Cap: <span className="text-white">{formatNumber(tokenInfo.marketCapUsd)}</span></p>
                                <p>Volume (24h): <span className="text-white">{formatNumber(tokenInfo.volumeUsd.h24)}</span></p>
                            </div>
                        </div>
                        {/* Right Panel: Chart */}
                        <div className="w-2/3 flex flex-col">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl uppercase text-glow">Price Chart</h3>
                                <div className="flex gap-1">
                                    {(['5m', '1H', '4H', '1D'] as Timeframe[]).map(tf => (
                                        <button 
                                            key={tf}
                                            onClick={() => handleTimeframeChange(tf)}
                                            className={`px-2 py-1 border text-sm uppercase transition-colors ${timeframe === tf ? 'bg-orange-500 text-black border-orange-500' : 'bg-black text-orange-500 border-orange-800 hover:bg-orange-900/50'}`}
                                        >{tf}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex-grow border border-orange-800 relative">
                                {(loadingChart || (loading && !chartData)) && <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-glow blink">Loading Chart...</div>}
                                <canvas ref={canvasRef} className="w-full h-full"></canvas>
                            </div>
                        </div>
                    </div>
                )}
                {!loading && !error && !tokenInfo && (
                    <div className="w-full flex flex-col justify-center items-center text-center">
                        <h1 className="text-6xl font-bold text-glow">DexTerm</h1>
                        <p className="text-gray-500 mt-2 text-lg">Real-time crypto terminal.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DexTerm;
