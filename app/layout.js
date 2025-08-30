export const metadata = {
  title: "Weather Now — Pastel",
  description: "Simple weather dashboard powered by Open-Meteo (no API key).",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Favicon: sun + cloud pastel */}
        <link
          rel="icon"
          href={
            "data:image/svg+xml," +
            encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stop-color="#ffd1dc"/>
                  <stop offset="1" stop-color="#fff1b8"/>
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stop-color="#d1f1ff"/>
                  <stop offset="1" stop-color="#e8e8ff"/>
                </linearGradient>
              </defs>
              <rect width="128" height="128" rx="28" fill="#ffffff"/>
              <circle cx="52" cy="48" r="22" fill="url(#g1)"/>
              <g fill="none" stroke="#ffd1dc" stroke-width="4" stroke-linecap="round">
                <path d="M52 16v8M52 72v8M20 48h8M76 48h8M30 26l6 6M30 70l6-6M68 26l-6 6M68 70l-6-6"/>
              </g>
              <path d="M42 82a18 18 0 0 1 33-9a16 16 0 1 1 3 31H48a14 14 0 0 1-6-22z" fill="url(#g2)"/>
            </svg>
          `)
          }
        />

        <style>{`
          :root {
            --bg: #ffffff;
            --text: #1f2937;
            --subtle: #6b7280;
            --border: #e5e7eb;

            /* Pastel accents */
            --p1: #ffd1dc;  /* pink */
            --p2: #c7f0ff;  /* sky */
            --p3: #fff1b8;  /* vanilla */
            --p4: #e9d5ff;  /* lavender */
            --p5: #d1fae5;  /* mint */

            --card: #ffffff;
            --btn: #ffffff;
            --shadow: 0 8px 24px rgba(31,41,55,.08);
          }

          @media (prefers-color-scheme: dark) {
            :root {
              --bg: #0b1020;
              --text: #e5e7eb;
              --subtle: #9aa3b2;
              --border: #1f2a44;
              --card: #0f172a;
              --btn: #0e1326;
              --shadow: 0 10px 28px rgba(0,0,0,.35);
            }
          }

          * { box-sizing: border-box; }
          html, body { height: 100%; }
          body {
            margin: 0; color: var(--text); background: var(--bg);
            background-image:
              radial-gradient(800px 500px at 10% -10%, var(--p2,.4) 0%, transparent 60%),
              radial-gradient(900px 600px at 110% 10%, var(--p4,.4) 0%, transparent 60%),
              radial-gradient(600px 400px at 40% 120%, var(--p3,.35) 0%, transparent 60%);
            font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, 'Noto Sans', 'Helvetica Neue', Arial;
          }

          header {
            position: sticky; top: 0; z-index: 20;
            backdrop-filter: saturate(160%) blur(10px);
            background: rgba(255,255,255,.6);
            border-bottom: 1px solid var(--border);
          }
          @media (prefers-color-scheme: dark) {
            header { background: rgba(11,16,32,.55); }
          }

          main { max-width: 1040px; margin: 0 auto; padding: 24px; }
          .brand { display:flex; align-items:center; gap:10px; font-weight:800; }
          .brand-logo {
            width: 28px; height: 28px; border-radius: 10px;
            background: linear-gradient(135deg, var(--p1), var(--p3));
            box-shadow: var(--shadow);
          }

          .row { display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; }
          .card {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 18px; padding: 18px;
            box-shadow: var(--shadow);
            transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease;
          }
          .card:hover { transform: translateY(-2px); border-color: #dbeafe; box-shadow: 0 14px 36px rgba(99,102,241,.15); }

          h2 { margin: 0 0 8px; font-size: 18px; }
          .muted { color: var(--subtle); }

          input, select {
            width: 100%; padding: 12px 14px; border-radius: 14px;
            border: 1px solid var(--border); background: #fff; color: var(--text);
            outline: none; transition: border-color .15s ease, box-shadow .15s ease;
          }
          input:focus, select:focus { border-color: #a5b4fc; box-shadow: 0 0 0 4px rgba(165,180,252,.25); }

          .stack { display:flex; gap: 10px; flex-wrap: wrap; }
          .btn {
            display:inline-flex; align-items:center; gap:8px;
            padding: 10px 14px; border-radius: 12px;
            background: var(--btn); border: 1px solid var(--border); cursor: pointer;
            transition: transform .1s ease, box-shadow .15s ease, border-color .15s ease;
          }
          .btn:hover { transform: translateY(-1px); border-color:#d1d5db; box-shadow: var(--shadow); }

          table { width:100%; border-collapse: collapse; }
          th, td { padding: 10px 12px; border-bottom: 1px dashed var(--border); text-align:left; font-size: 14px; }
          .pill {
            padding: 4px 10px; border-radius:999px; border:1px solid var(--border);
            background: linear-gradient(135deg, var(--p5), #ffffff);
          }

          footer { color: var(--subtle); font-size: 12px; }
        `}</style>
      </head>
      <body>
        <header>
          <main style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:12}}>
            <div className="brand">
              <div className="brand-logo" />
              <div style={{fontSize:20}}>Weather Now</div>
            </div>
            <div className="muted" style={{fontSize:14}}>Open-Meteo • Next.js on Vercel</div>
          </main>
        </header>

        <main>{children}</main>

        <footer style={{maxWidth:1040, margin:'24px auto', padding:'0 24px'}}>
          <div>Data by Open-Meteo (free, no API key). Design: pastel/clean.</div>
        </footer>
      </body>
    </html>
  );
}
