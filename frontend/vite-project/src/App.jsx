import { useState } from "react";

function App() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleShorten = async () => {
    setLoading(true);
    setError("");
    setShortUrl("");

    try {
      const res = await fetch("http://localhost:5000/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setShortUrl(data.shortUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>URL Shortener</h1>

      <input
        type="text"
        placeholder="Enter your URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <button onClick={handleShorten} disabled={loading}>
        {loading ? "Shortening..." : "Shorten"}
      </button>

      {error && <p className="error">{error}</p>}

      {shortUrl && (
        <div className="result">
          <a href={shortUrl} target="_blank" rel="noreferrer">
            {shortUrl}
          </a>
          <button
            onClick={() => navigator.clipboard.writeText(shortUrl)}
          >
            Copy
          </button>
        </div>
      )}
    </div>
  );
}

export default App;