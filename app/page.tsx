'use client';

import { useState } from 'react';

type OutputFormat = 'markdown' | 'bullets' | 'executive';

export default function Home() {
  const [transcript, setTranscript] = useState('');
  const [format, setFormat] = useState<OutputFormat>('markdown');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [showOutput, setShowOutput] = useState(false);

  const handleGenerate = async () => {
    if (!transcript.trim()) return;
    
    setLoading(true);
    setShowOutput(false);
    
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, format }),
      });
      
      const data = await res.json();
      setOutput(data.result);
      setShowOutput(true);
    } catch (err) {
      setOutput('Error generating notes. Please try again.');
      setShowOutput(true);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <main className="container">
      <header className="header">
        <h1>Meeting Notes Generator</h1>
        <p>Transform your transcripts into structured, actionable notes</p>
      </header>

      <div className="glass-card input-section">
        <label htmlFor="transcript">Paste your transcript</label>
        <textarea
          id="transcript"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Paste meeting transcript here... (Speaker names and timestamps help with speaker detection)"
        />
      </div>

      <div className="glass-card">
        <div className="format-select">
          <button
            className={`format-option ${format === 'markdown' ? 'active' : ''}`}
            onClick={() => setFormat('markdown')}
          >
            Markdown
          </button>
          <button
            className={`format-option ${format === 'bullets' ? 'active' : ''}`}
            onClick={() => setFormat('bullets')}
          >
            Bullet Points
          </button>
          <button
            className={`format-option ${format === 'executive' ? 'active' : ''}`}
            onClick={() => setFormat('executive')}
          >
            Executive Summary
          </button>
        </div>

        <button
          className="generate-btn"
          onClick={handleGenerate}
          disabled={!transcript.trim() || loading}
        >
          {loading ? 'Generating...' : '✨ Generate Notes'}
        </button>
      </div>

      <div className={`loading ${loading ? 'visible' : ''}`}>
        <div className="spinner"></div>
        <p>Analyzing transcript...</p>
      </div>

      <div className={`output-section glass-card ${showOutput ? 'visible' : ''}`}>
        <div className="output-header">
          <h2>Generated Notes</h2>
          <button className="copy-btn" onClick={copyToClipboard}>
            📋 Copy to Clipboard
          </button>
        </div>
        <pre className="output-content">{output}</pre>
      </div>
    </main>
  );
}