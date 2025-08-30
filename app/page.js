'use client';
import {useEffect,useMemo,useState} from 'react';

/** ---------- Presets with flags ---------- */
const PRESETS = [
  { name: 'Bangkok',     country: 'TH', lat: 13.7563, lon: 100.5018, tz: 'Asia/Bangkok', accent: '#ffd1dc' },
  { name: 'Chiang Mai',  country: 'TH', lat: 18.7877, lon: 98.9931,  tz: 'Asia/Bangkok', accent: '#d1fae5' },
  { name: 'Tokyo',       country: 'JP', lat: 35.6762, lon: 139.6503, tz: 'Asia/Tokyo',   accent: '#c7f0ff' },
  { name: 'New York',    country: 'US', lat: 40.7128, lon: -74.0060, tz: 'America/New_York', accent:'#e9d5ff' },
];

const countryFlag = (code='')=>{
  // emoji flag from country code
  return code.replace(/./g, c => String.fromCodePoint(127397 + c.toUpperCase().charCodeAt(0)));
};

const windDirText = (deg)=>{
  if (deg==null) return '—';
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(deg/22.5)%16];
};

/** ---------- Tiny weather icon from WMO code ---------- */
const WeatherIcon = ({code=0})=>{
  // very small mapping for demo
  const sun = (
    <svg width="28" height="28" viewBox="0 0 24 24">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ffd1dc"/><stop offset="1" stopColor="#fff1b8"/></linearGradient></defs>
      <circle cx="12" cy="12" r="5.5" fill="url(#g)"/>
      <g stroke="#ffd1dc" strokeWidth="1.6" strokeLinecap="round">
        <path d="M12 2.6v2.8M12 18.6v2.8M2.6 12h2.8M18.6 12h2.8M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>
      </g>
    </svg>
  );
  const cloud = (
    <svg width="28" height="28" viewBox="0 0 24 24">
      <defs><linearGradient id="c" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#d7f2ff"/><stop offset="1" stopColor="#ece9ff"/></linearGradient></defs>
      <path d="M7 18a5 5 0 1 1 3-9a6 6 0 1 1 3 9H7z" fill="url(#c)"/>
    </svg>
  );
  // sunny-ish codes
  const sunny = [0,1];
  return sunny.includes(code) ? sun : cloud;
};

export default function Page(){
  const [coords,setCoords] = useState(PRESETS[0]);
  const [data,setData]     = useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]   = useState(null);

  const qs = useMemo(()=>new URLSearchParams({
    lat:String(coords.lat), lon:String(coords.lon), tz:coords.tz
  }),[coords]);

  useEffect(()=>{
    const run=async()=>{
      setLoading(true); setError(null);
      try{
        const res = await fetch(`/api/weather?${qs.toString()}`,{ next:{ revalidate:600 }});
        if(!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json(); setData(json);
      }catch(e){ setError(String(e)); } finally{ setLoading(false); }
    };
    run();
  },[qs]);

  const hours = useMemo(()=>{
    if(!data?.hourly) return [];
    const now = Date.now();
    const rows = data.hourly.time.map((t,i)=>({
      time:t,
      temp:data.hourly.temperature_2m?.[i],
      precip:data.hourly.precipitation?.[i],
      wind:data.hourly.wind_speed_10m?.[i],
    }));
    const start = rows.findIndex(r=>new Date(r.time).getTime()>=now);
    return rows.slice(start>=0?start:0,(start>=0?start:0)+12);
  },[data]);

  const current = data?.current;

  return (
    <div style={{display:'grid',gridTemplateColumns:'320px 1fr',gap:18}}>
      {/* LEFT: controls */}
      <aside className="card" style={{alignSelf:'start'}}>
        <h2 style={{display:'flex',alignItems:'center',gap:8}}>
          Location
          <span className="muted" style={{fontWeight:500,fontSize:12,marginLeft:'auto'}}>
            {countryFlag(coords.country)} {coords.name}
          </span>
        </h2>
        <p className="muted" style={{marginTop:-6}}>Choose a city or enter coordinates.</p>

        {/* Quick preset buttons */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:10,margin:'10px 0 14px'}}>
          {PRESETS.map(p=>(
            <button
              key={p.name}
              className="btn"
              onClick={()=>setCoords(p)}
              style={{
                justifyContent:'space-between',
                borderColor:'#e5e7eb',
                background:`linear-gradient(135deg, ${p.accent}, #ffffff)`,
              }}
              title={`${p.name}, ${p.country}`}
            >
              <span style={{fontSize:18}}>{countryFlag(p.country)}</span>
              <span style={{fontWeight:700}}>{p.name}</span>
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div className="row">
          <div>
            <label className="muted">City</label>
            <select
              value={`${coords.name}-${coords.country}`}
              onChange={e=>{
                const [name,country] = e.target.value.split('-');
                const found = PRESETS.find(p=>p.name===name && p.country===country);
                if(found) setCoords(found);
              }}
            >
              {PRESETS.map(p=>(
                <option key={`${p.name}-${p.country}`} value={`${p.name}-${p.country}`}>
                  {countryFlag(p.country)} {p.name}, {p.country}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="muted">Latitude</label>
            <input type="number" step="0.0001"
              value={coords.lat}
              onChange={e=>setCoords(c=>({...c,lat:parseFloat(e.target.value)}))}
            />
          </div>
          <div>
            <label className="muted">Longitude</label>
            <input type="number" step="0.0001"
              value={coords.lon}
              onChange={e=>setCoords(c=>({...c,lon:parseFloat(e.target.value)}))}
            />
          </div>
          <div>
            <label className="muted">Timezone</label>
            <input value={coords.tz} onChange={e=>setCoords(c=>({...c,tz:e.target.value}))}/>
          </div>
        </div>

        <div style={{display:'flex',gap:10,marginTop:12}}>
          <button className="btn" onClick={()=>setCoords({...coords})}>🔄 Refresh</button>
          <a className="btn" href="https://www.open-meteo.com/en/docs" target="_blank" rel="noreferrer">📖 API Docs</a>
        </div>
      </aside>

      {/* RIGHT: content */}
      <div style={{display:'grid',gridTemplateColumns:'1fr',gap:18}}>
        {/* Hero summary card */}
        <section className="card" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,alignItems:'center',
          background:`linear-gradient(135deg, ${coords.accent}, #ffffff)`}}>
          <div>
            <div className="muted" style={{fontSize:13}}>Now in</div>
            <div style={{fontWeight:900,fontSize:28,display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:24}}>{countryFlag(coords.country)}</span>
              {coords.name}
            </div>
            <div className="muted" style={{fontSize:13}}>{coords.lat.toFixed(4)}, {coords.lon.toFixed(4)} • {coords.tz}</div>
          </div>
          <div style={{justifySelf:'end',textAlign:'right'}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:10}}>
              <WeatherIcon code={current?.weather_code ?? 0}/>
              <div style={{fontSize:34,fontWeight:900}}>{current?.temperature_2m ?? '—'}°C</div>
            </div>
            <div className="muted" style={{fontSize:12}}>Feels like: {current?.apparent_temperature ?? '—'}°C</div>
          </div>
        </section>

        {/* Current conditions */}
        <section className="card">
          <h2>Current Conditions</h2>
          {loading && <div className="muted">Loading…</div>}
          {error && <div style={{color:'#ef4444'}}>Error: {error}</div>}
          {current && (
            <div className="row" style={{marginTop:6}}>
              <Stat title="Humidity" value={`${current.relative_humidity_2m}%`} />
              <Stat title="Precipitation" value={`${current.precipitation ?? 0} mm`} />
              <Stat title="Wind" value={`${current.wind_speed_10m} km/h`} chip={windDirText(current.wind_direction_10m)} />
            </div>
          )}
        </section>

        {/* Hourly table */}
        <section className="card">
          <h2>Next hours (forecast)</h2>
          {!hours.length && <div className="muted">No hourly data.</div>}
          {!!hours.length && (
            <div style={{overflowX:'auto',marginTop:8}}>
              <table>
                <thead>
                  <tr><th>Time</th><th>Temp (°C)</th><th>Precip (mm)</th><th>Wind (km/h)</th></tr>
                </thead>
                <tbody>
                  {hours.map((h,i)=>(
                    <tr key={i} style={{background:i%2? 'rgba(0,0,0,0.02)':'transparent'}}>
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
        </section>
      </div>
    </div>
  );
}

/** Small stat block */
function Stat({title,value,chip}){
  return (
    <div style={{padding:'8px 4px'}}>
      <div className="muted">{title}</div>
      <div style={{fontSize:26,fontWeight:900,display:'flex',alignItems:'center',gap:8}}>
        {value}
        {chip && <span className="pill">{chip}</span>}
      </div>
    </div>
  );
}
