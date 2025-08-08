import React, { useState } from "react";

export default function Summarizer() {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");

  const summarizeFile = async () => {
    const formData = new FormData();
    if (file) formData.append("file", file);
    if (url) formData.append("url", url);

    const res = await fetch("http://localhost:5000/api/summarize", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setSummary(data.summary);
  };

  return (
    <div>
      <h2>Summarizer</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <input type="text" placeholder="Or paste a URL" value={url} onChange={(e) => setUrl(e.target.value)} />
      <button onClick={summarizeFile}>Summarize</button>
      <p>{summary}</p>
    </div>
  );
}
