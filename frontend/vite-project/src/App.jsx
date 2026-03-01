import { useState, useEffect } from "react";
import QRCode from "qrcode";

function App() {
  const [url, setUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleShorten = async () => {
    setLoading(true);
    setError("");
    setShortUrl("");
    setQrCode("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/shorten`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          customAlias: customAlias || undefined,
        }),
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

  // Generate QR when shortUrl changes
  useEffect(() => {
    if (shortUrl) {
      QRCode.toDataURL(shortUrl)
        .then((url) => {
          setQrCode(url);
        })
        .catch(() => {
          setError("Failed to generate QR");
        });
    }
  }, [shortUrl]);

  return (
    <div style={styles.container}>
      <h1>URL Shortener</h1>

      <input
        type="text"
        placeholder="Enter your long URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={styles.input}
      />

      <input
        type="text"
        placeholder="Custom alias (optional)"
        value={customAlias}
        onChange={(e) => setCustomAlias(e.target.value)}
        style={styles.input}
      />

      <button onClick={handleShorten} disabled={loading} style={styles.button}>
        {loading ? "Shortening..." : "Shorten URL"}
      </button>

      {error && <p style={styles.error}>{error}</p>}

      {shortUrl && (
        <div style={styles.result}>
          <a href={shortUrl} target="_blank" rel="noreferrer">
            {shortUrl}
          </a>

          <button
            onClick={() => navigator.clipboard.writeText(shortUrl)}
            style={styles.copyButton}
          >
            Copy
          </button>

          {qrCode && (
            <div style={styles.qrContainer}>
              <img src={qrCode} alt="QR Code" />
              <a href={qrCode} download="qr-code.png">
                Download QR
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "500px",
    margin: "100px auto",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    textAlign: "center",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
  },
  button: {
    padding: "10px",
    fontSize: "16px",
    cursor: "pointer",
  },
  result: {
    marginTop: "20px",
  },
  error: {
    color: "red",
  },
  copyButton: {
    marginTop: "10px",
  },
  qrContainer: {
    marginTop: "20px",
  },
};

export default App;