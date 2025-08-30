'use client';
import { useEffect, useMemo, useState } from 'react';

const PRESETS = [
  { key: 'TH-BKK', name: 'Bangkok',    country: 'TH', lat: 13.7563, lon: 100.5018, tz: 'Asia/Bangkok',     accent: '#ffd1dc' },
  { key: 'TH-CNX', name: 'Chiang Mai', country: 'TH', lat: 18.7877, lon: 98.9931,  tz: 'Asia/Bangkok',     accent: '#d1fae5' },
  { key: 'JP-TYO', name: 'Tokyo',      country: 'JP', lat: 35.6762, lon: 139.6503, tz: 'Asia/Tokyo',       accent: '#c7f0ff' },
  { key: 'US-NYC', name: 'New York',   country: 'US', lat: 40.7128, lon: -74.0060, tz: 'America/New_York', accent: '#e9d5ff' },
];
const flag = cc => cc.replace(/./g, c => String.fromCodePoint(127397 + c.toUpperCase().charCodeAt(0)));
const dirText = deg => (deg==null ? '—' : ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'][Math.round(deg/22.5)%16]);

const WeatherIcon = ({ code = 0, size = 36 }) => {
  const sunny = [0,1];
  return sunny.includes(code) ? (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <defs><linearGradient id="sun" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffd1dc"/><stop offset="1" stopColor="#fff1b8"/></linearGradient></defs>
      <circle cx="12" cy="12" r="6.2" fill="url(#sun)"/>
      <g stroke="#ffd1dc" strokeWidth="1.7" strokeLinecap="round">
        <path d="M12 2.8v3.0M12 18.2v3.0M2.8 12h3.0M18.2 12h3.0M5 5l2.2 2.2M17 17l2.2 2.2M19 5l-2.2 2.2M7 17L4.8 19.2"/>
      </g>
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <defs><linearGradient id="cl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d7f2ff"/><stop offset="1" stopColor="#ece9ff"/></linearGradient></defs>
      <path d="M7 18a5 5 0 1 1 3-9a6 6 0 1 1 3 9H7z" fill="url(#cl)"/>
    </svg>
  );
};

export default function Page() {
  const [coords, setCoords] = useState(PRESETS[0]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const params = useMemo(() => new URLSearchParams({ lat:String(coords.lat), lon:String(coords.lon), tz:coords.tz }), [coords]);

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError(null);
      try{
        const res = await fetch(`/api/weather?${params.toString()}`, { next: { revalidate: 600 }});
        if(!res.ok) throw new Error(`HTTP ${res.status}`);
        setData(await res.json());
      }catch(e){ setError(String(e)); }finally{ setLoading(false); }
    };
    load();
  }, [params]);

  const hours = useMemo(() => {
    if(!data?.hourly) return [];
    const now = Date.now();
    const rows = data.hourly.time.map((t,i)=>({
      time:t,
      temp:data.hourly.temperature_2m?.[i],
      precip:data.hourly.precipitation?.[i],
      wind:data.hourly.wind_speed_10m?.[i],
    }));
    const start = rows.findIndex(r => new Date(r.time).getTime() >= now);
    return rows.slice(start>=0?start:0, (start>=0?start:0)+12);
  }, [data]);

  const current = data?.current;

  return (
    <div style={{display:'grid', gridTemplateColumns:'340px 1fr', gap:20}}>
      {/* LEFT */}
      <aside className="card" style={{alignSelf:'start'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
          <h2 style={{margin:0}}>Location</h2>
          <span className="chip" style={{display:'inline-flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:18}}>{flag(coords.country)}</span>{coords.name}
          </span>
        </div>
        <p className="muted" style={{marginTop:2}}>Choose a city or enter coordinates.</p>

        <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:10,margin:'12px 0 14px'}}>
          {PRESETS.map(p=>(
            <button key={p.key} className="btn"
              onClick={()=>setCoords(p)}
              style={{justifyContent:'space-between', background:`linear-gradient(135deg, ${p.accent}, #ffffff)`, borderColor:'#e5e7eb'}}>
              <span style={{fontSize:18}}>{flag(p.country)}</span><strong>{p.name}</strong>
            </button>
          ))}
        </div>

        <div className="row">
          <div>
            <label className="muted">City</label>
            <select value={coords.key} onChange={e=>setCoords(PRESETS.find(p=>p.key===e.target.value) ?? PRESETS[0])}>
              {PRESETS.map(p=>(
                <option key={p.key} value={p.key}>{flag(p.country)} {p.name}, {p.country}</option>
              ))}
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

      {/* RIGHT */}
      <div style={{display:'grid', gridTemplateColumns:'1fr', gap:20}}>
        <section className="card" style={{display:'grid',gridTemplateColumns:'1.2fr .8fr',alignItems:'center',gap:12, background:`linear-gradient(135deg, ${coords.accent}, #ffffff)`}}>
          <div>
            <div className="muted" style={{fontSize:13,marginBottom:4}}>Now in</div>
            <div style={{display:'flex',alignItems:'center',gap:8,fontWeight:900,fontSize:28}}>
              <span style={{fontSize:24}}>{flag(coords.country)}</span>{coords.name}
            </div>
            <div className="muted" style={{fontSize:13}}>{coords.lat.toFixed(4)}, {coords.lon.toFixed(4)} • {coords.tz}</div>
          </div>
          <div style={{justifySelf:'end',textAlign:'right'}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:10}}>
              <WeatherIcon code={current?.weather_code ?? 0}/>
              <div style={{fontSize:36,fontWeight:900}}>{current?.temperature_2m ?? '—'}°C</div>
            </div>
            <div className="muted" style={{fontSize:12}}>Feels like: {current?.apparent_temperature ?? '—'}°C</div>
          </div>
        </section>

        <section className="card">
          <h2 style={{marginTop:0}}>Current Conditions</h2>
          {loading && <div className="muted">Loading…</div>}
          {error && <div style={{color:'#ef4444'}}>Error: {error}</div>}
          {current && (
            <div className="row" style={{marginTop:8}}>
              <Stat title="Humidity" value={`${current.relative_humidity_2m}%`}/>
              <Stat title="Precipitation" value={`${current.precipitation ?? 0} mm`}/>
              <Stat title="Wind" value={`${current.wind_speed_10m} km/h`} chip={dirText(current.wind_direction_10m)}/>
            </div>
          )}
        </section>

        {/* Forecast: Desktop = table, Mobile = cards (ไม่ต้องเลื่อนซ้าย) */}
        <section className="card">
          <h2 style={{marginTop:0}}>Next hours (forecast)</h2>

          {/* Desktop/Table */}
          <div className="hour-table">
            {!hours.length && <div className="muted">No hourly data.</div>}
            {!!hours.length && (
              <div style={{overflowX:'auto',marginTop:8}}>
                <table>
                  <thead>
                    <tr><th>Time</th><th>Temp (°C)</th><th>Precip (mm)</th><th>Wind (km/h)</th></tr>
                  </thead>
                  <tbody>
                    {hours.map((h,i)=>(
                      <tr key={i} style={{background:i%2?'rgba(0,0,0,0.02)':'transparent'}}>
                        <td>{new Date(h.time).toLocaleString()}</td>
                        <td style={{fontWeight:700}}>{h.temp ?? '—'}</td>
                        <td>{h.precip ?? 0}</td>
                        <td>{h.wind ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Mobile/Cards */}
          <div className="hour-cards">
            {hours.map((h,i)=>(
              <div className="hour-card" key={i}>
                <div>
                  <div className="label">Time</div>
                  <div className="value">{new Date(h.time).toLocaleString()}</div>
                </div>
                <div>
                  <div className="label">Temp (°C)</div>
                  <div className="value">{h.temp ?? '—'}</div>
                </div>
                <div>
                  <div className="label">Precip (mm)</div>
                  <div className="value">{h.precip ?? 0}</div>
                </div>
                <div>
                  <div className="label">Wind (km/h)</div>
                  <div className="value">{h.wind ?? '—'}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ title, value, chip }) {
  return (
    <div style={{padding:'8px 6px'}}>
      <div className="muted" style={{fontSize:13}}>{title}</div>
      <div style={{fontSize:28, fontWeight:900, display:'flex', alignItems:'center', gap:8}}>
        {value} {chip && <span className="chip">{chip}</span>}
      </div>
    </div>
  );
}
