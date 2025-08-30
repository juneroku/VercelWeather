export const metadata = {
  title: "Weather Now — Pastel Modern",
  description: "Pastel weather dashboard using Open-Meteo (no API key).",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Pastel sun+cloud favicon */}
        <link
          rel="icon"
          href={
            "data:image/svg+xml," +
            encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
              <defs>
                <linearGradient id="sun" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stop-color="#ffd1dc"/>
                  <stop offset="1" stop-color="#fff1b8"/>
                </linearGradient>
                <linearGradient id="cloud" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stop-color="#d7f2ff"/>
                  <stop offset="1" stop-color="#ece9ff"/>
                </linearGradient>
              </defs>
              <rect width="128" height="128" rx="28" fill="#fff"/>
              <circle cx="48" cy="44" r="22" fill="url(#sun)"/>
              <path d="M38 84a18 18 0 0 1 34-8a16 16 0 1 1 3 30H48a14 14 0 0 1-10-22z" fill="url(#cloud)"/>
            </svg>
          `)
          }
        />
        <style>{`
          :root{
            --bg:#ffffff; --text:#0f172a; --muted:#64748b; --border:#e5e7eb;
            --card:#ffffff; --btn:#ffffff;
            --p1:#ffd1dc; --p2:#c7f0ff; --p3:#fff1b8; --p4:#e9d5ff; --p5:#d1fae5;
            --shadow:0 10px 30px rgba(2,6,23,.08);
            --radius:22px;
          }
          @media (prefers-color-scheme:dark){
            :root{
              --bg:#0b1020; --text:#e5e7eb; --muted:#9aa3b2; --border:#1e2a44;
              --card:#0f172a; --btn:#0c1326; --shadow:0 14px 38px rgba(0,0,0,.45);
            }
          }
          *{box-sizing:border-box}
          body{
            margin:0; color:var(--text); background:var(--bg);
            background-image:
              radial-gradient(900px 600px at -10% -10%, rgba(199,240,255,.5), transparent 60%),
              radial-gradient(1100px 700px at 110% 0%, rgba(233,213,255,.45), transparent 60%),
              radial-gradient(700px 500px at 40% 120%, rgba(255,241,184,.35), transparent 60%);
            font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Noto Sans", Arial;
          }
          header{
            position:sticky; top:0; z-index:20;
            backdrop-filter:saturate(160%) blur(10px);
            background:rgba(255,255,255,.6); border-bottom:1px solid var(--border);
          }
          @media (prefers-color-scheme:dark){ header{ background:rgba(11,16,32,.55); } }
          main{ max-width:1180px; margin:0 auto; padding:24px; }
          .brand{display:flex; align-items:center; gap:12px; font-weight:900; letter-spacing:.3px}
          .logo{ width:32px; height:32px; border-radius:12px;
            background:linear-gradient(135deg,var(--p1),var(--p3)); box-shadow:var(--shadow) }
          .card{ background:var(--card); border:1px solid var(--border); border-radius:var(--radius);
            box-shadow:var(--shadow); padding:18px; transition:transform .15s, box-shadow .15s, border-color .15s; }
          .card:hover{ transform:translateY(-2px); border-color:#dbeafe; box-shadow:0 18px 44px rgba(99,102,241,.18); }
          .muted{ color:var(--muted); }
          .row{ display:grid; grid-template-columns: repeat(auto-fit,minmax(220px,1fr)); gap:14px; }
          input,select{
            width:100%; padding:12px 14px; border-radius:16px; border:1px solid var(--border);
            background:#fff; color:var(--text); outline:none;
            transition:border-color .15s, box-shadow .15s; appearance:none;
          }
          input:focus,select:focus{ border-color:#a5b4fc; box-shadow:0 0 0 6px rgba(165,180,252,.25); }
          .btn{
            display:inline-flex; align-items:center; gap:8px; padding:12px 14px; border-radius:16px;
            border:1px solid var(--border); background:var(--btn); cursor:pointer;
            transition:transform .1s, box-shadow .15s, border-color .15s;
          }
          .btn:hover{ transform:translateY(-1px); border-color:#d1d5db; box-shadow:var(--shadow); }
          table{ width:100%; border-collapse:collapse; }
          th,td{ padding:11px 12px; border-bottom:1px dashed var(--border); text-align:left; font-size:14px; }
          .chip{ padding:6px 12px; border-radius:999px; border:1px solid var(--border);
            background:linear-gradient(135deg,#f8fafc,#ffffff); }
          footer{ color:var(--muted); font-size:12px; }
        `}</style>
      </head>
      <body>
        <header>
          <main style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div className="brand"><div className="logo"/><div style={{fontSize:20}}>Weather Now</div></div>
            <div className="muted" style={{fontSize:13}}>Open-Meteo • Next.js on Vercel</div>
          </main>
        </header>

        <main>{children}</main>

        <footer style={{maxWidth:1180, margin:'28px auto', padding:'0 24px'}}>
          Data: Open-Meteo (no API key). Design: rounded pastel.
        </footer>
      </body>
    </html>
  );
}
