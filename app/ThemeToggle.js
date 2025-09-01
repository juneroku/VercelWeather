'use client';
import { useEffect, useState } from 'react';
const KEY = 'theme-preference';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    const t = saved === 'dark' ? 'dark' : 'light';
    setTheme(t);
    document.documentElement.dataset.theme = t;
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(KEY, theme);
  }, [theme]);
  return (
    <button className="btn" onClick={()=>setTheme(t=> t==='light' ? 'dark' : 'light')} title="Toggle theme">
      {theme === 'light' ? '🌙 Dark mode' : '☀️ Light mode'}
    </button>
  );
}
