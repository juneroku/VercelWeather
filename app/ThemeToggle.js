'use client';
import { useEffect, useState } from 'react';

const KEY = 'theme-preference'; // 'light' | 'dark'

export default function ThemeToggle() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved === 'dark' || saved === 'light') {
      setTheme(saved);
      document.documentElement.dataset.theme = saved;
    } else {
      document.documentElement.dataset.theme = 'light';
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(KEY, theme);
  }, [theme]);

  return (
    <button
      className="btn"
      onClick={() => setTheme(t => (t === 'light' ? 'dark' : 'light'))}
      title="Toggle light/dark"
      aria-label="Toggle theme"
      style={{fontWeight:600}}
    >
      {theme === 'light' ? '🌙 Dark mode' : '☀️ Light mode'}
    </button>
  );
}
