import React, { useState, useEffect } from 'react';

function ActivityTracker({ batches, apiUrl, user }) {
  const [activities, setActivities] = useState({});
  const [posting, setPosting] = useState(null);
  const [note, setNote] = useState('');
  const [expandedBatch, setExpandedBatch] = useState(null);
  const [savedActivities, setSavedActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  useEffect(() => {
    fetch(`${apiUrl}?action=getActivities&mentorTab=${encodeURIComponent(user.tab)}`)
      .then(r => r.json())
      .then(data => {
        setSavedActivities(data.activities || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [apiUrl, user.tab]);

  const isPostedThisWeek = (batchCode) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return savedActivities.some(a =>
      a.batchCode === batchCode &&
      new Date(a.timestamp) > weekAgo
    );
  };

  const handleMarkPosted = async (batchCode) => {
    setPosting(batchCode);
    try {
      await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify({
          action: 'markActivityPosted',
          mentorTab: user.tab,
          batchCode,
          date: today,
          note: note
        })
      });
      setSavedActivities(prev => [...prev, {
        batchCode,
        date: today,
        note,
        timestamp: new Date().toISOString()
      }]);
      setNote('');
      setExpandedBatch(null);
    } catch (e) {
      alert('Failed to save. Please try again.');
    }
    setPosting(null);
  };

  if (loading) return <div className="spinner">Loading...</div>;

  return (
    <div>
      <div className="card" style={{ background: '#EBF8FF', border: '1px solid #BEE3F8' }}>
        <p style={{ fontSize: 13, color: '#2B6CB0' }}>
          📋 Mark each batch after you post the activity in the WhatsApp group
        </p>
      </div>

      {batches.map(batch => {
        const posted = isPostedThisWeek(batch.batchCode);
        const isExpanded = expandedBatch === batch.batchCode;

        return (
          <div key={batch.batchCode} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span className={`badge ${batch.type === 'OB' ? 'badge-ob' : 'badge-regular'}`}>
                    {batch.type}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{batch.batchCode}</span>
                </div>
                <div style={{ fontSize: 13, color: '#718096' }}>
                  {batch.day} {batch.time} • {batch.studentCount} students
                </div>
              </div>
              <span className={`badge ${posted ? 'badge-posted' : 'badge-not-posted'}`}>
                {posted ? '✅ Posted' : '⏳ Pending'}
              </span>
            </div>

            {!posted && (
              <div style={{ marginTop: 12 }}>
                {!isExpanded ? (
                  <button
                    className="btn-success"
                    style={{ width: '100%' }}
                    onClick={() => setExpandedBatch(batch.batchCode)}
                  >
                    Mark as Posted ✅
                  </button>
                ) : (
                  <div>
                    <label>Add a note (optional)</label>
                    <textarea
                      className="input-field"
                      rows={2}
                      placeholder="Any note about this activity..."
                      value={note}
                      onChange={e => setNote(e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn-secondary"
                        style={{ flex: 1 }}
                        onClick={() => setExpandedBatch(null)}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn-success"
                        style={{ flex: 2 }}
                        onClick={() => handleMarkPosted(batch.batchCode)}
                        disabled={posting === batch.batchCode}
                      >
                        {posting === batch.batchCode ? 'Saving...' : 'Confirm ✅'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {posted && (
              <div style={{ marginTop: 8, fontSize: 13, color: '#38A169' }}>
                ✅ Activity posted this week
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ActivityTracker;
