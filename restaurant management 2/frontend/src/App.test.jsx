import React from 'react';

function AppTest() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#1e293b',
      color: 'white',
      fontSize: '24px',
      fontFamily: 'system-ui'
    }}>
      <div>
        <h1>✅ React is working!</h1>
        <p>If you see this, the app is rendering correctly.</p>
        <p>Check the browser console (F12) for any errors.</p>
      </div>
    </div>
  );
}

export default AppTest;
