import React, { useState, useEffect } from 'react';

function Login({ onLogin, apiUrl }) {
  const [mentors, setMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetchingMentors, setFetchingMentors] = useState(true);

  useEffect(() => {
    fetch(`${apiUrl}?action=getMentors`)
      .then(r => r.json())
      .then(data => {
        setMentors(data);
        setFetchingMentors(false);
      })
      .catch(() => {
        setError('Could not connect. Please try again.');
        setFetchingMentors(false);
      });
  }, [apiUrl]);

  const handleMentorSelect = async (tab) => {
    setSelectedMentor(tab);
    setError('');
    setPin('');
    setConfirmPin('');
    const res = await fetch(`${apiUrl}?action=verifyPin&mentorTab=${encodeURIComponent(tab)}&pin=check`);
    const data = await res.json();
    setIsNewUser(data.status === 'no_pin');
  };

  const handleSubmit = async () => {
    if (!selectedMentor) { setError('Please select your name'); return; }
    if (pin.length !== 4 || isNaN(pin)) { setError('PIN must be 4 digits'); return; }

    setLoading(true);
    setError('');

    if (isNewUser) {
      if (pin !== confirmPin) { setError('PINs do not match'); setLoading(false); return; }
      await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify({ action: 'setPin', mentorTab: selectedMentor, pin })
      });
      const mentor = mentors.find(m => m.tab === selectedMentor);
      onLogin({ tab: selectedMentor, name: mentor.name, code: mentor.code, role: 'mentor' });
    } else {
      const res = await fetch(`${apiUrl}?action=verifyPin&mentorTab=${encodeURIComponent(selectedMentor)}&pin=${pin}`);
      const data = await res.json();
      if (data.status === 'ok') {
        const mentor = mentors.find(m => m.tab === selectedMentor);
        onLogin({ tab: selectedMentor, name: mentor.name, code: mentor.code, role: 'mentor' });
      } else {
        setError('Wrong PIN. Try again.');
      }
    }
    setLoading(false);
  };

  const handleAdminLogin = () => {
    if (pin === '0000') {
      onLogin({ role: 'admin', name: 'Admin' });
    } else {
      setError('Wrong admin PIN');
    }
  };

  if (fetchingMentors) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 32 }}>📚</div>
      <div style={{ color: '#718096' }}>Loading MentorHub...</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 32, width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 48 }}>📚</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#4F46E5', marginTop: 8 }}>MentorHub</h1>
          <p style={{ color: '#718096', fontSize: 14, marginTop: 4 }}>Your teaching companion</p>
        </div>

        {error && (
          <div style={{ background: '#FFF5F5', color: '#C53030', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
            {error}
          </div>
        )}

        <label>Select Your Name</label>
        <select
          className="input-field"
          value={selectedMentor}
          onChange={e => handleMentorSelect(e.target.value)}
        >
          <option value="">-- Select Mentor --</option>
          {mentors.filter(m => m.role !== 'admin').map(m => (
            <option key={m.tab} value={m.tab}>{m.name}</option>
          ))}
          <option value="__admin__">Admin</option>
        </select>

        {selectedMentor && (
          <>
            {isNewUser && selectedMentor !== '__admin__' && (
              <div style={{ background: '#EBF8FF', padding: 10, borderRadius: 8, marginBottom: 12, fontSize: 13, color: '#2B6CB0' }}>
                👋 First time? Set your 4-digit PIN
              </div>
            )}

            <label>{isNewUser && selectedMentor !== '__admin__' ? 'Create PIN (4 digits)' : 'Enter PIN'}</label>
            <input
              className="input-field"
              type="password"
              maxLength={4}
              placeholder="••••"
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
            />

            {isNewUser && selectedMentor !== '__admin__' && (
              <>
                <label>Confirm PIN</label>
                <input
                  className="input-field"
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  value={confirmPin}
                  onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                />
              </>
            )}

            <button
              className="btn-primary"
              onClick={selectedMentor === '__admin__' ? handleAdminLogin : handleSubmit}
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              {loading ? 'Please wait...' : isNewUser && selectedMentor !== '__admin__' ? 'Set PIN & Login' : 'Login'}
            </button>
          </>
        )}

        <p style={{ textAlign: 'center', fontSize: 12, color: '#A0AEC0', marginTop: 20 }}>
          Forgot PIN? Contact your admin
        </p>
      </div>
    </div>
  );
}

export default Login;
