import { useState } from 'react';
import './App.css';

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

    // const handleEncode = async () => {
    //     if (!url) {
    //         setError('Please enter a URL to process.');
    //         return;
    //     }
    //     setLoading(true);
    //     setResult(null);
    //     setError("");
    //     try {
    //         const res = await fetch("/api/encode", {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({ url })
    //         });
    //         const data = await res.json();
    //         if (!res.ok) {
    //             throw new Error(data.error);
    //         }
    //         setResult(data);
    //     } catch (err) {
    //         if (err instanceof SyntaxError) {
    //             setError("A server error occurred. The response was not valid.");
    //         } else {
    //             setError(err.message);
    //         }
    //     }
    //     setLoading(false);
    // };

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
            const res = await fetch("/api/encode", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Something went wrong");
            }

            setResult(data);
            setStatusMsg(data.status);

        } catch (err) {
            setError(err.message);
            setStatusMsg("");
        }

        setLoading(false);
    };

    return (
        <div className="App">
            <header className="App-header">
                <img src="/logo.png" alt="Skyra Logo" className="logo" />
                <h1>Skyra Encoder</h1>
                <p className="subtitle">Create a secure, Encoded URL for Skyra.</p>
            </header>

            <main className="card">
                <div className="input-group">
                    <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></svg>
                    <input
                        id="input-url"
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Paste your long URL here..."
                    />
                </div>
                <button onClick={handleEncode} className="encode-btn" disabled={loading}>
                    {loading ? "Processing..." : "Generate Code"}
                </button>
                {statusMsg && <p className="subtitle">{statusMsg}</p>}
            </main>

            {error && <p className="error-message">{error}</p>}

            {result && (
                <div className="results-container card">

                    <div className="output-group">
                        <label htmlFor="short-url">Short URL</label>
                        <div className="output-wrapper">
                            <input id="short-url" type="text" value={result.shortUrl} readOnly />
                            <CopyButton textToCopy={result.shortUrl} />
                        </div>
                    </div>

                    <div className="output-group">
                        <label htmlFor="encoded-result">Skyra Code</label>
                        <div className="output-wrapper">
                            <input id="encoded-result" type="text" value={result.encoded} readOnly />
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