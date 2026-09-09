import { useState, useEffect } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, Download, UtensilsCrossed } from "lucide-react";

const initialVolunteers = [
  { name: "Hashim Bhai",  quota: 65,  delivered: 60 },
  { name: "Hakim Bhai",   quota: 41,  delivered: 41 },
  { name: "Faazil Bhai",  quota: 38,  delivered: 35 },
  { name: "Abrar Bhai",   quota: 28,  delivered: 28 },
  { name: "Tasneem Ben",  quota: 20,  delivered: 0  },
  { name: "Jumana Ben",   quota: 18,  delivered: 18 },
  { name: "Ezzi Mohalla", quota: 23,  delivered: 20 },
  { name: "Rafiq Bhai",   quota: 25,  delivered: 25 },
  { name: "Self",         quota: 123, delivered: 118 },
];

const initialTotalMade = 381;

function fmt(n) { return n.toLocaleString("en-IN"); }

function useFonts() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);
}

const GLOBAL_CSS = `
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  input[type=number] { -moz-appearance: textfield; }
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  .num-input { font-family: 'IBM Plex Sans', sans-serif; font-variant-numeric: tabular-nums; font-size: 16px; }
  .num-input:focus { outline: 2px solid #1F4B43; outline-offset: -1px; }
  input, button { font-size: 16px; }

  .app-container { max-width: 980px; margin: 0 auto; padding: 28px 20px 80px; }
  .app-header-inner { max-width: 980px; margin: 0 auto; padding: 24px 20px 0; }
  .header-top-row { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
  .download-btn { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 16px; margin-top: 2px; border-radius: 6px; border: 1px solid #1F4B43; background: #1F4B43; color: #FDFBF6; font-size: 13px; font-weight: 500; cursor: pointer; font-family: inherit; }
  .app-title { font-family: 'Fraunces', serif; font-weight: 600; font-size: 28px; margin: 0; letter-spacing: -0.01em; }

  .menu-row { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; max-width: 520px; }
  .menu-label { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #6B6558; white-space: nowrap; }
  .menu-input { flex: 1; min-width: 0; padding: 9px 10px; border: 1px solid #E2DACB; border-radius: 6px; font-size: 15px; background: #FFFFFF; font-family: inherit; }

  .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(135px, 1fr)); gap: 12px; margin-bottom: 28px; }

  .grid-input { padding: 8px 4px; border: 1px solid #E2DACB; border-radius: 5px; text-align: center; background: #FDFBF6; }

  @media (max-width: 640px) {
    .app-container { padding: 18px 12px 72px; }
    .app-header-inner { padding: 16px 12px 0; }
    .header-top-row { flex-direction: column; align-items: stretch; gap: 10px; }
    .download-btn { width: 100%; }
    .app-title { font-size: 22px; }

    .menu-row { flex-direction: column; align-items: stretch; gap: 6px; max-width: none; }

    .summary-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }

    .grid-input { min-width: 40px; padding: 9px 2px; }

    table th, table td { padding: 6px 5px !important; font-size: 13px !important; }
  }
`;

export default function App() {
  useFonts();
  const [menu, setMenu] = useState("Dal, Rice, Sabzi, Roti");
  const [totalMade, setTotalMade] = useState(initialTotalMade);
  const [volunteers, setVolunteers] = useState(initialVolunteers);

  function downloadReport() {
    const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
    const rows = [];
    rows.push(["FMB Kitchen Daily Report"]);
    rows.push(["Date", today]);
    rows.push(["Menu", menu]);
    rows.push([]);
    rows.push(["Tiffin Distribution"]);
    rows.push(["Distributor", "Quota", "Delivered", "Shortfall"]);
    volunteers.forEach(v => {
      const delivered = Number(v.delivered) || 0;
      rows.push([v.name, v.quota, delivered, Math.max(0, (Number(v.quota) || 0) - delivered)]);
    });
    const grandQuota = volunteers.reduce((a, v) => a + (Number(v.quota) || 0), 0);
    const grandDistributed = volunteers.reduce((a, v) => a + (Number(v.delivered) || 0), 0);
    const grandShortfall = volunteers.reduce((a, v) => a + Math.max(0, (Number(v.quota) || 0) - (Number(v.delivered) || 0)), 0);
    rows.push(["Total", grandQuota, grandDistributed, grandShortfall]);
    rows.push([]);
    rows.push(["Total made", Number(totalMade) || 0]);
    rows.push(["Leftover", (Number(totalMade) || 0) - grandDistributed]);

    const csv = rows.map(r => r.map(cell => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FMB-Report-${today.replace(/\//g, "-")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", background: "#F6F2E9", minHeight: "100vh", color: "#26241F" }}>
      <style>{GLOBAL_CSS}</style>

      <Header menu={menu} setMenu={setMenu} onDownload={downloadReport} />

      <div className="app-container">
        <TiffinModule
          totalMade={totalMade} setTotalMade={setTotalMade}
          volunteers={volunteers} setVolunteers={setVolunteers}
        />
      </div>
    </div>
  );
}

function Header({ menu, setMenu, onDownload }) {
  return (
    <div style={{ borderBottom: "1px solid #E2DACB", background: "#FDFBF6" }}>
      <div className="app-header-inner">
        <div className="header-top-row">
          <div>
            <h1 className="app-title">Thaali Daftar</h1>
            <p style={{ margin: "4px 0 16px", color: "#6B6558", fontSize: 14 }}>
              FMB Kitchen Register &middot; Hyderabad Jamaat &middot; {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <button onClick={onDownload} className="download-btn">
            <Download size={15} /> Download today's report
          </button>
        </div>

        <label className="menu-row" style={{ marginBottom: 20 }}>
          <span className="menu-label">
            <UtensilsCrossed size={14} /> Today's menu
          </span>
          <input
            className="menu-input"
            type="text"
            value={menu}
            onChange={e => setMenu(e.target.value)}
            placeholder="e.g. Dal, Rice, Sabzi, Roti"
          />
        </label>
      </div>
    </div>
  );
}

/* ---------------- TIFFIN MODULE ---------------- */

function TiffinModule({ totalMade, setTotalMade, volunteers, setVolunteers }) {
  const [expanded, setExpanded] = useState(true);

  const grandDistributed = volunteers.reduce((a, v) => a + (Number(v.delivered) || 0), 0);
  const grandMade = Number(totalMade) || 0;
  const grandLeftover = grandMade - grandDistributed;

  const totalShortfall = volunteers.reduce((sum, v) => {
    return sum + Math.max(0, (Number(v.quota) || 0) - (Number(v.delivered) || 0));
  }, 0);

  const volunteersShort = volunteers.filter(v => (Number(v.quota) || 0) - (Number(v.delivered) || 0) > 0).length;

  function updateDelivered(idx, value) {
    const next = [...volunteers];
    next[idx] = { ...next[idx], delivered: value };
    setVolunteers(next);
  }

  function updateQuota(idx, value) {
    const next = [...volunteers];
    next[idx] = { ...next[idx], quota: value };
    setVolunteers(next);
  }

  return (
    <div>
      {/* Summary strip */}
      <div className="summary-grid">
        <SummaryCard label="Made today" value={fmt(grandMade)} sub="tiffins" />
        <SummaryCard label="Distributed" value={fmt(grandDistributed)} sub={grandMade ? `${((grandDistributed / grandMade) * 100).toFixed(0)}% of made` : "\u2014"} />
        <SummaryCard
          label="Leftover"
          value={fmt(grandLeftover)}
          sub={grandLeftover > 0 ? "at masjid" : "none"}
          tone={grandLeftover > 15 ? "warn" : "default"}
        />
        <SummaryCard
          label="Shortfall"
          value={fmt(totalShortfall)}
          sub={volunteersShort > 0 ? `${volunteersShort} under quota` : "everyone on target"}
          tone={totalShortfall > 0 ? "alert" : "good"}
        />
      </div>

      {/* Total made entry */}
      <Section title="Total tiffins made today" note="Confirm or adjust \u2014 defaults to yesterday's count">
        <input
          className="num-input"
          type="number"
          value={totalMade}
          onChange={e => setTotalMade(e.target.value)}
          style={{ width: 110, padding: "10px 12px", border: "1px solid #E2DACB", borderRadius: 6, background: "#FDFBF6" }}
        />
      </Section>

      {/* Distribution list */}
      <Section
        title="Distribution"
        note="Enter each distributor's delivered count \u2014 shortfall calculates automatically"
        right={
          <button onClick={() => setExpanded(!expanded)} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "#1F4B43", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
            {expanded ? "Collapse" : "Expand"} {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        }
      >
        {expanded && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr>
                  <Th style={{ textAlign: "left", minWidth: 140 }}>Distributor</Th>
                  <Th>Quota</Th>
                  <Th>Delivered</Th>
                  <Th>Shortfall</Th>
                </tr>
              </thead>
              <tbody>
                {volunteers.map((v, idx) => {
                  const delivered = Number(v.delivered) || 0;
                  const shortfall = (Number(v.quota) || 0) - delivered;
                  const isSelf = v.name === "Self";
                  return (
                    <tr key={v.name} style={{ borderTop: "1px solid #ECE6D8", background: isSelf ? "#FAF6EC" : "transparent" }}>
                      <Td style={{ textAlign: "left", fontWeight: 500, color: isSelf ? "#6B6558" : "#26241F" }}>{v.name}</Td>
                      <Td>
                        <input
                          className="num-input grid-input"
                          type="number"
                          value={v.quota}
                          onChange={e => updateQuota(idx, e.target.value)}
                          style={{ width: 64, background: "#FAF6EC", color: "#6B6558" }}
                        />
                      </Td>
                      <Td>
                        <input
                          className="num-input grid-input"
                          type="number"
                          value={v.delivered}
                          onChange={e => updateDelivered(idx, e.target.value)}
                          style={{ width: 64, background: "#FDFBF6" }}
                        />
                      </Td>
                      <Td>
                        {shortfall > 0 ? (
                          <span style={{ color: "#9B3A34", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <AlertTriangle size={13} /> {shortfall}
                          </span>
                        ) : (
                          <span style={{ color: "#3F7A5C" }}>&mdash;</span>
                        )}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: "2px solid #1F4B43" }}>
                  <Td style={{ textAlign: "left", fontWeight: 700 }}>Total</Td>
                  <Td style={{ fontWeight: 700 }}>{volunteers.reduce((a, v) => a + (Number(v.quota) || 0), 0)}</Td>
                  <Td style={{ fontWeight: 700 }}>{grandDistributed}</Td>
                  <Td style={{ fontWeight: 700, color: totalShortfall > 0 ? "#9B3A34" : "#3F7A5C" }}>{totalShortfall}</Td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
}

function Th({ children, style }) {
  return <th style={{ padding: "8px 10px", fontWeight: 600, color: "#6B6558", fontSize: 12, textAlign: "center", ...style }}>{children}</th>;
}
function Td({ children, style }) {
  return <td style={{ padding: "7px 10px", textAlign: "center", ...style }}>{children}</td>;
}

function SummaryCard({ label, value, sub, tone = "default" }) {
  const colors = {
    default: { text: "#1F4B43" },
    warn: { text: "#B8863B" },
    alert: { text: "#9B3A34" },
    good: { text: "#3F7A5C" },
  }[tone];
  return (
    <div style={{ background: "#FDFBF6", border: "1px solid #E2DACB", borderRadius: 8, padding: "16px 18px" }}>
      <div style={{ fontSize: 12, color: "#8A8375", marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 600, color: colors.text }}>{value}</div>
      <div style={{ fontSize: 12, color: "#8A8375", marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function Section({ title, note, right, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, margin: 0 }}>{title}</h2>
        {right}
      </div>
      {note && <p style={{ fontSize: 13, color: "#8A8375", margin: "0 0 14px" }}>{note}</p>}
      {children}
    </div>
  );
}