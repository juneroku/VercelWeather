'use client';
import { useEffect, useMemo, useState } from 'react';

/* Presets + สีชิปตามประเทศ */
const PRESETS = [
  { key:'TH-BKK', name:'Bangkok',    country:'TH', region:'th', lat:13.7563, lon:100.5018, tz:'Asia/Bangkok'     },
  { key:'TH-CNX', name:'Chiang Mai', country:'TH', region:'th', lat:18.7877, lon:98.9931,  tz:'Asia/Bangkok'     },
  { key:'JP-TYO', name:'Tokyo',      country:'JP', region:'jp', lat:35.6762, lon:139.6503, tz:'Asia/Tokyo'       },
  { key:'US-NYC', name:'New York',   country:'US', region:'us', lat:40.7128, lon:-74.0060, tz:'America/New_York' },
];
const flag = cc => cc.replace(/./g, c => String.fromCodePoint(127397 + c.toUpperCase().charCodeAt(0)));
const dirText = d => (d==null ? '—' : ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'][Math.round(d/22.5)%16]);

/* Sun (light) + Rain (dark) */
const SunIcon = ({size=56}) => (
  <svg className="theme-sun" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <defs><linearGradient id="sunG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFE08A"/><stop offset="1" stopColor="#FFB3A7"/></linearGradient></defs>
    <circle cx="12" cy="12" r="6.6" fill="url(#sunG)"><animate attributeName="r" values="6.2;6.8;6.2" dur="3s" repeatCount="indefinite"/></circle>
    <g stroke="#FFC76D" strokeWidth="1.8" strokeLinecap="round" opacity=".9">
      <path d="M12 2.7v3M12 18.3v3M2.7 12h3M18.3 12h3M5 5l2.2 2.2M17 17l2.2 2.2M19 5l-2.2 2.2M7 17 4.8 19.2"/>
    </g>
  </svg>
);
const RainIcon = ({size=56}) => (
  <svg className="theme-rain" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <defs><linearGradient id="cl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8EC5FF"/><stop offset="1" stopColor="#CFE6FF"/></linearGradient></defs>
    <path d="M7 17a5 5 0 1 1 3-9a6 6 0 1 1 3 9H7z" fill="url(#cl)"/>
    <g stroke="#8EC5FF" strokeLinecap="round" strokeWidth="1.6">
      <path d="M9 19v3M12 19v2.5M15 19v3"><animate attributeName="opacity" values="1;.2;1" dur="1.6s" repeatCount="indefinite"/></path>
    </g>
  </svg>
);

/* Lightweight charts (SVG) */
function LineChart({ xs, ys, height=180, unit="°C", id="t" }) {
  if (!ys?.length) return <div className="muted">No data</div>;
  const w=560,h=height,p=16; const min=Math.min(...ys)-1, max=Math.max(...ys)+1;
  const x=i=>p+(i/(ys.length-1))*(w-2*p), y=v=>p+(1-(v-min)/(max-min))*(h-2*p);
  const d=ys.map((v,i)=>`${i?'L':'M'}${x(i)},${y(v)}`).join(' ');
  return (
    <svg role="img" aria-labelledby={`${id}-t ${id}-d`} viewBox={`0 0 ${w} ${h}`} width="100%" height={h}>
      <title id={`${id}-t`}>Temperature next hours</title><desc id={`${id}-d`}>Line chart</desc>
      <rect x="0" y="0" width={w} height={h} rx="16" fill="var(--surface)" stroke="var(--border)"/>
      {Array.from({length:5},(_,i)=>{const yy=p+i*(h-2*p)/4; return <line key={i} x1={p} y1={yy} x2={w-p} y2={yy} stroke="var(--border)" strokeDasharray="6 6"/>})}
      <path d={d} fill="none" stroke="var(--accent)" strokeWidth="3"/>
      {ys.map((v,i)=><circle key={i} cx={x(i)} cy={y(v)} r="3.5" fill="var(--accent)" />)}
    </svg>
  );
}
function BarChart({ xs, ys, height=140, unit="mm", id="p" }) {
  if (!ys?.length) return <div className="muted">No data</div>;
  const w=560,h=height,p=16; const ymax=Math.max(1,...ys); const bw=(w-2*p)/ys.length - 4;
  return (
    <svg role="img" aria-labelledby={`${id}-t ${id}-d`} viewBox={`0 0 ${w} ${h}`} width="100%" height={h}>
      <title id={`${id}-t`}>Precipitation next hours</title><desc id={`${id}-d`}>Bar chart</desc>
      <rect x="0" y="0" width={w} height={h} rx="16" fill="var(--surface)" stroke="var(--border)"/>
      {ys.map((v,i)=>{const x=p+i*((w-2*p)/ys.length); const hh=(v/ymax)*(h-2*p);
        return <rect key={i} x={x} y={h-p-hh} width={bw} height={hh} rx="6" fill="color-mix(in srgb, var(--accent) 75%, white)"/>;})}
    </svg>
  );
}

/* Map */
const osm = (lat, lon, d=0.12) =>
  `https://www.openstreetmap.org/export/embed.html?bbox=${(lon-d).toFixed(4)},${(lat-d).toFixed(4)},${(lon+d).toFixed(4)},${(lat+d).toFixed(4)}&layer=mapnik&marker=${lat.toFixed(4)},${lon.toFixed(4)}`;

export default function Page(){
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
    return rows.slice(s>=0?s:0,(s>=0?s:0)+12);
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
        {/* HERO (คอนทราสต์สูง + ลูกเล่น) */}
        <section className="card hero" style={{
          display:'grid',gridTemplateColumns:'1.2fr .8fr',alignItems:'center',gap:16,
          background:'linear-gradient(135deg, rgba(188,221,255,.95), rgba(255,255,255,.99))'
        }}>
          <div>
            <div className="muted" style={{fontSize:13,marginBottom:4}}>Now in</div>
            <div style={{display:'flex',alignItems:'center',gap:10,fontWeight:900,fontSize:30}}>
              <span style={{fontSize:26}}>{flag(coords.country)}</span>
              <span className="title">{coords.name}</span>
            </div>
            <div className="muted" style={{fontSize:13}}>{coords.lat.toFixed(4)}, {coords.lon.toFixed(4)} • {coords.tz}</div>
          </div>
          <div style={{justifySelf:'end',textAlign:'right'}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:12}}>
              <SunIcon/><RainIcon/>
              <div style={{fontSize:40,fontWeight:900}}>{cur?.temperature_2m ?? '—'}°C</div>
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

        {/* CHARTS */}
        <section className="card">
          <h2 style={{marginTop:0}}>Charts</h2>
          {(!data?.hourly) ? (
            <div className="muted">No hourly data.</div>
          ) : (
            <>
              <LineChart xs={data.hourly.time} ys={data.hourly.temperature_2m} id="T"/>
              <BarChart  xs={data.hourly.time} ys={data.hourly.precipitation?.map(x=>x??0)} id="P"/>
            </>
          )}
        </section>

        {/* MAP */}
        <section className="card">
          <h2 style={{marginTop:0}}>Map</h2>
          <div className="muted" style={{marginBottom:8}}>OpenStreetMap • marker follows the selected coordinates.</div>
          <div style={{borderRadius:18,overflow:'hidden',border:'1px solid var(--border)'}}>
            <iframe key={`${coords.lat}-${coords.lon}`} src={osm(coords.lat, coords.lon)} style={{width:'100%',height:360,border:'0'}} loading="lazy" />
          </div>
          <div className="muted" style={{marginTop:6,fontSize:12}}>© OpenStreetMap contributors</div>
        </section>

        {/* FORECAST */}
        <section className="card">
          <h2 style={{marginTop:0}}>Next hours (forecast)</h2>
          <div className="hour-table">
            {!hours.length && <div className="muted">No hourly data.</div>}
            {!!hours.length && (
              <div style={{marginTop:8}}>
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
