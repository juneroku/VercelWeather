'use client';
import { useEffect, useState } from 'react';
const KEY = 'contrast-pref'; // 'normal' | 'hc'

export default function ContrastToggle(){
  const [m, setM] = useState('normal');
  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    const v = saved === 'hc' ? 'hc' : 'normal';
    setM(v); document.documentElement.dataset.contrast = v;
  }, []);
  useEffect(() => {
    document.documentElement.dataset.contrast = m;
    localStorage.setItem(KEY, m);
  }, [m]);

  return (
    <button className="btn" onClick={() => setM(x=>x==='normal'?'hc':'normal')}>
      {m==='normal' ? '⬛ High Contrast' : '◻️ Normal Contrast'}
    </button>
  );
}
