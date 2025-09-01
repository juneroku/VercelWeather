'use client';
import { useEffect, useMemo, useState } from 'react';

/* Presets */
const PRESETS = [
  { key:'TH-BKK', name:'Bangkok',    country:'TH', lat:13.7563, lon:100.5018, tz:'Asia/Bangkok',     accent:'#bfe3ff' },
  { key:'TH-CNX', name:'Chiang Mai', country:'TH', lat:18.7877, lon:98.9931,  tz:'Asia/Bangkok',     accent:'#d7f7ff' },
  { key:'JP-TYO', name:'Tokyo',      country:'JP', lat:35.6762, lon:139.6503, tz:'Asia/Tokyo',       accent:'#cfe9ff' },
  { key:'US-NYC', name:'New York',   country:'US', lat:40.7128, lon:-74.0060, tz:'America/New_York', accent:'#d4eeff' },
];

const flag = cc => cc.replace(/./g, c => String.fromCodePoint(127397 + c.toUpperCase().charCodeAt(0)));
const dirText = deg => (deg==null ? '—' : ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'][Math.round(deg/22.5)%16]);

/* Sun (light) + Rain (dark) icons */
const SunIcon = ({size=48}) => (
  <svg className="theme-sun" width={size} height={size} viewBox="0 0 24 24">
    <defs><linearGradient id="sunG" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#ffe08a"/><stop offset="1" stopColor="#ffd1d1"/></linearGradient></defs>
    <circle cx="12" cy="12" r="6.2" fill="url(#sunG)">
      <animate attributeName="r" values="5.8;6.5;5.8" dur="3s" repeatCount="indefinite"/>
    </circle>
    <g stroke="#ffd1a6" strokeWidth="1.6" strokeLinecap="round" opacity=".9">
      <path d="M12 2.7v3M12 18.3v3M2.7 12h3M18.3 12h3M5 5l2.2 2.2M17 17l2.2 2.2M19 5l-2.2 2.2M7 17 4.8 19.2"/>
    </g>
  </svg>
);
const RainIcon = ({size=48}) => (
  <svg className="theme-rain" width={size} height={size} viewBox="0 0 24 24">
    <defs>
      <linearGradient id="cl" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#a8cfff"/><stop offset="1" stopColor="#d4e6ff"/>
      </linearGradient>
    </defs>
    <path d="M7 17a5 5 0 1 1 3-9a6 6 0 1 1 3 9H7z" fill="url(#cl)"/>
    <g stroke="#8ec5ff" strokeLinecap="round">
      <path d="M9 19v2M12 19v3M15 19v2" strokeWidth="1.6">
        <animate attributeName="opacity" values="1;.2;1" dur="1.6s" repeatCount="indefinite"/>
      </path>
    </g>
  </svg>
);

/* Simple SVG charts (no libs) */
function LineChart({ xs, ys, height=160, min, max, unit="°C" }) {
  if (!xs?.length || !ys?.length) return <div className="muted">No data</div>;
  const w = 560, h = height, p = 16;
  const ymin = min ?? Math.min(...ys) - 1;
  const ymax = max ?? Math.max(...ys) + 1;
  const toX = i => p + (i/(ys.length-1))*(w-2*p);
  const toY = v => p + (1-(v-ymin)/(ymax-ymin))*(h-2*p);
  const d = ys.map((v,i)=>`${i?'L':'M'}${toX(i)},${toY(v)}`).join(' ');
  const ticks = 4;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{display:'block'}}>
      <rect x="0" y="0" width={w} height={h} rx="16" fill="var(--card)" stroke="var(--border)"/>
      {/* grid */}
      {Array.from({length:ticks+1},(_,i)=>{
        const y = p + i*(h-2*p)/ticks;
        return <line key={i} x1={p} y1={y} x2={w-p} y2={y} stroke="var(--border)" strokeDasharray="4 6"/>;
      })}
      {/* line */}
      <path d={d} fill="none" stroke="var(--accent)" strokeWidth="3"/>
      {/* dots */}
      {ys.map((v,i)=>(
        <circle key={i} cx={toX(i)} cy={toY(v)} r="3.5" fill="var(--accent)" />
      ))}
      {/* labels */}
      <text x={w-p} y={p+14} fontSize="12" fill="var(--muted)" textAnchor="end">
        max {ymax.toFixed(1)}{unit}
      </text>
      <text x={w-p} y={h-6} fontSize="12" fill="var(--muted)" textAnchor="end">
        min {ymin.toFixed(1)}{unit}
      </text>
    </svg>
  );
}

function BarChart({ xs, ys, height=120, unit="mm" }) {
  if (!xs?.length || !ys?.length) return <div className="muted">No data</div>;
  const w = 560, h = height, p = 16;
  const ymax = Math.max(1, ...ys);
  const barW = (w - 2*p) / ys.length - 4;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{display:'block'}}>
      <rect x="0" y="0" width={w} height={h} rx="16" fill="var(--card)" stroke="var(--border)"/>
      {ys.map((v,i)=>{
        const x = p + i*((w-2*p)/ys.length);
        const hval = (v / ymax) * (h - 2*p);
        return <rect key={i} x={x} y={h-p-hval} width={barW} height={hval}
          rx="6" fill="color-mix(in srgb, var(--accent) 70%, #ffffff)" />;
      })}
      <text x={w-p} y={p+14} fontSize="12" fill="var(--muted)" textAnchor="end">
        max {ymax.toFixed(1)} {unit}
      </text>
    </svg>
  );
}

/* OSM embed */
const osmEmbed = (lat, lon, delta=0.12) =>
  `https://www.openstreetmap.org/export/embed.html?bbox=${(lon-delta).toFixed(4)},${(lat-delta).toFixed(4)},${(lon+delta).toFixed(4)},${(lat+delta).toFixed(4)}&layer=mapnik&marker=${lat.toFixed(4)},${lon.toFixed(4)}`;

export default function Page() {
  const [coords, setCoords] = useState(PRESETS[0]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const params = useMemo(() => new URLSearchParams({
    lat:String(coords.lat), lon:String(coords.lon), tz:coords.tz
  }), [coords]);

  useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      try {
        const res = await fetch(`/api/weather?${params.toString()}`, { next: { revalidate: 600 } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setData(await res.json());
      } catch (e) { setError(String(e)); } finally { setLoading(false); }
    })();
  }, [params]);

  const current = data?.current;

  // build hourly arrays
  const hours = useMemo(() => {
    if (!data?.hourly) return [];
    const now = Date.now();
    const rows = data.hourly.time.map((t,i)=>({
      time:t,
      temp:data.hourly.temperature_2m?.[i],
      precip:data.hourly.precipitation?.[i] ?? 0,
      wind:data.hourly.wind_speed_10m?.[i],
    }));
    const start = rows.findIndex(r => new Date(r.time).getTime() >= now);
    return rows.slice(start>=0?start:0, (start>=0?start:0)+12);
  }, [data]);

  const xs = hours.map(h => h.time);
  const temps = hours.map(h => h.temp ?? 0);
  const precs = hours.map(h => h.precip ?? 0);

  return (
    <div className="page-grid">
      {/* LEFT: controls */}
      <aside className="card" style={{alignSelf:'start'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
          <h2 style={{margin:0}}>Location</h2>
          <span className="chip" style={{display:'inline-flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:18}}>{flag(coords.country)}</span>{coords.name}
          </span>
        </div>
        <p className="muted" style={{marginTop:2}}>Choose a city or enter coordinates.</p>

        {/* Quick city chips */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:10,margin:'12px 0 14px'}}>
          {PRESETS.map(p=>(
            <button key={p.key} className="btn"
              onClick={()=>setCoords(p)}
              style={{justifyContent:'space-between', background:`linear-gradient(135deg, ${p.accent}, #ffffff)`}}>
              <span style={{fontSize:18}}>{flag(p.country)}</span><strong>{p.name}</strong>
            </button>
          ))}
        </div>

        {/* Inputs */}
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

      {/* RIGHT: content */}
      <div className="content-col">
        {/* Hero: sun(light)/rain(dark) */}
        <section className="card" style={{
          display:'grid',gridTemplateColumns:'1.2fr .8fr',alignItems:'center',gap:12,
          background:`linear-gradient(135deg, ${coords.accent}, #ffffff)`}}>
          <div>
            <div className="muted" style={{fontSize:13,marginBottom:4}}>Now in</div>
            <div style={{display:'flex',alignItems:'center',gap:10,fontWeight:900,fontSize:28}}>
              <span style={{fontSize:24}}>{flag(coords.country)}</span>{coords.name}
            </div>
            <div className="muted" style={{fontSize:13}}>{coords.lat.toFixed(4)}, {coords.lon.toFixed(4)} • {coords.tz}</div>
          </div>
          <div style={{justifySelf:'end',textAlign:'right'}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:12}}>
              <SunIcon/><RainIcon/>
              <div style={{fontSize:36,fontWeight:900}}>{current?.temperature_2m ?? '—'}°C</div>
            </div>
            <div className="muted" style={{fontSize:12}}>Feels like: {current?.apparent_temperature ?? '—'}°C</div>
          </div>
        </section>

        {/* Current */}
        <section className="card">
          <h2 style={{marginTop:0}}>Current Conditions</h2>
          {loading && <div className="muted">Loading…</div>}
          {error && <div style={{color:'#ef4444'}}>Error: {error}</div>}
          {current && (
            <div className="row" style={{marginTop:8}}>
              <Stat title="Humidity" value={`${current.relative_humidity_2m}%`} />
              <Stat title="Precipitation" value={`${current.precipitation ?? 0} mm`} />
              <Stat title="Wind" value={`${current.wind_speed_10m} km/h`} chip={dirText(current.wind_direction_10m)} />
            </div>
          )}
        </section>

        {/* Charts */}
        <section className="card">
          <h2 style={{marginTop:0}}>Charts</h2>
          {!hours.length ? (
            <div className="muted">No hourly data.</div>
          ) : (
            <div style={{display:'grid',gridTemplateColumns:'1fr',gap:16}}>
              <div>
                <div className="muted" style={{marginBottom:6}}>Temperature next hours</div>
                <LineChart xs={xs} ys={temps} unit="°C" />
              </div>
              <div>
                <div className="muted" style={{marginBottom:6}}>Precipitation next hours</div>
                <BarChart xs={xs} ys={precs} unit="mm" />
              </div>
            </div>
          )}
        </section>

        {/* Map */}
        <section className="card">
          <h2 style={{marginTop:0}}>Map</h2>
          <div className="muted" style={{marginBottom:8}}>OpenStreetMap (pan/zoom): marker follows the selected coordinates.</div>
          <div style={{borderRadius:16, overflow:'hidden', border:'1px solid var(--border)'}}>
            <iframe
              key={`${coords.lat}-${coords.lon}`}
              src={osmEmbed(coords.lat, coords.lon)}
              style={{width:'100%', height:360, border:'0'}}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="muted" style={{marginTop:6,fontSize:12}}>
            © OpenStreetMap contributors
          </div>
        </section>

        {/* Forecast: table (desktop) / cards (mobile) */}
        <section className="card">
          <h2 style={{marginTop:0}}>Next hours (forecast)</h2>

          <div className="hour-table">
            {!hours.length && <div className="muted">No hourly data.</div>}
            {!!hours.length && (
              <div style={{marginTop:8}}>
                <table style={{tableLayout:'fixed',width:'100%'}}>
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

function Stat({ title, value, chip }) {
  return (
    <div style={{padding:'8px 6px'}}>
      <div className="muted" style={{fontSize:13}}>{title}</div>
      <div style={{fontSize:28,fontWeight:900,display:'flex',alignItems:'center',gap:8}}>
        {value} {chip && <span className="chip">{chip}</span>}
      </div>
    </div>
  );
}
