'use client';
import {useEffect, useState} from 'react';
const KEY = 'contrast-pref'; // 'normal' | 'hc'

export default function ContrastToggle(){
  const [mode,setMode] = useState('normal');
  useEffect(()=>{
    const saved = localStorage.getItem(KEY);
    const m = saved === 'hc' ? 'hc' : 'normal';
    setMode(m);
    document.documentElement.dataset.contrast = m;
  },[]);
  useEffect(()=>{
    document.documentElement.dataset.contrast = mode;
    localStorage.setItem(KEY, mode);
  },[mode]);
  return (
    <button className="btn" onClick={()=>setMode(m => m==='normal' ? 'hc' : 'normal')}>
      {mode==='normal' ? '⬛ High Contrast' : '◻️ Normal Contrast'}
    </button>
  );
}
