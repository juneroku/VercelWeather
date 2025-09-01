'use client';
import { useEffect, useMemo, useState } from 'react';

/* ===== City presets ===== */
const PRESETS = [
  { key:'TH-BKK', name:'Bangkok',    country:'TH', region:'th', lat:13.7563, lon:100.5018, tz:'Asia/Bangkok'     },
  { key:'TH-CNX', name:'Chiang Mai', country:'TH', region:'th', lat:18.7877, lon:98.9931,  tz:'Asia/Bangkok'     },
  { key:'JP-TYO', name:'Tokyo',      country:'JP', region:'jp', lat:35.6762, lon:139.6503, tz:'Asia/Tokyo'       },
  { key:'US-NYC', name:'New York',   country:'US', region:'us', lat:40.7128, lon:-74.0060, tz:'America/New_York' },
];
const flag = cc => cc.replace(/./g, c => String.fromCodePoint(127397 + c.toUpperCase().charCodeAt(0)));
const dirText = d => (d==null ? '—' : ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'][Math.round(d/22.5)%16]);

/* ===== Weather emoji (Open-Meteo weathercode mapping) ===== */
function weatherEmoji(code){
  if(code==null) return '❓';
  if(code===0) return '☀️';
  if([1,2,3].includes(code)) return '⛅️';
  if([45,48].includes(code)) return '🌫️';
  if([51,53,55].includes(code)) return '🌦️';
  if([61,63,65,80,81,82].includes(code)) return '🌧️';
  if([66,67].includes(code)) return '🌨️🧊';
  if([71,73,75,77,85,86].includes(code)) return '❄️';
  if([95].includes(code)) return '⛈️';
  if([96,99].includes(code)) return '⛈️🧊';
  return '🌡️';
}

/* ===== small hook: compact layout for phone portrait ===== */
function useCompact(bp=520){
  const [c,setC] = useState(false);
  useEffect(()=>{
    const on = () => setC(window.innerWidth<bp);
    on(); window.addEventListener('resize',on);
    return ()=>window.removeEventListener('resize',on);
  },[bp]);
  return c;
}

/* ===== Charts (SVG, responsive, with min/max labels) ===== */
function LineChart({ xs, ys, height=180, id="line" }) {
  if (!ys?.length) return <div className="muted">No data</div>;
  const w=560,h=height,p=18;
  const min=Math.min(...ys), max=Math.max(...ys);
  const x=i=>p+(i/(ys.length-1))*(w-2*p);
  const y=v=>p+(1-(v-min)/(max-min||1))*(h-2*p);
  const d=ys.map((v,i)=>`${i?'L':'M'}${x(i)},${y(v)}`).join(' ');
  return (
    <svg role="img" aria-labelledby={`${id}-t ${id}-d`} viewBox={`0 0 ${w} ${h}`} width="100%" height={h}>
      <title id={`${id}-t`}>Temperature next hours</title><desc id={`${id}-d`}>Line chart with grid</desc>
      <rect x="0" y="0" width={w} height={h} rx="18" fill="var(--surface)" stroke="var(--border)"/>
      {Array.from({length:5},(_,i)=>{const yy=p+i*(h-2*p)/4; return (
        <line key={i} x1={p} y1={yy} x2={w-p} y2={yy} stroke="var(--chart-grid)" strokeDasharray="6 8"/>
      );})}
      <path d={d} fill="none" stroke="var(--chart-line)" strokeWidth="3"/>
      {ys.map((v,i)=><circle key={i} cx={x(i)} cy={y(v)} r="4" fill="var(--chart-dot)" />)}
      <text x={w-p} y={p-6} textAnchor="end" fontSize="12" fill="var(--muted)">max {max.toFixed(1)}°C</text>
      <text x={w-p} y={h-6} textAnchor="end" fontSize="12" fill="var(--muted)">min {min.toFixed(1)}°C</text>
    </svg>
  );
}
function BarChart({ xs, ys, height=140, id="bar" }) {
  if (!ys?.length) return <div className="muted">No data</div>;
  const w=560,h=height,p=18; const ymax=Math.max(1,...ys);
  const bw=(w-2*p)/ys.length - 6;
  return (
    <svg role="img" aria-labelledby={`${id}-t ${id}-d`} viewBox={`0 0 ${w} ${h}`} width="100%" height={h}>
      <title id={`${id}-t`}>Precipitation next hours</title><desc id={`${id}-d`}>Bar chart</desc>
      <rect x="0" y="0" width={w} height={h} rx="18" fill="var(--surface)" stroke="var(--border)"/>
      <text x={w-p} y={p-6} textAnchor="end" fontSize="12" fill="var(--muted)">max {ymax.toFixed(1)} mm</text>
      {ys.map((v,i)=>{
        const x=p+i*((w-2*p)/ys.length);
        const hh=(v/ymax)*(h-2*p);
        return <rect key={i} x={x} y={h-p-hh} width={bw} height={hh} rx="8"
          fill="var(--chart-bar)" />;
      })}
    </svg>
  );
}

/* ===== Map helper ===== */
const osm = (lat, lon, d=0.12) =>
  `https://www.openstreetmap.org/export/embed.html?bbox=${(lon-d).toFixed(4)},${(lat-d).toFixed(4)},${(lon+d).toFixed(4)},${(lat+d).toFixed(4)}&layer=mapnik&marker=${lat.toFixed(4)},${lon.toFixed(4)}`;

/* ===== Page ===== */
export default function Page(){
  const compact = useCompact();
  const [coords,setCoords] = useState(PRESETS[0]);
  const [data,setData] = useState(null);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState(null);

  const q = useMemo(()=> new URLSearchParams({ lat:String(coords.lat), lon:String(coords.lon), tz:coords.tz }), [coords]);

  useEffect(()=>{
    (async ()=>{
      setLoading(true); setError(null);
      try{
        const res = await fetch(`/api/weather?${q.toString()}`, { next:{ revalidate: 600 }});
        if(!res.ok) throw new Error('HTTP '+res.status);
        setData(await res.json());
      }catch(e){ setError(String(e)); }finally{ setLoading(false); }
    })();
  },[q]);

  const cur = data?.current;
  const hours = useMemo(()=>{
    if(!data?.hourly) return [];
    const now=Date.now();
    const rows=data.hourly.time.map((t,i)=>({
      time:t,
      temp:data.hourly.temperature_2m?.[i],
      precip:data.hourly.precipitation?.[i] ?? 0,
      wind:data.hourly.wind_speed_10m?.[i],
    }));
    const s=rows.findIndex(r=> new Date(r.time).getTime()>=now);
    return rows.slice(s>=0?s:0,(s>=0?s:0)+10);
  },[data]);

  return (
    <div className="page-grid">
      {/* LEFT: controls */}
      <aside className="card" style={{alignSelf:'start'}}>
        <h2 style={{margin:'0 0 6px'}}>Location</h2>
        <p className="muted" style={{marginTop:0}}>Choose a city or enter coordinates.</p>

        {/* City chips (สีแยกตามประเทศ) */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:10,margin:'12px 0 14px'}}>
          {PRESETS.map(p=>(
            <button key={p.key}
              className={`btn city-chip ${p.region} ${coords.key===p.key?'active':''}`}
              onClick={()=>setCoords(p)} style={{justifyContent:'space-between'}}
              aria-current={coords.key===p.key}
            >
              <span style={{fontSize:18}}>{flag(p.country)}</span><strong>{p.name}</strong>
            </button>
          ))}
        </div>

        <div className="row">
          <div><label className="muted">City</label>
            <select value={coords.key} onChange={e=>setCoords(PRESETS.find(p=>p.key===e.target.value) ?? PRESETS[0])}>
              {PRESETS.map(p=><option key={p.key} value={p.key}>{flag(p.country)} {p.name}, {p.country}</option>)}
            </select>
          </div>
          <div><label className="muted">Latitude</label>
            <input type="number" step="0.0001" value={coords.lat} onChange={e=>setCoords(c=>({...c,lat:parseFloat(e.target.value)}))}/></div>
          <div><label className="muted">Longitude</label>
            <input type="number" step="0.0001" value={coords.lon} onChange={e=>setCoords(c=>({...c,lon:parseFloat(e.target.value)}))}/></div>
          <div><label className="muted">Timezone</label>
            <input value={coords.tz} onChange={e=>setCoords(c=>({...c,tz:e.target.value}))}/></div>
        </div>

        <div style={{display:'flex',gap:10,marginTop:14}}>
          <button className="btn" onClick={()=>setCoords({...coords})}>🔄 Refresh</button>
          <a className="btn" href="https://www.open-meteo.com/en/docs" target="_blank" rel="noreferrer">📖 API Docs</a>
        </div>
      </aside>

      {/* RIGHT: content */}
      <div className="content-col">

        {/* HERO: ใช้ emoji ตาม weather code และแตก 1 คอลัมน์บนมือถือ */}
        <section className="card hero" style={{
          display:'grid',gridTemplateColumns: compact ? '1fr' : '1.2fr .8fr',alignItems:'center',gap:16,
          background:'linear-gradient(135deg, rgba(188,221,255,.95), rgba(255,255,255,.99))'
        }}>
          <div>
            <div className="muted" style={{fontSize:13,marginBottom:4}}>Now in</div>
            <div style={{display:'flex',alignItems:'center',gap:10,fontWeight:900,fontSize:compact?26:30}}>
              <span style={{fontSize:26}}>{flag(coords.country)}</span>
              <span className="title">{coords.name}</span>
            </div>
            <div className="muted" style={{fontSize:13}}>{coords.lat.toFixed(4)}, {coords.lon.toFixed(4)} • {coords.tz}</div>
          </div>
          <div style={{justifySelf: compact?'start':'end', textAlign: compact?'left':'right'}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:12}}>
              <div aria-label="Weather now" title="Weather now" style={{fontSize:compact?34:40, lineHeight:1}}>
                {weatherEmoji(cur?.weather_code)}
              </div>
              <div style={{fontSize:compact?34:40,fontWeight:900}}>{cur?.temperature_2m ?? '—'}°C</div>
            </div>
            <div className="muted" style={{fontSize:12}}>Feels like: {cur?.apparent_temperature ?? '—'}°C</div>
          </div>
        </section>

        {/* CURRENT */}
        <section className="card">
          <h2 style={{marginTop:0}}>Current Conditions</h2>
          {loading && <div className="muted">Loading…</div>}
          {error && <div style={{color:'var(--bad)'}}>Error: {error}</div>}
          {cur && (
            <div className="row" style={{marginTop:8}}>
              <Stat title="Humidity" value={`${cur.relative_humidity_2m}%`} />
              <Stat title="Precipitation" value={`${cur.precipitation ?? 0} mm`} />
              <Stat title="Wind" value={`${cur.wind_speed_10m} km/h`} chip={dirText(cur.wind_direction_10m)} />
            </div>
          )}
        </section>

        {/* CHARTS (ลุคใหม่แบบในรูป) */}
        <section className="card">
          <h2 style={{marginTop:0}}>Charts</h2>
          {(!data?.hourly) ? (
            <div className="muted">No hourly data.</div>
          ) : (
            <>
              <LineChart xs={data.hourly.time} ys={data.hourly.temperature_2m} height={compact?160:190} id="T"/>
              <div style={{height:10}}/>
              <BarChart  xs={data.hourly.time} ys={data.hourly.precipitation?.map(x=>x??0)} height={compact?120:140} id="P"/>
            </>
          )}
        </section>

        {/* MAP */}
        <section className="card">
          <h2 style={{marginTop:0}}>Map</h2>
          <div className="muted" style={{marginBottom:8}}>OpenStreetMap • marker follows the selected coordinates.</div>
          <div style={{borderRadius:18,overflow:'hidden',border:'1px solid var(--border)'}}>
            <iframe key={`${coords.lat}-${coords.lon}`} src={osm(coords.lat, coords.lon)} style={{width:'100%',height:compact?280:360,border:'0'}} loading="lazy" />
          </div>
          <div className="muted" style={{marginTop:6,fontSize:12}}>© OpenStreetMap contributors</div>
        </section>

        {/* FORECAST (ตารางบนจอใหญ่ / การ์ดบนมือถือ) */}
        <section className="card">
          <h2 style={{marginTop:0}}>Next hours (forecast)</h2>
          <div className="hour-table">
            {!hours.length && <div className="muted">No hourly data.</div>}
            {!!hours.length && (
              <div style={{marginTop:8, overflowX:'auto'}}>
                <table style={{tableLayout:'fixed',width:'100%'}}>
                  <thead><tr><th>Time</th><th>Temp (°C)</th><th>Precip (mm)</th><th>Wind (km/h)</th></tr></thead>
                  <tbody>
                    {hours.map((h,i)=>(
                      <tr key={i} style={{background:i%2?'rgba(0,0,0,0.02)':'transparent'}}>
                        <td>{new Date(h.time).toLocaleString()}</td>
                        <td style={{fontWeight:800}}>{h.temp ?? '—'}</td>
                        <td>{h.precip ?? 0}</td>
                        <td>{h.wind ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="hour-cards">
            {!hours.length && <div className="muted">No hourly data.</div>}
            {hours.map((h,i)=>(
              <div className="hour-card" key={i}>
                <div><div className="label">Time</div><div className="value">{new Date(h.time).toLocaleString()}</div></div>
                <div><div className="label">Temp (°C)</div><div className="value">{h.temp ?? '—'}</div></div>
                <div><div className="label">Precip (mm)</div><div className="value">{h.precip ?? 0}</div></div>
                <div><div className="label">Wind (km/h)</div><div className="value">{h.wind ?? '—'}</div></div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({title,value,chip}){
  return (
    <div style={{padding:'8px 6px'}}>
      <div className="muted" style={{fontSize:13}}>{title}</div>
      <div style={{fontSize:28,fontWeight:900,display:'flex',alignItems:'center',gap:8}}>
        {value} {chip && <span className="btn" style={{padding:'6px 10px',borderRadius:999}}>{chip}</span>}
      </div>
    </div>
  );
}
