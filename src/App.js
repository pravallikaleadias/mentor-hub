import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import MentorDashboard from './components/MentorDashboard';
import AdminDashboard from './components/AdminDashboard';

const API_URL = 'https://script.google.com/macros/s/AKfycbwQ_5H9gM5Sgcw7ogVPkJNfhSLqrjyfNHZzlUkkr2Zv_eJozlvKxe1OvVoAlhOtyVyN/exec';

export { API_URL };

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('mentorHubUser');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem('mentorHubUser', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('mentorHubUser');
    setUser(null);
  };

  if (!user) return <Login onLogin={handleLogin} apiUrl={API_URL} />;
  if (user.role === 'admin') return <AdminDashboard onLogout={handleLogout} apiUrl={API_URL} />;
  return <MentorDashboard user={user} onLogout={handleLogout} apiUrl={API_URL} />;
}

export default App;
