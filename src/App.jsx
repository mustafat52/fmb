import { useState, useEffect, useMemo } from "react";
import { Package, Users, AlertTriangle, CheckCircle2, TrendingDown, ChevronDown, ChevronUp, Download, UtensilsCrossed, Settings, X, Plus, Trash2, Wallet } from "lucide-react";

const SIZES = ["9x4", "10x4", "11x4", "12x4"];

const initialVolunteers = [
  { name: "Hashim Bhai",  quota: 70, delivered: { "9x4": 13, "10x4": 34, "11x4": 18, "12x4": 3 } },
  { name: "Hakim Bhai",   quota: 65, delivered: { "9x4": 11, "10x4": 38, "11x4": 11, "12x4": 3 } },
  { name: "Paatil Bhai",  quota: 41, delivered: { "9x4": 9,  "10x4": 27, "11x4": 5,  "12x4": 0 } },
  { name: "Abrar Bhai",   quota: 26, delivered: { "9x4": 15, "10x4": 9,  "11x4": 2,  "12x4": 0 } },
  { name: "Tanzeem Bhai", quota: 17, delivered: { "9x4": 0,  "10x4": 0,  "11x4": 0,  "12x4": 0 } },
  { name: "Zainab Ben",   quota: 26, delivered: { "9x4": 11, "10x4": 9,  "11x4": 3,  "12x4": 0 } },
  { name: "Ezzi Maulla",  quota: 25, delivered: { "9x4": 3,  "10x4": 12, "11x4": 6,  "12x4": 1 } },
  { name: "Rafiq Bhai",   quota: 24, delivered: { "9x4": 8,  "10x4": 13, "11x4": 2,  "12x4": 1 } },
];

const initialSelfService = [
  { name: "Self \u2014 Inside",  delivered: { "9x4": 5,  "10x4": 3,  "11x4": 4,  "12x4": 1 } },
  { name: "Self \u2014 Outside", delivered: { "9x4": 42, "10x4": 49, "11x4": 14, "12x4": 4 } },
];

const initialTotalMade = { "9x4": 130, "10x4": 220, "11x4": 80, "12x4": 15 };

const initialWomen = [
  "Sakina Ben","Fatema Ben","Zainab Ben","Amina Ben","Ruqaiya Ben","Tahera Ben",
  "Zahra Ben","Bhulwa Ben","Sabika Ben","Insiya Ben","Maryam Ben","Nafisa Ben",
  "Munira Ben","Aaliya Ben","Saifiya Ben","Fizza Ben",
].map((name, i) => ({ name, count: [12,15,10,18,14,9,16,11,13,17,10,12,15,8,14,11][i] }));

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

export default function App() {
  useFonts();
  const [tab, setTab] = useState("tiffin");
  const [menu, setMenu] = useState("Dal, Rice, Sabzi, Roti");
  const [totalMade, setTotalMade] = useState(initialTotalMade);
  const [volunteers, setVolunteers] = useState(initialVolunteers);
  const [selfService, setSelfService] = useState(initialSelfService);
  const [women, setWomen] = useState(initialWomen);
  const [rotiPrice, setRotiPrice] = useState(8);
  const [payments, setPayments] = useState({});

  function downloadReport() {
    const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
    const rows = [];
    rows.push(["FMB Kitchen Daily Report"]);
    rows.push(["Date", today]);
    rows.push(["Menu", menu]);
    rows.push([]);
    rows.push(["Tiffin Distribution"]);
    rows.push(["Distributor", "Quota", ...SIZES, "Row total", "Shortfall"]);
    volunteers.forEach(v => {
      const rowTotal = SIZES.reduce((a, s) => a + (Number(v.delivered[s]) || 0), 0);
      rows.push([v.name, v.quota, ...SIZES.map(s => v.delivered[s]), rowTotal, Math.max(0, (Number(v.quota) || 0) - rowTotal)]);
    });
    selfService.forEach(v => {
      const rowTotal = SIZES.reduce((a, s) => a + (Number(v.delivered[s]) || 0), 0);
      rows.push([v.name, "", ...SIZES.map(s => v.delivered[s]), rowTotal, ""]);
    });
    const colTotals = SIZES.map(s => [...volunteers, ...selfService].reduce((a, r) => a + (Number(r.delivered[s]) || 0), 0));
    const grandDistributed = colTotals.reduce((a, b) => a + b, 0);
    rows.push(["Column total", volunteers.reduce((a, v) => a + (Number(v.quota) || 0), 0), ...colTotals, grandDistributed, ""]);
    rows.push([]);
    rows.push(["Total made", "", ...SIZES.map(s => totalMade[s]), SIZES.reduce((a, s) => a + (Number(totalMade[s]) || 0), 0), ""]);
    rows.push(["Leftover", "", ...SIZES.map((s, i) => (Number(totalMade[s]) || 0) - colTotals[i]), (SIZES.reduce((a, s) => a + (Number(totalMade[s]) || 0), 0)) - grandDistributed, ""]);
    rows.push([]);
    rows.push(["Roti Register"]);
    rows.push(["Name", "Count"]);
    women.forEach(w => rows.push([w.name, w.count]));
    rows.push(["Total", women.reduce((a, w) => a + (Number(w.count) || 0), 0)]);

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
      <style>{`
        input[type=number] { -moz-appearance: textfield; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        .num-input { font-family: 'IBM Plex Sans', sans-serif; font-variant-numeric: tabular-nums; }
        .num-input:focus { outline: 2px solid #1F4B43; outline-offset: -1px; }
      `}</style>

      <Header tab={tab} setTab={setTab} menu={menu} setMenu={setMenu} onDownload={downloadReport} />

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 20px 80px" }}>
        {tab === "tiffin" ? (
          <TiffinModule
            totalMade={totalMade} setTotalMade={setTotalMade}
            volunteers={volunteers} setVolunteers={setVolunteers}
            selfService={selfService} setSelfService={setSelfService}
          />
        ) : (
          <RotiModule women={women} setWomen={setWomen} rotiPrice={rotiPrice} setRotiPrice={setRotiPrice} payments={payments} setPayments={setPayments} />
        )}
      </div>
    </div>
  );
}

function Header({ tab, setTab, menu, setMenu, onDownload }) {
  return (
    <div style={{ borderBottom: "1px solid #E2DACB", background: "#FDFBF6" }}>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "24px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 28, margin: 0, letterSpacing: "-0.01em" }}>
              Thaali Daftar
            </h1>
            <p style={{ margin: "4px 0 16px", color: "#6B6558", fontSize: 14 }}>
              FMB Kitchen Register &middot; Hyderabad Jamaat &middot; {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <button
            onClick={onDownload}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "9px 16px", marginTop: 2,
              borderRadius: 6, border: "1px solid #1F4B43",
              background: "#1F4B43", color: "#FDFBF6",
              fontSize: 13, fontWeight: 500, cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <Download size={15} /> Download today's report
          </button>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, maxWidth: 520 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6B6558", whiteSpace: "nowrap" }}>
            <UtensilsCrossed size={14} /> Today's menu
          </span>
          <input
            type="text"
            value={menu}
            onChange={e => setMenu(e.target.value)}
            placeholder="e.g. Dal, Rice, Sabzi, Roti"
            style={{ flex: 1, padding: "7px 10px", border: "1px solid #E2DACB", borderRadius: 6, fontSize: 13, background: "#FFFFFF", fontFamily: "inherit" }}
          />
        </label>

        <div style={{ display: "flex", gap: 4 }}>
          <TabButton active={tab === "tiffin"} onClick={() => setTab("tiffin")} icon={<Package size={16} />} label="Tiffin Distribution" />
          <TabButton active={tab === "roti"} onClick={() => setTab("roti")} icon={<Users size={16} />} label="Roti Register" />
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 18px",
        border: "none",
        borderBottom: active ? "2px solid #1F4B43" : "2px solid transparent",
        background: "transparent",
        color: active ? "#1F4B43" : "#8A8375",
        fontWeight: active ? 600 : 500,
        fontSize: 15,
        cursor: "pointer",
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}
    >
      {icon}{label}
    </button>
  );
}

/* ---------------- TIFFIN MODULE ---------------- */

function TiffinModule({ totalMade, setTotalMade, volunteers, setVolunteers, selfService, setSelfService }) {
  const [expanded, setExpanded] = useState(true);

  const colTotals = useMemo(() => {
    const t = { "9x4": 0, "10x4": 0, "11x4": 0, "12x4": 0 };
    [...volunteers, ...selfService].forEach(r => SIZES.forEach(s => t[s] += Number(r.delivered[s]) || 0));
    return t;
  }, [volunteers, selfService]);

  const grandDistributed = SIZES.reduce((a, s) => a + colTotals[s], 0);
  const grandMade = SIZES.reduce((a, s) => a + (Number(totalMade[s]) || 0), 0);
  const grandLeftover = grandMade - grandDistributed;

  const totalShortfall = volunteers.reduce((sum, v) => {
    const rowTotal = SIZES.reduce((a, s) => a + (Number(v.delivered[s]) || 0), 0);
    return sum + Math.max(0, (Number(v.quota) || 0) - rowTotal);
  }, 0);

  const volunteersShort = volunteers.filter(v => {
    const rowTotal = SIZES.reduce((a, s) => a + (Number(v.delivered[s]) || 0), 0);
    return (Number(v.quota) || 0) - rowTotal > 0;
  }).length;

  function updateDelivered(list, setList, idx, size, value) {
    const next = [...list];
    next[idx] = { ...next[idx], delivered: { ...next[idx].delivered, [size]: value } };
    setList(next);
  }

  return (
    <div>
      {/* Summary strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
        <SummaryCard label="Made today" value={fmt(grandMade)} sub="all sizes" />
        <SummaryCard label="Distributed" value={fmt(grandDistributed)} sub={`${((grandDistributed / grandMade) * 100).toFixed(0)}% of made`} />
        <SummaryCard
          label="Leftover"
          value={fmt(grandLeftover)}
          sub={grandLeftover > 0 ? "at masjid" : "none"}
          tone={grandLeftover > 15 ? "warn" : "default"}
        />
        <SummaryCard
          label="Shortfall"
          value={fmt(totalShortfall)}
          sub={volunteersShort > 0 ? `${volunteersShort} volunteer${volunteersShort > 1 ? "s" : ""} under quota` : "everyone on target"}
          tone={totalShortfall > 0 ? "alert" : "good"}
        />
      </div>

      {/* Total made entry */}
      <Section title="Total tiffins made today" note="Confirm or adjust \u2014 defaults to yesterday's count">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {SIZES.map(size => (
            <label key={size} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 12, color: "#8A8375" }}>{size}</span>
              <input
                className="num-input"
                type="number"
                value={totalMade[size]}
                onChange={e => setTotalMade({ ...totalMade, [size]: e.target.value })}
                style={{ width: 82, padding: "8px 10px", border: "1px solid #E2DACB", borderRadius: 6, fontSize: 15, background: "#FDFBF6" }}
              />
            </label>
          ))}
        </div>
      </Section>

      {/* Distribution grid */}
      <Section
        title="Distribution grid"
        note="Same layout as the notebook \u2014 totals and shortfall calculate automatically"
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
                  {SIZES.map(s => <Th key={s}>{s}</Th>)}
                  <Th>Row total</Th>
                  <Th>Shortfall</Th>
                </tr>
              </thead>
              <tbody>
                {volunteers.map((v, idx) => {
                  const rowTotal = SIZES.reduce((a, s) => a + (Number(v.delivered[s]) || 0), 0);
                  const shortfall = (Number(v.quota) || 0) - rowTotal;
                  return (
                    <tr key={v.name} style={{ borderTop: "1px solid #ECE6D8" }}>
                      <Td style={{ textAlign: "left", fontWeight: 500 }}>{v.name}</Td>
                      <Td>
                        <input
                          className="num-input"
                          type="number"
                          value={v.quota}
                          onChange={e => {
                            const next = [...volunteers];
                            next[idx] = { ...next[idx], quota: e.target.value };
                            setVolunteers(next);
                          }}
                          style={{ width: 52, padding: "6px", border: "1px solid #E2DACB", borderRadius: 5, textAlign: "center", background: "#FAF6EC", color: "#6B6558" }}
                        />
                      </Td>
                      {SIZES.map(size => (
                        <Td key={size}>
                          <input
                            className="num-input"
                            type="number"
                            value={v.delivered[size]}
                            onChange={e => updateDelivered(volunteers, setVolunteers, idx, size, e.target.value)}
                            style={{ width: 52, padding: "6px", border: "1px solid #E2DACB", borderRadius: 5, textAlign: "center", background: "#FDFBF6" }}
                          />
                        </Td>
                      ))}
                      <Td style={{ fontWeight: 600 }}>{rowTotal}</Td>
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
                {selfService.map((v, idx) => {
                  const rowTotal = SIZES.reduce((a, s) => a + (Number(v.delivered[s]) || 0), 0);
                  return (
                    <tr key={v.name} style={{ borderTop: "1px solid #ECE6D8", background: "#FAF6EC" }}>
                      <Td style={{ textAlign: "left", fontWeight: 500, color: "#6B6558" }}>{v.name}</Td>
                      <Td style={{ color: "#B8863B" }}>&mdash;</Td>
                      {SIZES.map(size => (
                        <Td key={size}>
                          <input
                            className="num-input"
                            type="number"
                            value={v.delivered[size]}
                            onChange={e => updateDelivered(selfService, setSelfService, idx, size, e.target.value)}
                            style={{ width: 52, padding: "6px", border: "1px solid #E2DACB", borderRadius: 5, textAlign: "center", background: "#FDFBF6" }}
                          />
                        </Td>
                      ))}
                      <Td style={{ fontWeight: 600 }}>{rowTotal}</Td>
                      <Td style={{ color: "#B8863B" }}>&mdash;</Td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: "2px solid #1F4B43" }}>
                  <Td style={{ textAlign: "left", fontWeight: 700 }}>Column total</Td>
                  <Td style={{ fontWeight: 700 }}>{volunteers.reduce((a, v) => a + (Number(v.quota) || 0), 0)}</Td>
                  {SIZES.map(s => <Td key={s} style={{ fontWeight: 700 }}>{colTotals[s]}</Td>)}
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

/* ---------------- ROTI MODULE ---------------- */

const MONTH_MULTIPLIER = 22; // demo assumption: ~22 recorded days so far this month

function monthTotal(count) {
  return (Number(count) || 0) * MONTH_MULTIPLIER;
}

function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}`;
}

function paidThisMonth(payments, name) {
  const list = payments[name] || [];
  return list
    .filter(p => {
      const d = new Date(p.date);
      return `${d.getFullYear()}-${d.getMonth()}` === currentMonthKey();
    })
    .reduce((a, p) => a + (Number(p.amount) || 0), 0);
}

function RotiModule({ women, setWomen, rotiPrice, setRotiPrice, payments, setPayments }) {
  const [view, setView] = useState("today");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const total = women.reduce((a, w) => a + (Number(w.count) || 0), 0);

  function updateCount(idx, value) {
    const next = [...women];
    next[idx] = { ...next[idx], count: value };
    setWomen(next);
  }

  const monthRows = women.map(w => ({ name: w.name, days: 22, total: monthTotal(w.count) }));
  const monthGrandTotal = monthRows.reduce((a, r) => a + r.total, 0);

  function recordPayment(name, amount, date, note) {
    setPayments(prev => {
      const list = prev[name] || [];
      return { ...prev, [name]: [...list, { id: Date.now(), amount, date, note }] };
    });
  }

  function addMember(name) {
    if (!name.trim()) return;
    setWomen([...women, { name: name.trim(), count: 0 }]);
  }

  function removeMember(name) {
    setWomen(women.filter(w => w.name !== name));
  }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
        <SummaryCard label="Women contributing" value={fmt(women.length)} sub="fixed list" />
        <SummaryCard label="Rotis today" value={fmt(total)} sub="all entries" />
        <SummaryCard label="Avg. per person" value={women.length ? (total / women.length).toFixed(1) : "0"} sub="today" />
      </div>

      <Section
        title="Daily roti entry"
        note="Fixed list of women \u2014 enter today's count, or click a name to see this month's amount"
        right={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <MiniToggle active={view === "today"} onClick={() => setView("today")} label="Today" />
            <MiniToggle active={view === "month"} onClick={() => setView("month")} label="Month view" />
            <button
              onClick={() => setSettingsOpen(true)}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px solid #E2DACB", borderRadius: 6, padding: "6px 10px", color: "#6B6558", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
            >
              <Settings size={14} /> Settings
            </button>
          </div>
        }
      >
        {view === "today" ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr>
                  <Th style={{ textAlign: "left" }}>Name</Th>
                  <Th>Roti count</Th>
                </tr>
              </thead>
              <tbody>
                {women.map((w, idx) => (
                  <tr key={w.name} style={{ borderTop: "1px solid #ECE6D8" }}>
                    <Td style={{ textAlign: "left", fontWeight: 500 }}>
                      <button
                        onClick={() => setSelectedMember(w.name)}
                        style={{ background: "none", border: "none", padding: 0, color: "#1F4B43", fontWeight: 500, fontSize: 14, cursor: "pointer", textDecoration: "underline", textDecorationColor: "#C9C2AF", fontFamily: "inherit" }}
                      >
                        {w.name}
                      </button>
                    </Td>
                    <Td>
                      <input
                        className="num-input"
                        type="number"
                        value={w.count}
                        onChange={e => updateCount(idx, e.target.value)}
                        style={{ width: 64, padding: "6px", border: "1px solid #E2DACB", borderRadius: 5, textAlign: "center", background: "#FDFBF6" }}
                      />
                    </Td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: "2px solid #1F4B43" }}>
                  <Td style={{ textAlign: "left", fontWeight: 700 }}>Total</Td>
                  <Td style={{ fontWeight: 700 }}>{total}</Td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr>
                    <Th style={{ textAlign: "left" }}>Name</Th>
                    <Th>Days entered</Th>
                    <Th>Month total</Th>
                    <Th>Amount due</Th>
                  </tr>
                </thead>
                <tbody>
                  {monthRows.map(r => {
                    const due = r.total * rotiPrice - paidThisMonth(payments, r.name);
                    return (
                      <tr key={r.name} style={{ borderTop: "1px solid #ECE6D8" }}>
                        <Td style={{ textAlign: "left", fontWeight: 500 }}>
                          <button
                            onClick={() => setSelectedMember(r.name)}
                            style={{ background: "none", border: "none", padding: 0, color: "#1F4B43", fontWeight: 500, fontSize: 14, cursor: "pointer", textDecoration: "underline", textDecorationColor: "#C9C2AF", fontFamily: "inherit" }}
                          >
                            {r.name}
                          </button>
                        </Td>
                        <Td>{r.days}</Td>
                        <Td style={{ fontWeight: 600 }}>{r.total}</Td>
                        <Td style={{ fontWeight: 600, color: due > 0 ? "#9B3A34" : "#3F7A5C" }}>
                          {due > 0 ? `\u20b9${fmt(due)}` : "Paid up"}
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: "2px solid #1F4B43" }}>
                    <Td style={{ textAlign: "left", fontWeight: 700 }}>Total</Td>
                    <Td></Td>
                    <Td style={{ fontWeight: 700 }}>{monthGrandTotal}</Td>
                    <Td style={{ fontWeight: 700 }}>&#8377;{fmt(monthGrandTotal * rotiPrice)}</Td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p style={{ fontSize: 12, color: "#8A8375", marginTop: 10 }}>
              Rate: &#8377;{rotiPrice} per roti. Click a name to record a payment.
            </p>
          </div>
        )}
      </Section>

      {settingsOpen && (
        <RotiSettingsModal
          women={women}
          rotiPrice={rotiPrice}
          setRotiPrice={setRotiPrice}
          onAdd={addMember}
          onRemove={removeMember}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {selectedMember && (
        <MemberDetailModal
          name={selectedMember}
          member={women.find(w => w.name === selectedMember)}
          rotiPrice={rotiPrice}
          payments={payments[selectedMember] || []}
          onRecordPayment={(amount, date, note) => recordPayment(selectedMember, amount, date, note)}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
}

function ModalShell({ title, onClose, width = 480, children }) {
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(38,36,31,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 50 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: "#FDFBF6", borderRadius: 10, width: "100%", maxWidth: width, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 12px 32px rgba(38,36,31,0.25)" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #ECE6D8" }}>
          <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#8A8375", padding: 4 }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

function RotiSettingsModal({ women, rotiPrice, setRotiPrice, onAdd, onRemove, onClose }) {
  const [newName, setNewName] = useState("");

  return (
    <ModalShell title="Roti register settings" onClose={onClose}>
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 13, color: "#6B6558", display: "block", marginBottom: 6 }}>Price per roti</label>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 15 }}>&#8377;</span>
          <input
            className="num-input"
            type="number"
            value={rotiPrice}
            onChange={e => setRotiPrice(e.target.value)}
            style={{ width: 90, padding: "8px 10px", border: "1px solid #E2DACB", borderRadius: 6, fontSize: 15, background: "#FFFFFF" }}
          />
          <span style={{ fontSize: 12, color: "#8A8375" }}>applied to all members</span>
        </div>
      </div>

      <div>
        <label style={{ fontSize: 13, color: "#6B6558", display: "block", marginBottom: 8 }}>Members ({women.length})</label>
        <div style={{ border: "1px solid #ECE6D8", borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
          {women.map(w => (
            <div key={w.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderTop: "1px solid #ECE6D8" }}>
              <span style={{ fontSize: 14 }}>{w.name}</span>
              <button
                onClick={() => onRemove(w.name)}
                style={{ background: "none", border: "none", color: "#9B3A34", cursor: "pointer", padding: 4, display: "flex" }}
                title="Remove member"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="New member name"
            style={{ flex: 1, padding: "8px 10px", border: "1px solid #E2DACB", borderRadius: 6, fontSize: 14, background: "#FFFFFF", fontFamily: "inherit" }}
          />
          <button
            onClick={() => { onAdd(newName); setNewName(""); }}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 6, border: "1px solid #1F4B43", background: "#1F4B43", color: "#FDFBF6", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function MemberDetailModal({ name, member, rotiPrice, payments, onRecordPayment, onClose }) {
  const total = monthTotal(member?.count);
  const paid = paidThisMonth({ [name]: payments }, name);
  const amountDue = total * rotiPrice - paid;

  const [amount, setAmount] = useState(Math.max(0, amountDue));
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");

  return (
    <ModalShell title={name} onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
        <SummaryCard label="Rotis this month" value={fmt(total)} sub="\u00d7 22 days" />
        <SummaryCard label="Rate" value={`\u20b9${rotiPrice}`} sub="per roti" />
        <SummaryCard label="Amount due" value={`\u20b9${fmt(Math.max(0, amountDue))}`} sub={amountDue <= 0 ? "paid up" : "pending"} tone={amountDue > 0 ? "alert" : "good"} />
      </div>

      <div style={{ borderTop: "1px solid #ECE6D8", paddingTop: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <Wallet size={14} /> Record a payment
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11, color: "#8A8375" }}>Amount</span>
            <input
              className="num-input"
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              style={{ width: 100, padding: "7px 9px", border: "1px solid #E2DACB", borderRadius: 6, background: "#FFFFFF" }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11, color: "#8A8375" }}>Date</span>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{ padding: "7px 9px", border: "1px solid #E2DACB", borderRadius: 6, background: "#FFFFFF", fontFamily: "inherit" }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 120 }}>
            <span style={{ fontSize: 11, color: "#8A8375" }}>Note (optional)</span>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g. Cash, via Hakim bhai"
              style={{ padding: "7px 9px", border: "1px solid #E2DACB", borderRadius: 6, background: "#FFFFFF", fontFamily: "inherit" }}
            />
          </label>
          <button
            onClick={() => { if (Number(amount) > 0) { onRecordPayment(Number(amount), date, note); setNote(""); } }}
            style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #1F4B43", background: "#1F4B43", color: "#FDFBF6", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}
          >
            Save
          </button>
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Payment history</div>
        {payments.length === 0 ? (
          <p style={{ fontSize: 13, color: "#8A8375" }}>No payments recorded yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <Th style={{ textAlign: "left" }}>Date</Th>
                <Th style={{ textAlign: "left" }}>Note</Th>
                <Th>Amount</Th>
              </tr>
            </thead>
            <tbody>
              {[...payments].sort((a, b) => new Date(b.date) - new Date(a.date)).map(p => (
                <tr key={p.id} style={{ borderTop: "1px solid #ECE6D8" }}>
                  <Td style={{ textAlign: "left" }}>{new Date(p.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</Td>
                  <Td style={{ textAlign: "left", color: "#8A8375" }}>{p.note || "\u2014"}</Td>
                  <Td style={{ fontWeight: 600 }}>&#8377;{fmt(p.amount)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </ModalShell>
  );
}

function MiniToggle({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 12px",
        borderRadius: 6,
        border: active ? "1px solid #1F4B43" : "1px solid #E2DACB",
        background: active ? "#1F4B43" : "#FDFBF6",
        color: active ? "#FDFBF6" : "#6B6558",
        fontSize: 12,
        fontWeight: 500,
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {label}
    </button>
  );
}
