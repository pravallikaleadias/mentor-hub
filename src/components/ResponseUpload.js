import React, { useState } from 'react';

function ResponseUpload({ batches, apiUrl, user }) {
  const [selectedBatch, setSelectedBatch] = useState('');
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedBatch) { alert('Please select a batch'); return; }
    if (!text.trim() && !image) { alert('Please add text or an image'); return; }

    setUploading(true);
    setSuccess(false);

    try {
      let imageBase64 = null;
      let imageName = null;

      if (image) {
        const reader = new FileReader();
        imageBase64 = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result.split(',')[1]);
          reader.readAsDataURL(image);
        });
        imageName = `${user.tab}_${selectedBatch}_${Date.now()}.jpg`;
      }

      await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify({
          action: 'uploadResponse',
          mentorTab: user.tab,
          batchCode: selectedBatch,
          date: today,
          text: text.trim(),
          imageBase64,
          imageName
        })
      });

      setSuccess(true);
      setText('');
      setImage(null);
      setImagePreview(null);
      setSelectedBatch('');
    } catch (e) {
      alert('Upload failed. Please try again.');
    }
    setUploading(false);
  };

  return (
    <div>
      <div className="card" style={{ background: '#F0FFF4', border: '1px solid #9AE6B4' }}>
        <p style={{ fontSize: 13, color: '#276749' }}>
          📸 Upload student responses to showcase their work and creativity
        </p>
      </div>

      {success && (
        <div className="card" style={{ background: '#F0FFF4', border: '1px solid #9AE6B4', textAlign: 'center' }}>
          <div style={{ fontSize: 32 }}>🎉</div>
          <div style={{ fontWeight: 700, color: '#276749' }}>Response uploaded successfully!</div>
          <button
            className="btn-success"
            style={{ marginTop: 12 }}
            onClick={() => setSuccess(false)}
          >
            Upload Another
          </button>
        </div>
      )}

      {!success && (
        <div className="card">
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📸 Upload Student Response</h2>

          <label>Select Batch</label>
          <select
            className="input-field"
            value={selectedBatch}
            onChange={e => setSelectedBatch(e.target.value)}
          >
            <option value="">-- Select Batch --</option>
            {batches.map(b => (
              <option key={b.batchCode} value={b.batchCode}>
                {b.batchCode} — {b.day} {b.time}
              </option>
            ))}
          </select>

          <label>Student Response (text)</label>
          <textarea
            className="input-field"
            rows={4}
            placeholder="Paste or type student's response here..."
            value={text}
            onChange={e => setText(e.target.value)}
          />

          <label>Upload Screenshot / Photo</label>
          <div style={{
            border: '2px dashed #CBD5E0',
            borderRadius: 8,
            padding: 20,
            textAlign: 'center',
            marginBottom: 12,
            cursor: 'pointer'
          }}
            onClick={() => document.getElementById('fileInput').click()}
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="preview"
                style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }}
              />
            ) : (
              <div>
                <div style={{ fontSize: 32 }}>📷</div>
                <div style={{ fontSize: 14, color: '#718096', marginTop: 8 }}>
                  Tap to select photo or screenshot
                </div>
              </div>
            )}
          </div>
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />

          {imagePreview && (
            <button
              className="btn-secondary"
              style={{ width: '100%', marginBottom: 12 }}
              onClick={() => { setImage(null); setImagePreview(null); }}
            >
              Remove Image ✕
            </button>
          )}

          <button
            className="btn-primary"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : '📤 Upload Response'}
          </button>
        </div>
      )}
    </div>
  );
}

export default ResponseUpload;
