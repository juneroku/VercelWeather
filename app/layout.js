import ThemeToggle from "./ThemeToggle";
import ContrastToggle from "./ContrastToggle";

export const metadata = {
  title: "Weather Now • Blue Aurora",
  description: "Playful, contrast-safe weather dashboard.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light dark" />
        <style>{`
          /* ===== WCAG-safe design tokens ===== */
          :root{
            --bg:#F5FAFF; --surface:#FFFFFF; --text:#0B1220; --muted:#475569; --border:#CFE1FF;
            --accent:#1E40AF; --accent-on:#FFFFFF; --shadow:0 14px 40px rgba(9,30,66,.10);
            --radius:24px;

            /* Sky (light) */
            --sky-top:#e7f3ff; --sky-mid:#f0f7ff; --sky-bottom:#ffffff;

            /* Hero title color (force dark text even in dark mode) */
            --hero-text:#0B1220;

            /* Charts (light) */
            --chart-grid:#E6EEFF;  --chart-line:#2F52D9; --chart-dot:#2F52D9; --chart-bar:#6F8DFF;
          }
          :root[data-theme="dark"]{
            --bg:#0B1220; --surface:#0F172A; --text:#F8FAFC; --muted:#C7D2FE; --border:#1E293B;
            --accent:#60A5FA; --accent-on:#0B1220; --shadow:0 18px 48px rgba(0,0,0,.45);

            /* Sky (dark) */
            --sky-top:#0b1220; --sky-mid:#0e1628; --sky-bottom:#0f172a;

            --hero-text:#0B1220; /* hero ใช้สีเข้มเสมอให้อ่านง่าย */

            /* Charts (dark) */
            --chart-grid:#1E2A44; --chart-line:#8FB4FF; --chart-dot:#8FB4FF; --chart-bar:#5FA1FF;
          }
          :root[data-contrast="hc"]{
            --bg:#fff; --surface:#fff; --text:#000; --muted:#1f2937; --border:#0b1220;
            --accent:#0036D6; --accent-on:#fff; --shadow:0 0 0 rgba(0,0,0,0);

            --chart-grid:#111; --chart-line:#000; --chart-dot:#000; --chart-bar:#0036D6;
          }

          /* ===== Global ===== */
          *{box-sizing:border-box}
          html,body{max-width:100%;overflow-x:hidden}
          body{
            margin:0; color:var(--text);
            background: linear-gradient(180deg,var(--sky-top) 0%, var(--sky-mid) 55%, var(--sky-bottom) 100%);
            font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Noto Sans", Arial;
            line-height:1.35;
          }

          /* ===== Aurora layer (soft motion) ===== */
          @keyframes aurora { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
          .aurora{ position:fixed; inset:0; pointer-events:none; z-index:-2; overflow:hidden; }
          .aurora > div{
            position:absolute; left:0; top:10vh; width:200%; height:40vh;
            background: radial-gradient(60% 120% at 40% 50%, rgba(140,197,255,.28), transparent 60%),
                        radial-gradient(40% 120% at 70% 50%, rgba(186,219,255,.24), transparent 60%);
            animation: aurora 40s linear infinite;
          }
          :root[data-theme="dark"] .aurora > div{
            background: radial-gradient(60% 120% at 40% 50%, rgba(96,165,250,.25), transparent 60%),
                        radial-gradient(40% 120% at 70% 50%, rgba(59,130,246,.18), transparent 60%);
          }
          @media (prefers-reduced-motion: reduce){ .aurora > div{ animation:none } }

          /* ===== Bottom clouds only ===== */
          @keyframes drift { from { background-position: 0 0; } to { background-position: -1600px 0; } }
          body::before{
            content:""; position:fixed; inset:0; pointer-events:none; z-index:-1;
            background-repeat: repeat-x; background-size: 1600px auto; background-position: bottom left;
            background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='240' viewBox='0 0 1600 240'%3E%3Cg fill='%23EAF4FF' opacity='0.95'%3E%3Cpath d='M0 180 C 110 150 220 150 330 180 C 410 140 520 140 610 180 C 690 160 790 160 880 180 C 970 150 1060 150 1150 180 L1600 180 1600 240 0 240 Z'/%3E%3C/g%3E%3C/svg%3E");
            animation: drift 85s linear infinite;
          }
          :root[data-theme="dark"] body::before{ filter:brightness(.8) saturate(.95); opacity:.6 }
          @media (prefers-reduced-motion: reduce){ body::before{ animation:none } }

          /* ===== Header & containers ===== */
          header{
            position:sticky; top:0; z-index:20;
            backdrop-filter:saturate(160%) blur(10px);
            background:color-mix(in srgb, var(--bg) 65%, #ffffff 35%);
            border-bottom:1px solid var(--border);
          }
          main{max-width:1180px;margin:0 auto;padding:24px}
          .brand{display:flex;align-items:center;gap:12px;font-weight:900;letter-spacing:.3px}
          .logo{width:36px;height:36px;border-radius:14px;background:linear-gradient(135deg,#bfe3ff,#fff0d5);box-shadow:var(--shadow)}
          .muted{color:var(--muted)}

          .card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);
                box-shadow:var(--shadow);padding:20px;transition:transform .15s}
          .card:hover{transform:translateY(-1px)}
          .row{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}

          input,select,button{font:inherit}
          input,select{width:100%; padding:14px 16px; border-radius:16px; border:1px solid var(--border);
                       background:var(--surface); color:var(--text)}
          input:focus,select:focus,.btn:focus{outline:3px solid var(--accent); outline-offset:2px}
          .btn{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:12px 16px;border-radius:16px;
               border:1px solid var(--border);background:var(--surface);color:var(--text);cursor:pointer}
          .btn.primary{background:var(--accent);color:var(--accent-on);border-color:var(--accent)}
          a{color:var(--accent);text-underline-offset:3px}
          a:focus{outline:3px solid var(--accent);outline-offset:2px}

          /* Page grid */
          .page-grid{display:grid;grid-template-columns:360px 1fr;gap:22px}
          .content-col{display:grid;grid-template-columns:1fr;gap:22px}
          @media (max-width:1024px){.page-grid{grid-template-columns:1fr}}

          /* Mobile forecast cards */
          .hour-cards{display:none}
          @media (max-width:1024px){
            .hour-table{display:none}
            .hour-cards{display:grid;gap:12px}
            .hour-card{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:12px;border:1px solid var(--border);border-radius:16px;background:var(--surface)}
            .hour-card .label{color:var(--muted);font-size:12px}
            .hour-card .value{font-weight:800}
          }

          /* City chips by country */
          .city-chip{ border-width:2px; border-style:solid; transition:transform .15s, box-shadow .15s }
          .city-chip:hover{ transform:translateY(-1px) }
          .city-chip.th{ --start:#b8ecff; --end:#e8fbff; --border-c:#6fc6ff }
          .city-chip.jp{ --start:#ffd8e6; --end:#fff2f7; --border-c:#ff9fbd }
          .city-chip.us{ --start:#d6e4ff; --end:#eef3ff; --border-c:#9ab5ff }
          .city-chip{ background:linear-gradient(135deg,var(--start),var(--end)); border-color:var(--border-c) }
          .city-chip.active{ box-shadow:0 0 0 4px color-mix(in srgb, var(--border-c) 30%, transparent) }

          /* Sun/Rain toggle classes (เผื่อใช้) */
          .theme-sun{display:inline-block}
          .theme-rain{display:none}
          :root[data-theme="dark"] .theme-sun{display:none}
          :root[data-theme="dark"] .theme-rain{display:inline-block}

          /* Hero */
          .hero{ position:relative; overflow:hidden }
          .hero .title{ color:var(--hero-text) } /* always dark text for hero title */
          @media (max-width: 700px){ .hero{ grid-template-columns: 1fr !important; } }
        `}</style>
      </head>
      <body>
        {/* Aurora background */}
        <div className="aurora"><div /></div>

        <header>
          <main style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
            <div className="brand"><div className="logo"/><div style={{fontSize:22}}>Weather Now</div></div>
            <div style={{display:'flex',gap:10,alignItems:'center'}}>
              <ThemeToggle />
              <ContrastToggle />
            </div>
          </main>
        </header>

        <main>{children}</main>

        <footer className="muted" style={{maxWidth:1180,margin:'28px auto',padding:'0 24px'}}>
          Contrast-safe • High-Contrast mode • Motion respects reduced-motion.
        </footer>
      </body>
    </html>
  );
}
