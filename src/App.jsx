import { useState } from 'react';
import './App.css';

const reverseStr = (s) => s.split('').reverse().join('');

const detectProvider = (u) => {
    try {
        const host = new URL(u).host.toLowerCase();
        if (host.includes('shorturl.at')) return { id: 1, provider: 'shorturl' };
        if (host.includes('tinyurl.com')) return { id: 2, provider: 'tinyurl' };
        if (host.includes('bit.ly') || host.includes('bitly')) return { id: 3, provider: 'bitly' };
        return { id: 0, provider: host };
    } catch {
        return { id: 0, provider: 'unknown' };
    }
};

const extractToken = (u) => {
    try {
        const parsed = new URL(u);
        let p = parsed.pathname || '';
        if (p.endsWith('/')) p = p.slice(0, -1);
        const parts = p.split('/');
        return parts[parts.length - 1] || '';
    } catch {
        // fallback: simple split
        const s = u.replace(/\/+$/, '');
        const parts = s.split('/');
        return parts[parts.length - 1].split('?')[0].split('#')[0] || '';
    }
};

// Helpers for new algorithm
const swapParts = (s) => {
    const m = s.length;
    if (m % 2 === 0) {
        const half = m / 2;
        const left = s.slice(0, half);
        const right = s.slice(half);
        return right + left;
    } else {
        const leftLen = Math.floor(m / 2);
        // const rightLen = leftLen;
        const left = s.slice(0, leftLen);
        const middle = s.charAt(leftLen);
        const right = s.slice(leftLen + 1);
        return right + middle + left;
    }
};

const shiftChar = (ch, delta) => {
    const code = ch.charCodeAt(0);
    // lowercase
    if (ch >= 'a' && ch <= 'z') {
        const base = 'a'.charCodeAt(0);
        const len = 26;
        return String.fromCharCode(((code - base + delta + len) % len) + base);
    }
    // uppercase
    if (ch >= 'A' && ch <= 'Z') {
        const base = 'A'.charCodeAt(0);
        const len = 26;
        return String.fromCharCode(((code - base + delta + len) % len) + base);
    }
    // digits
    if (ch >= '0' && ch <= '9') {
        const base = '0'.charCodeAt(0);
        const len = 10;
        return String.fromCharCode(((code - base + delta + len) % len) + base);
    }
    // fallback: shift unicode
    return String.fromCharCode(code + delta);
};

const altShift = (s, startDelta = 2) => {
    // startDelta positive for encode (+2 first), negative for decode
    let delta = startDelta;
    return s.split('').map((ch) => {
        const out = shiftChar(ch, delta);
        delta = -delta; // alternate +2, -2
        return out;
    }).join('');
};

// Encodes a short URL into the Skyra code format using user's algorithm steps 2-5
const encodeSkyra = (url) => {
    const prov = detectProvider(url);
    let token = extractToken(url);
    if (!token) throw new Error('Could not extract token from URL');
    const n = token.length;

    let temp = "";

    for (let i = 0; i < token.length; i++) {

        if (token[i] >= 'a' && token[i] <= 'z') {
            temp += token[i].toUpperCase();
        }
        else if (token[i] >= 'A' && token[i] <= 'Z') {
            temp += token[i].toLowerCase();
        }
        else {
            temp += token[i];
        }
    }
    // replace old token
    token = temp;


    // Step 2: last + first + middle
    const first = token.charAt(0) || '';
    const last = token.charAt(n - 1) || '';
    const middle = n > 2 ? token.slice(1, n - 1) : (n === 2 ? '' : '');
    const step2 = last + first + middle;

    // Step 3: divide and swap (right + middle + left for odd, right+left for even)
    const step3 = swapParts(step2);

    // Step 4: alternate +2, -2 starting with +2
    const step4 = altShift(step3, 2);

    // Step 5: reverse
    const finalCore = reverseStr(step4);

    const encodedWithPrefix = `DP-${prov.id}${finalCore}`;

    return {
        originalUrl: url,
        providerId: prov.id,
        provider: prov.provider,
        shortCode: token,
        encoded: encodedWithPrefix,
        decoded: token
    };
};

const CopyButton = ({ textToCopy }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        if (!textToCopy) return;
        navigator.clipboard.writeText(textToCopy).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <button onClick={handleCopy} className="copy-btn" title="Copy to clipboard">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isCopied ? <polyline points="20 6 9 17 4 12"></polyline> : <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>}
                {isCopied ? null : <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>}
            </svg>
        </button>
    );
};

function App() {
    const [url, setUrl] = useState("");
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState("");

    const handleEncode = async () => {
        if (!url) {
            setError('Please enter a URL to process.');
            return;
        }

        setLoading(true);
        setResult(null);
        setError("");
        setStatusMsg("");

        try {
            const data = encodeSkyra(url);
            setResult(data);
            setStatusMsg('Encoded successfully');
        } catch (err) {
            setError(err.message || 'Encoding failed');
            setStatusMsg('');
        }

        setLoading(false);
    };

    // decoding option removed from UI — only encoding is shown

    return (
        <div className="App">
            <header className="App-header">
                <img src="/logo.png" alt="Skyra Logo" className="logo" />
                <h1>Skyra Encoder</h1>
                <p className="subtitle">Paste a short URL (shorturl, tinyurl, bitly) to <br /> Generate Skyra Access Code.</p>
            </header>

            <main className="card">
                <div className="input-group">
                    <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></svg>
                    <input
                        id="input-url"
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="e.g. https://shorturl.at/abcde"
                    />
                </div>
                <button onClick={handleEncode} className="encode-btn" disabled={loading}>
                    {loading ? "Processing..." : "Generate Code"}
                </button>
                {statusMsg && <p className="subtitle">{statusMsg}</p>}
            </main>

            {/* Decode UI removed — only encoding shown */}

            {error && <p className="error-message">{error}</p>}

            {result && (
                <div className="results-container card">

                    <div className="output-group">
                        <label htmlFor="encoded-result">Skyra Code</label>
                        <div className="output-wrapper">
                            <input id="encoded-result" type="text" value= {result.encoded} readOnly />
                            <CopyButton textToCopy={result.encoded} />
                        </div>
                    </div>
                </div>
            )}

            <footer className="App-footer">
                <p>Copyright © 2026 Skyra Encoder.</p>
                <p>Designed and Developed by Dhanush & Praveen.</p>
            </footer>
        </div>
    );
}

export default App;
