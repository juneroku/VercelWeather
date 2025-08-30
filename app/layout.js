export const metadata = {
  title: "Weather Now — Pastel",
  description: "Pastel weather dashboard using Open-Meteo (no API key).",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
              <rect width="128" height="128" rx="26" fill="#fff"/>
              <circle cx="48" cy="46" r="22" fill="url(#sun)"/>
              <path d="M40 78a18 18 0 0 1 34-7a16 16 0 1 1 3 30H48a14 14 0 0 1-8-23z" fill="url(#cloud)"/>
            </svg>
          `)
          }
        />
        <style>{`
          :root{
            --bg:#fff; --txt:#1f2937; --muted:#6b7280; --border:#e5e7eb;
            --p1:#ffd1dc; --p2:#c7f0ff; --p3:#fff1b8; --p4:#e9d5ff; --p5:#d1fae5;
            --card:#fff; --btn:#fff; --shadow:0 10px 28px rgba(31,41,55,.08);
          }
          @media (prefers-color-scheme:dark){
            :root{ --bg:#0b1020; --txt:#e5e7eb; --muted:#97a3b6; --border:#1b2440; --card:#0f172a; --btn:#0c1328; --shadow:0 14px 34px rgba(0,0,0,.45);}
          }
          *{box-sizing:border-box}
          body{
            margin:0; color:var(--txt); background:var(--bg);
            background-image:
              radial-gradient(900px 600px at -10% -10%, rgba(199,240,255,.6), transparent 60%),
              radial-gradient(1000px 700px at 110% 0%, rgba(233,213,255,.5), transparent 60%),
              radial-gradient(700px 500px at 40% 120%, rgba(255,241,184,.4), transparent 60%);
            font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Noto Sans,Arial;
          }
          header{
            position:sticky;top:0;z-index:20;
            backdrop-filter:saturate(160%) blur(10px);
            background:rgba(255,255,255,.6); border-bottom:1px solid var(--border);
          }
          @media (prefers-color-scheme:dark){ header{background:rgba(11,16,32,.55);} }
          main{max-width:1160px;margin:0 auto;padding:24px}
          .brand{display:flex;align-items:center;gap:10px;font-weight:800}
          .logo{
            width:28px;height:28px;border-radius:10px;
            background:linear-gradient(135deg,var(--p1),var(--p3));box-shadow:var(--shadow)
          }
          footer{color:var(--muted);font-size:12px}
        `}</style>
      </head>
      <body>
        <header>
          <main style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
            <div className="brand"><div className="logo"/><div style={{fontSize:20}}>Weather Now</div></div>
            <div style={{display:'flex',gap:10,alignItems:'center'}}>
              <span style={{fontSize:13,color:'var(--muted)'}}>Open-Meteo • Next.js on Vercel</span>
            </div>
          </main>
        </header>
        <main>{children}</main>
        <footer style={{maxWidth:1160,margin:'24px auto',padding:'0 24px'}}>Data: Open-Meteo (no API key). UI: pastel & clean.</footer>
      </body>
    </html>
  );
}
