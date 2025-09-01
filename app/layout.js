import ThemeToggle from "./ThemeToggle";
import ContrastToggle from "./ContrastToggle";

export const metadata = {
  title: "Weather Now — Blue, Accessible",
  description: "Accessible, high-contrast weather dashboard (WCAG AA).",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light dark" />
        <style>{`
          /* ========= COLOR TOKENS (WCAG-aware) ========= */
          :root{
            /* Light */
            --bg:#F7FAFF;            /* very light blue */
            --surface:#FFFFFF;
            --text:#0B1220;          /* almost-black -> 12+:1 on --bg */
            --muted:#475569;         /* slate-600 (still 7+:1 on --bg) */
            --border:#D6E4FF;

            --accent:#1E40AF;        /* blue-800 */
            --accent-on:#FFFFFF;     /* text on accent (ratio ~8+:1) */

            --ok:#047857; --warn:#B45309; --bad:#B91C1C; /* all strong enough on white */
            --shadow:0 14px 40px rgba(9,30,66,.10);
            --radius:24px;

            --blue1:#E6F0FF; --blue2:#D7EBFF; --blue3:#CFE6FF;

            /* Sky tokens (light) */
            --sky-top:#eaf6ff;
            --sky-mid:#f3f9ff;
            --sky-bottom:#ffffff;
          }
          :root[data-theme="dark"]{
            /* Dark */
            --bg:#0B1220;
            --surface:#0F172A;
            --text:#F8FAFC;          /* 13+:1 on --bg */
            --muted:#C7D2FE;         /* light slate/indigo */
            --border:#1E293B;

            --accent:#60A5FA;        /* blue-400 */
            --accent-on:#0B1220;     /* dark text ON accent (ratio ~12:1) */

            --ok:#22C55E; --warn:#F59E0B; --bad:#F87171;
            --shadow:0 18px 48px rgba(0,0,0,.45);

            --blue1:#0F1B34; --blue2:#0C162B; --blue3:#0A1224;

            /* Sky tokens (dark) */
            --sky-top:#0b1220;
            --sky-mid:#0e1628;
            --sky-bottom:#0f172a;
          }
          /* High Contrast override (AA+/AAA leaning) */
          :root[data-contrast="hc"]{
            --bg:#FFFFFF; --surface:#FFFFFF; --text:#000000; --muted:#1F2937;
            --border:#0B1220;
            --accent:#0036D6;        /* deep royal blue */
            --accent-on:#FFFFFF;
            --shadow:0 0 0 rgba(0,0,0,0); /* flatter for clarity */
          }

          /* ========= GLOBALS ========= */
          *{box-sizing:border-box}
          html,body{max-width:100%;overflow-x:hidden}
          body{
            margin:0; color:var(--text);
            /* พื้นหลังท้องฟ้า: ฟ้าพาสเทลเป็นชั้นๆ */
            background: linear-gradient(180deg, var(--sky-top) 0%, var(--sky-mid) 55%, var(--sky-bottom) 100%);
            font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Noto Sans", Arial;
            line-height:1.35;
          }

          /* ====== ก้อนเมฆลอย 2 ชั้น (เบาๆ) ====== */
          @keyframes drift { from { background-position: 0 0; } to { background-position: -1200px 0; } }
          body::before,
          body::after{
            content:""; position:fixed; inset:0; pointer-events:none; z-index:-1;
            background-repeat: repeat-x; background-size: 1200px auto; opacity:.85;
          }
          /* ชั้นล่าง (เมฆแนวขอบล่าง) */
          body::before{
            background-position: bottom left;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='220' viewBox='0 0 1200 220'%3E%3Cg fill='%23ffffff' opacity='0.95'%3E%3Cpath d='M0 170 C 80 140 160 140 240 170 C 290 130 370 130 430 170 C 500 150 560 150 620 170 C 690 145 760 145 820 170 C 900 140 980 140 1060 170 L1200 170 1200 220 0 220 Z'/%3E%3C/g%3E%3C/svg%3E");
            animation: drift 80s linear infinite;
          }
          /* ชั้นบน (ก้อนเมฆเล็กๆ กระจาย) */
          body::after{
            background-position: 40px 40px;
            background-size: 900px auto;
            opacity:.65;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='900' height='180' viewBox='0 0 900 180'%3E%3Cg fill='%23ffffff' opacity='0.9'%3E%3Ccircle cx='90' cy='70' r='36'/%3E%3Ccircle cx='130' cy='62' r='50'/%3E%3Ccircle cx='185' cy='74' r='40'/%3E%3Ccircle cx='245' cy='60' r='55'/%3E%3Crect x='70' y='90' width='220' height='90' rx='22'/%3E%3Ccircle cx='420' cy='72' r='40'/%3E%3Ccircle cx='465' cy='60' r='54'/%3E%3Crect x='380' y='90' width='220' height='90' rx='22'/%3E%3Ccircle cx='720' cy='68' r='46'/%3E%3Ccircle cx='765' cy='58' r='56'/%3E%3Crect x='675' y='90' width='230' height='90' rx='22'/%3E%3C/g%3E%3C/svg%3E");
            animation: drift 140s linear infinite reverse;
          }
          /* โหมดมืด: ทำเมฆทึมลงให้คอนทราสต์ดี */
          :root[data-theme="dark"] body::before,
          :root[data-theme="dark"] body::after{
            filter: brightness(0.75) saturate(0.9);
            opacity:.55;
          }
          /* High-Contrast: ปิดพื้นหลังเมฆเพื่อเน้นคอนเทนต์ */
          :root[data-contrast="hc"] body::before,
          :root[data-contrast="hc"] body::after{ display:none; }
          @media (prefers-reduced-motion: reduce){
            body::before, body::after{ animation:none }
          }

          header{
            position:sticky; top:0; z-index:20;
            backdrop-filter:saturate(160%) blur(10px);
            background:color-mix(in srgb, var(--bg) 60%, #ffffff 40%);
            border-bottom:1px solid var(--border);
          }
          main{max-width:1180px;margin:0 auto;padding:24px}
          .brand{display:flex;align-items:center;gap:12px;font-weight:900;letter-spacing:.3px}
          .logo{width:36px;height:36px;border-radius:14px;background:linear-gradient(135deg,#bfe3ff,#fff0d5);box-shadow:var(--shadow)}

          .muted{color:var(--muted)}
          .card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);
                box-shadow:var(--shadow);padding:20px}
          .card:hover{transform:translateY(-1px)}
          .row{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}

          /* Controls */
          input,select,button{ font:inherit; }
          input,select{
            width:100%; padding:14px 16px; border-radius:16px; border:1px solid var(--border);
            background:var(--surface); color:var(--text); outline:none;
          }
          input:focus,select:focus,.btn:focus{outline:3px solid var(--accent); outline-offset:2px}
          .btn{
            display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:12px 16px;border-radius:16px;
            border:1px solid var(--border);background:var(--surface);color:var(--text);cursor:pointer;
          }
          .btn.primary{background:var(--accent);color:var(--accent-on);border-color:var(--accent)}
          a{color:var(--accent);text-underline-offset:3px}
          a:focus{outline:3px solid var(--accent);outline-offset:2px}

          /* Layout grid */
          .page-grid{display:grid;grid-template-columns:360px 1fr;gap:22px}
          .content-col{display:grid;grid-template-columns:1fr;gap:22px}
          @media (max-width:1024px){.page-grid{grid-template-columns:1fr}}

          /* Forecast: mobile vertical cards */
          .hour-cards{display:none}
          @media (max-width:1024px){
            .hour-table{display:none}
            .hour-cards{display:grid;gap:12px}
            .hour-card{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:12px;border:1px solid var(--border);border-radius:16px;background:var(--surface)}
            .hour-card .label{color:var(--muted);font-size:12px}
            .hour-card .value{font-weight:800}
          }

          /* Sun/Rain swap */
          .theme-sun{display:inline-block}
          .theme-rain{display:none}
          :root[data-theme="dark"] .theme-sun{display:none}
          :root[data-theme="dark"] .theme-rain{display:inline-block}
        `}</style>
      </head>
      <body>
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
          Meets WCAG AA contrast (normal text ≥4.5:1). Use High-Contrast for even stronger contrast.
        </footer>
      </body>
    </html>
  );
}
