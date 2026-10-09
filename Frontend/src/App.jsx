import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './Features/Auth/pages/LoginPage';
import RegisterPage from './Features/Auth/pages/RegisterPage';

export default function App() {
  const [theme, setTheme] = useState('cream'); // cream | onyx | crimson

  return (
    <BrowserRouter>
      <div className={`theme-${theme}`}>
        <Routes>
          <Route path="/" element={<HomePage theme={theme} setTheme={setTheme} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
