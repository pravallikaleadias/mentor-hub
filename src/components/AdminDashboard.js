import React, { useState, useEffect } from 'react';

function AdminDashboard({ onLogout, apiUrl }) {
  const [tab, setTab] = useState('flags');
  const [flags, setFlags] = useState([]);
  const [responses, setResponses] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissing, setDismissing] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [flagRes, responseRes, activityRes] = await Promise.all([
        fetch(`${apiUrl}?action=getFlags`),
        fetch(`${apiUrl}?action=getResponses`),
        fetch(`${apiUrl}?action=getAllActivities`)
      ]);
      const flagData = await flagRes.json();
      const responseData = await responseRes.json();
      const activityData = await activityRes.json();
      setFlags(flagData.flags || []);
      setResponses(responseData.responses || []);
      setActivities(activityData.activities || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleDismiss = async (flag, skipType) => {
    const key = `${flag.mentorTab}_${flag.batchCode}_${flag.studentName}_${flag.date || ''}`;
    const comment = commentInputs[key] || '';
    if (!comment.trim()) { alert('Please add a comment before dismissing'); return; }

    setDismissing(key);
    try {
      await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify({
          action: 'dismissFlag',
          mentorTab: flag.mentorTab,
          batchCode: flag.batchCode,
          studentName: flag.studentName,
          date: flag.date || new Date().toISOString(),
          comment,
          skipType
        })
      });
      setFlags(prev => prev.filter(f =>
        !(f.mentorTab === flag.mentorTab &&
          f.batchCode === flag.batchCode &&
          f.studentName === flag.studentName &&
          f.date === flag.date)
      ));
    } catch (e) {
      alert('Failed. Please try again.');
    }
    setDismissing(null);
  };

  const handleMarkExited = async (flag) => {
    const key = `${flag.mentorTab}_${flag.batchCode}_${flag.studentName}_exit`;
    const comment = commentInputs[key] || '';
    if (!comment.trim()) { alert('Please add a comment'); return; }

    setDismissing(key);
    try {
      await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify({
          action: 'markExited',
          mentorTab: flag.mentorTab,
          batchCode: flag.batchCode,
          studentName: flag.studentName,
          comment
        })
      });
      setFlags(prev => prev.filter(f =>
        !(f.mentorTab === flag.mentorTab &&
          f.batchCode === flag.batchCode &&
          f.studentName === flag.studentName &&
          f.type === 'possible_exit')
      ));
    } catch (e) {
      alert('Failed. Please try again.');
    }
    setDismissing(null);
  };

  const handleCheckFreeText = async (flag) => {
    try {
      await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify({
          action: 'dismissFlag',
          mentorTab: flag.mentorTab,
          batchCode: flag.batchCode,
          studentName: flag.studentName,
          date: flag.date,
          comment: 'Checked by admin',
          skipType: 'free_text_checked'
        })
      });
      setFlags(prev => prev.filter(f =>
        !(f.mentorTab === flag.mentorTab &&
          f.batchCode === flag.batchCode &&
          f.studentName === flag.studentName &&
          f.date === flag.date &&
          f.type === 'free_text')
      ));
    } catch (e) {
      alert('Failed. Please try again.');
    }
  };

  const flagTypeLabel = {
    missing_date_header: { label: '📅 Missing Date', color: '#D69E2E', bg: '#FFFFF0', className: 'flag-missing-date' },
    missing_followup: { label: '⚠️ Follow-up Missing', color: '#E53E3E', bg: '#FFF5F5', className: 'flag-missing-followup' },
    consecutive_not_connected: { label: '🔴 2x Not Connected', color: '#9B2C2C', bg: '#FFF5F5', className: 'flag-consecutive-nc' },
    free_text: { label: '🟣 Non-standard Entry', color: '#805AD5', bg: '#FAF5FF', className: 'flag-free-text' },
    possible_exit: { label: '⚫ Possibly Exited', color: '#2D3748', bg: '#F7FAFC', className: 'flag-possible-exit' }
  };

  const groupedFlags = flags.reduce((acc, flag) => {
    const key = flag.type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(flag);
    return acc;
  }, {});

  const postedThisWeek = activities.filter(a => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(a.timestamp) > weekAgo;
  });

  return (
    <div>
      <div className="header">
        <div>
          <h1>📚 MentorHub</h1>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Admin Dashboard</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={loadData} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '6px 12px', borderRadius: 6, fontSize: 13 }}>
            🔄 Refresh
          </button>
          <button onClick={onLogout}>Logout</button>
        </div>
      </div>

      <div className="page">
        <div className="tab-bar">
          <button className={tab === 'flags' ? 'active' : ''} onClick={() => setTab('flags')}>
            🚩 Flags {flags.length > 0 && <span style={{ background: '#E53E3E', color: 'white', borderRadius: 99, padding: '1px 6px', fontSize: 11, marginLeft: 4 }}>{flags.length}</span>}
          </button>
          <button className={tab === 'activities' ? 'active' : ''} onClick={() => setTab('activities')}>
            ✅ Activities
          </button>
          <button className={tab === 'responses' ? 'active' : ''} onClick={() => setTab('responses')}>
            📸 Gallery
          </button>
        </div>

        {loading ? (
          <div className="spinner">Loading dashboard...</div>
        ) : (
          <>
            {tab === 'flags' && (
              <div>
                <div className="card" style={{ background: '#EBF8FF' }}>
                  <div style={{ fontSize: 13, color: '#2B6CB0' }}>
                    Total flags: <strong>{flags.length}</strong> across all mentors
                  </div>
                </div>

                {flags.length === 0 && (
                  <div className="card" style={{ textAlign: 'center', color: '#38A169' }}>
                    <div style={{ fontSize: 32 }}>🎉</div>
                    <div style={{ fontWeight: 700, marginTop: 8 }}>All clear! No flags right now.</div>
                  </div>
                )}

                {Object.entries(groupedFlags).map(([type, typeFlags]) => {
                  const typeInfo = flagTypeLabel[type] || { label: type, color: '#718096', bg: '#F7FAFC', className: '' };
                  return (
                    <div key={type}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: typeInfo.color, marginBottom: 8, marginTop: 8 }}>
                        {typeInfo.label} ({typeFlags.length})
                      </div>
                      {typeFlags.map((flag, idx) => {
                        const key = `${flag.mentorTab}_${flag.batchCode}_${flag.studentName}_${flag.date || ''}`;
                        const exitKey = `${flag.mentorTab}_${flag.batchCode}_${flag.studentName}_exit`;
                        return (
                          <div key={idx} className={`card ${typeInfo.className}`} style={{ background: typeInfo.bg }}>
                            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                              {flag.mentorName} — {flag.batchCode}
                            </div>
                            <div style={{ fontSize: 13, color: '#4A5568', marginBottom: 8 }}>
                              {flag.message}
                            </div>

                            {flag.previousComments && flag.previousComments.length > 0 && (
                              <div style={{ background: '#EDF2F7', borderRadius: 6, padding: 8, marginBottom: 8, fontSize: 12 }}>
                                <div style={{ fontWeight: 700, color: '#4A5568', marginBottom: 4 }}>Previous notes:</div>
                                {flag.previousComments.map((c, i) => (
                                  <div key={i} style={{ color: '#718096', marginBottom: 2 }}>
                                    • {c.date}: {c.comment}
                                  </div>
                                ))}
                              </div>
                            )}

                            {type === 'missing_date_header' && (
                              <div style={{ fontSize: 12, color: '#744210', background: '#FEFCBF', padding: 8, borderRadius: 6 }}>
                                Ask mentor to replace column header with actual date
                              </div>
                            )}

                            {type === 'free_text' && (
                              <button
                                className="btn-secondary"
                                style={{ width: '100%', marginTop: 8 }}
                                onClick={() => handleCheckFreeText(flag)}
                              >
                                ✅ Mark as Checked
                              </button>
                            )}

                            {(type === 'missing_followup' || type === 'consecutive_not_connected') && (
                              <div>
                                <textarea
                                  className="input-field"
                                  rows={2}
                                  placeholder="Add comment (required)..."
                                  value={commentInputs[key] || ''}
                                  onChange={e => setCommentInputs(prev => ({ ...prev, [key]: e.target.value }))}
                                  style={{ marginTop: 8 }}
                                />
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <button
                                    className="btn-warning"
                                    style={{ flex: 1, fontSize: 12 }}
                                    onClick={() => handleDismiss(flag, 'once')}
                                    disabled={dismissing === key}
                                  >
                                    {dismissing === key ? '...' : 'Dismiss Once'}
                                  </button>
                                  <button
                                    className="btn-danger"
                                    style={{ flex: 1, fontSize: 12 }}
                                    onClick={() => handleDismiss(flag, 'always')}
                                    disabled={dismissing === key}
                                  >
                                    {dismissing === key ? '...' : 'Skip Always'}
                                  </button>
                                </div>
                              </div>
                            )}

                            {type === 'possible_exit' && (
                              <div>
                                <textarea
                                  className="input-field"
                                  rows={2}
                                  placeholder="Add comment (required)..."
                                  value={commentInputs[exitKey] || ''}
                                  onChange={e => setCommentInputs(prev => ({ ...prev, [exitKey]: e.target.value }))}
                                  style={{ marginTop: 8 }}
                                />
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <button
                                    className="btn-danger"
                                    style={{ flex: 1, fontSize: 12 }}
                                    onClick={() => handleMarkExited(flag)}
                                    disabled={dismissing === exitKey}
                                  >
                                    {dismissing === exitKey ? '...' : 'Yes, Exited'}
                                  </button>
                                  <button
                                    className="btn-secondary"
                                    style={{ flex: 1, fontSize: 12 }}
                                    onClick={() => handleDismiss(flag, 'asked_exit')}
                                    disabled={dismissing === exitKey}
                                  >
                                    {dismissing === exitKey ? '...' : 'Still Active'}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}

            {tab === 'activities' && (
              <div>
                <div className="card" style={{ background: '#F0FFF4' }}>
                  <div style={{ fontSize: 13, color: '#276749' }}>
                    Posted this week: <strong>{postedThisWeek.length}</strong> activities
                  </div>
                </div>
                {activities.length === 0 && (
                  <div className="card" style={{ textAlign: 'center', color: '#718096' }}>
                    No activities posted yet
                  </div>
                )}
                {activities.slice().reverse().map((a, i) => (
                  <div key={i} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{a.mentorTab} — {a.batchCode}</span>
                      <span style={{ fontSize: 12, color: '#718096' }}>{a.date}</span>
                    </div>
                    {a.note && <div style={{ fontSize: 13, color: '#4A5568' }}>{a.note}</div>}
                  </div>
                ))}
              </div>
            )}

            {tab === 'responses' && (
              <div>
                {responses.length === 0 && (
                  <div className="card" style={{ textAlign: 'center', color: '#718096' }}>
                    No responses uploaded yet
                  </div>
                )}
                {responses.slice().reverse().map((r, i) => (
                  <div key={i} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{r.mentorTab} — {r.batchCode}</span>
                      <span style={{ fontSize: 12, color: '#718096' }}>{r.date}</span>
                    </div>
                    {r.text && <div style={{ fontSize: 13, color: '#4A5568', marginBottom: 8 }}>{r.text}</div>}
                    {r.imageUrl && (
                      <img
                        src={r.imageUrl}
                        alt="student response"
                        style={{ width: '100%', borderRadius: 8, maxHeight: 300, objectFit: 'cover' }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
