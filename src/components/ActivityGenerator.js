import React, { useState } from 'react';

const GRADES = ['Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];

function ActivityGenerator({ batches }) {
  const [selectedBatch, setSelectedBatch] = useState('');
  const [grade, setGrade] = useState('');
  const [prompt, setPrompt] = useState('');

  const handleGenerate = () => {
    if (!prompt.trim()) { alert('Please enter your prompt/topic'); return; }
    if (!grade) { alert('Please select student grade'); return; }

    const fullPrompt = `${prompt.trim()}

Student Level: ${grade}

Please create an engaging and creative activity based on the above topic for ${grade} students. The activity should be fun, interactive, and easy to participate in via WhatsApp. Keep instructions clear and simple.`;

    const encoded = encodeURIComponent(fullPrompt);
    window.open(`https://chat.openai.com/?q=${encoded}`, '_blank');
  };

  const selectedBatchInfo = batches.find(b => b.batchCode === selectedBatch);

  return (
    <div>
      <div className="card">
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>🎯 Activity Generator</h2>
        <p style={{ fontSize: 13, color: '#718096', marginBottom: 16 }}>
          Type your topic/prompt, select grade → opens ChatGPT with it pre-filled
        </p>

        <label>Select Batch (optional)</label>
        <select
          className="input-field"
          value={selectedBatch}
          onChange={e => {
            setSelectedBatch(e.target.value);
            const b = batches.find(b => b.batchCode === e.target.value);
            if (b) setGrade(`Class ${b.studentClass || ''}`);
          }}
        >
          <option value="">-- Select Batch --</option>
          {batches.map(b => (
            <option key={b.batchCode} value={b.batchCode}>
              {b.batchCode} — {b.day} {b.time} ({b.type})
            </option>
          ))}
        </select>

        {selectedBatchInfo && (
          <div style={{ background: '#F7FAFC', borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 13 }}>
            <span className={`badge ${selectedBatchInfo.type === 'OB' ? 'badge-ob' : 'badge-regular'}`}>
              {selectedBatchInfo.type}
            </span>
            <span style={{ marginLeft: 8, color: '#4A5568' }}>{selectedBatchInfo.batchName}</span>
          </div>
        )}

        <label>Student Grade / Class</label>
        <select
          className="input-field"
          value={grade}
          onChange={e => setGrade(e.target.value)}
        >
          <option value="">-- Select Grade --</option>
          {GRADES.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        <label>Your Prompt / Topic</label>
        <textarea
          className="input-field"
          rows={5}
          placeholder="E.g: This week we learned about fractions. Create a fun activity where students can practice adding fractions using real life examples like pizza slices or water bottles..."
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          style={{ resize: 'vertical' }}
        />

        <button
          className="btn-primary"
          onClick={handleGenerate}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <span>✨ Generate with ChatGPT</span>
        </button>

        <p style={{ fontSize: 12, color: '#A0AEC0', marginTop: 12, textAlign: 'center' }}>
          Opens ChatGPT in a new tab with your prompt ready
        </p>
      </div>

      <div className="card" style={{ background: '#FFFBEB', border: '1px solid #F6E05E' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#744210', marginBottom: 8 }}>💡 Tips for a great prompt</h3>
        <ul style={{ fontSize: 13, color: '#744210', paddingLeft: 16, lineHeight: 1.8 }}>
          <li>Mention the topic clearly</li>
          <li>Say what concept students learned this week</li>
          <li>Ask for WhatsApp-friendly format</li>
          <li>Request simple instructions kids can follow</li>
        </ul>
      </div>
    </div>
  );
}

export default ActivityGenerator;
