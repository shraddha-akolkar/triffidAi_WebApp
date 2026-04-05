import React, { useState } from 'react';
import AuthPage from './AuthPage';
import Dashboard from './Dashboard';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    // userData contains { tenantId, email, role }
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <>
      {!user ? (
        <AuthPage onLogin={handleLogin} />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </>
  );
}

export default App;
