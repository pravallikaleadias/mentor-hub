import React, { useState, useEffect } from 'react';
import ActivityGenerator from './ActivityGenerator';
import ActivityTracker from './ActivityTracker';
import ResponseUpload from './ResponseUpload';

function MentorDashboard({ user, onLogout, apiUrl }) {
  const [tab, setTab] = useState('activity');
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${apiUrl}?action=getMentorBatches&mentorTab=${encodeURIComponent(user.tab)}`)
      .then(r => r.json())
      .then(data => {
        setBatches(data.batches || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [apiUrl, user.tab]);

  return (
    <div>
      <div className="header">
        <div>
          <h1>📚 MentorHub</h1>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Hi, {user.name}!</div>
        </div>
        <button onClick={onLogout}>Logout</button>
      </div>

      <div className="page">
        <div className="tab-bar">
          <button className={tab === 'activity' ? 'active' : ''} onClick={() => setTab('activity')}>
            🎯 Activity
          </button>
          <button className={tab === 'tracker' ? 'active' : ''} onClick={() => setTab('tracker')}>
            ✅ Posted
          </button>
          <button className={tab === 'responses' ? 'active' : ''} onClick={() => setTab('responses')}>
            📸 Responses
          </button>
        </div>

        {loading ? (
          <div className="spinner">Loading your batches...</div>
        ) : batches.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: '#718096' }}>
            No active batches found
          </div>
        ) : (
          <>
            {tab === 'activity' && <ActivityGenerator batches={batches} />}
            {tab === 'tracker' && <ActivityTracker batches={batches} apiUrl={apiUrl} user={user} />}
            {tab === 'responses' && <ResponseUpload batches={batches} apiUrl={apiUrl} user={user} />}
          </>
        )}
      </div>
    </div>
  );
}

export default MentorDashboard;
