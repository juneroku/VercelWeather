import ThemeToggle from "./ThemeToggle";

export const metadata = {
  title: "Weather Now — Blue",
  description: "Blue, playful weather dashboard using Open-Meteo.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light dark" />
        <link
          rel="icon"
          href={
            "data:image/svg+xml," +
            encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
              <defs>
                <linearGradient id="sun" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stop-color="#ffe08a"/>
                  <stop offset="1" stop-color="#ffd1d1"/>
                </linearGradient>
                <linearGradient id="cloud" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stop-color="#cfe9ff"/>
                  <stop offset="1" stop-color="#e9f1ff"/>
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
            /* Light: blue & airy */
            --bg:#f7fbff;
            --text:#0b2545;
            --muted:#5b708b;
            --border:#dbe7ff;
            --card:#ffffff;
            --btn:#ffffff;
            --shadow:0 12px 36px rgba(9,30,66,.08);
            --radius:22px;

            --blue1:#e6f2ff; --blue2:#d4eeff; --blue3:#c3e6ff; --accent:#7cc4ff;
          }
          :root[data-theme="dark"]{
            /* Dark: rainy navy */
            --bg:#0b132b;
            --text:#eaf2ff;
            --muted:#9fb4d1;
            --border:#1d2b4a;
            --card:#0f1a34;
            --btn:#0d1830;
            --shadow:0 16px 44px rgba(0,0,0,.45);

            --blue1:#0f203d; --blue2:#0c1a33; --blue3:#0b162c; --accent:#5db1ff;
          }

          *{box-sizing:border-box}
          html,body{max-width:100%;overflow-x:hidden}
          body{
            margin:0; color:var(--text); background:var(--bg);
            background-image:
              radial-gradient(1000px 650px at -10% -10%, var(--blue1), transparent 60%),
              radial-gradient(1200px 750px at 110% 0%, var(--blue2), transparent 60%),
              radial-gradient(800px 520px at 40% 120%, var(--blue3), transparent 60%);
            font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Noto Sans", Arial;
          }

          header{
            position:sticky; top:0; z-index:20;
            backdrop-filter:saturate(160%) blur(10px);
            background:color-mix(in srgb, var(--bg) 60%, #ffffff 40%);
            border-bottom:1px solid var(--border);
          }

          main{max-width:1180px;margin:0 auto;padding:24px}

          .brand{display:flex;align-items:center;gap:12px;font-weight:900;letter-spacing:.3px}
          .logo{width:34px;height:34px;border-radius:14px;background:linear-gradient(135deg,#bfe3ff,#fff0d5);box-shadow:var(--shadow)}

          .muted{color:var(--muted)}
          .card{
            background:var(--card); border:1px solid var(--border); border-radius:var(--radius);
            box-shadow:var(--shadow); padding:18px;
            transition:transform .15s, box-shadow .15s, border-color .15s;
          }
          .card:hover{ transform:translateY(-2px); border-color:#cfe1ff; box-shadow:0 18px 44px rgba(93,177,255,.18); }

          .row{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}
          input,select{
            width:100%; padding:12px 14px; border-radius:16px; border:1px solid var(--border);
            background:var(--card); color:var(--text); outline:none;
            transition:border-color .15s, box-shadow .15s; appearance:none;
          }
          input:focus,select:focus{border-color:var(--accent);box-shadow:0 0 0 6px color-mix(in srgb, var(--accent) 25%, transparent)}
          .btn{
            display:inline-flex;align-items:center;gap:8px;padding:12px 14px;border-radius:16px;
            border:1px solid var(--border);background:var(--btn);cursor:pointer;
            transition:transform .1s, box-shadow .15s, border-color .15s;
          }
          .btn:hover{transform:translateY(-1px);border-color:#cfe1ff;box-shadow:var(--shadow)}

          /* page grid */
          .page-grid{display:grid;grid-template-columns:340px 1fr;gap:20px}
          .content-col{display:grid;grid-template-columns:1fr;gap:20px}
          @media (max-width:1024px){.page-grid{grid-template-columns:1fr}}

          /* Forecast on mobile: vertical cards */
          .hour-cards{display:none}
          @media (max-width:1024px){
            .hour-table{display:none}
            .hour-cards{display:grid;gap:12px}
            .hour-card{
              display:grid;grid-template-columns:1fr 1fr;gap:10px;
              padding:12px;border:1px solid var(--border);border-radius:16px;background:var(--card);box-shadow:var(--shadow)
            }
            .hour-card .label{color:var(--muted);font-size:12px}
            .hour-card .value{font-weight:700}
          }

          /* theme toggle for sun/rain in components */
          .theme-sun{display:inline-block}
          .theme-rain{display:none}
          :root[data-theme="dark"] .theme-sun{display:none}
          :root[data-theme="dark"] .theme-rain{display:inline-block}
        `}</style>
      </head>
      <body>
        <header>
          <main style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div className="brand"><div className="logo"/><div style={{fontSize:20}}>Weather Now</div></div>
            <div style={{display:'flex',gap:10,alignItems:'center'}}>
              <span className="muted" style={{fontSize:13}}>Open-Meteo • Next.js on Vercel</span>
              <ThemeToggle />
            </div>
          </main>
        </header>

        <main>{children}</main>

        <footer style={{maxWidth:1180,margin:'28px auto',padding:'0 24px'}} className="muted">
          Data: Open-Meteo (no API key). Design: blue & playful.
        </footer>
      </body>
    </html>
  );
}
