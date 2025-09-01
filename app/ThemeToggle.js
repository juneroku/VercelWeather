'use client';
import { useEffect, useState } from 'react';
const KEY = 'theme-pref';

export default function ThemeToggle() {
  const [t, setT] = useState('light');
  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    const theme = saved === 'dark' ? 'dark' : 'light';
    setT(theme); document.documentElement.dataset.theme = theme;
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = t;
    localStorage.setItem(KEY, t);
  }, [t]);

  return (
    <button className="btn" onClick={() => setT(x => x==='light'?'dark':'light')}>
      {t==='light' ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}
