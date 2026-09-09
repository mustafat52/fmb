import { useState, useEffect } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, Download, UtensilsCrossed, Lock, CheckCircle2, LogOut } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Demo-only login \u2014 just an ID, no password, per the 2-editor setup.
// Once wired to Supabase this becomes real Supabase Auth + the profiles table.
const USERS = {
  mustafa123: "Mustafa",
  murtuza123: "Murtuza",
};

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

function toISO(d) { return d.toISOString().slice(0, 10); }
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }

const TODAY = new Date();
const TODAY_ISO = toISO(TODAY);

// Demo-only seed data standing in for what would really come from Supabase
// (tiffin_entries + tiffin_daily_summary already retain full history per date,
// so no separate "reports" table is needed once this is wired to the database)
const initialHistory = {
  [toISO(addDays(TODAY, -1))]: {
    menu: "Khichdi, Kadhi, Papad",
    totalMade: 381,
    submittedBy: "Mustafa",
    volunteers: [
      { name: "Hashim Bhai",  quota: 65,  delivered: 65 },
      { name: "Hakim Bhai",   quota: 41,  delivered: 39 },
      { name: "Faazil Bhai",  quota: 38,  delivered: 38 },
      { name: "Abrar Bhai",   quota: 28,  delivered: 25 },
      { name: "Tasneem Ben",  quota: 20,  delivered: 20 },
      { name: "Jumana Ben",   quota: 18,  delivered: 18 },
      { name: "Ezzi Mohalla", quota: 23,  delivered: 23 },
      { name: "Rafiq Bhai",   quota: 25,  delivered: 22 },
      { name: "Self",         quota: 123, delivered: 120 },
    ],
  },
  [toISO(addDays(TODAY, -2))]: {
    menu: "Pulao, Dal, Salad",
    totalMade: 375,
    submittedBy: "Murtuza",
    volunteers: [
      { name: "Hashim Bhai",  quota: 65,  delivered: 63 },
      { name: "Hakim Bhai",   quota: 41,  delivered: 41 },
      { name: "Faazil Bhai",  quota: 38,  delivered: 34 },
      { name: "Abrar Bhai",   quota: 28,  delivered: 28 },
      { name: "Tasneem Ben",  quota: 20,  delivered: 18 },
      { name: "Jumana Ben",   quota: 18,  delivered: 18 },
      { name: "Ezzi Mohalla", quota: 23,  delivered: 20 },
      { name: "Rafiq Bhai",   quota: 25,  delivered: 25 },
      { name: "Self",         quota: 123, delivered: 115 },
    ],
  },
};

function fmt(n) { return n.toLocaleString("en-IN"); }

function generateReportPdf({ dateLabel, menu, volunteers, totalMade, submittedBy, submittedAt }) {
  const doc = new jsPDF();
  const grandQuota = volunteers.reduce((a, v) => a + (Number(v.quota) || 0), 0);
  const grandDistributed = volunteers.reduce((a, v) => a + (Number(v.delivered) || 0), 0);
  const grandShortfall = volunteers.reduce((a, v) => a + Math.max(0, (Number(v.quota) || 0) - (Number(v.delivered) || 0)), 0);
  const leftover = (Number(totalMade) || 0) - grandDistributed;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(31, 75, 67);
  doc.text("Thaali Daftar", 14, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(107, 101, 88);
  doc.text("FMB Kitchen Register \u2014 Hyderabad Jamaat", 14, 24);

  doc.setDrawColor(226, 218, 203);
  doc.line(14, 28, 196, 28);

  doc.setFontSize(11);
  doc.setTextColor(38, 36, 31);
  doc.text(`Date: ${dateLabel}`, 14, 37);
  doc.text(`Menu: ${menu || "\u2014"}`, 14, 44);

  doc.setFontSize(9.5);
  if (submittedBy) {
    const timeStr = submittedAt ? new Date(submittedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "";
    doc.setTextColor(63, 122, 92);
    doc.text(`Saved by: ${submittedBy}${timeStr ? " at " + timeStr : ""}`, 14, 50.5);
  } else {
    doc.setTextColor(155, 58, 52);
    doc.text("Status: Not yet saved for this day \u2014 figures may still change", 14, 50.5);
  }

  doc.setFontSize(10);
  doc.setTextColor(107, 101, 88);
  doc.text(`Made: ${fmt(totalMade)}`, 14, 59);
  doc.text(`Distributed: ${fmt(grandDistributed)}`, 62, 59);
  doc.text(`Leftover: ${fmt(leftover)}`, 118, 59);
  doc.text(`Shortfall: ${fmt(grandShortfall)}`, 160, 59);

  autoTable(doc, {
    startY: 65,
    head: [["Distributor", "Quota", "Delivered", "Shortfall"]],
    body: volunteers.map(v => {
      const delivered = Number(v.delivered) || 0;
      const shortfall = Math.max(0, (Number(v.quota) || 0) - delivered);
      return [v.name, String(v.quota), String(delivered), shortfall > 0 ? String(shortfall) : "\u2014"];
    }),
    foot: [["Total", String(grandQuota), String(grandDistributed), String(grandShortfall)]],
    headStyles: { fillColor: [31, 75, 67], textColor: [253, 251, 246], fontStyle: "bold" },
    footStyles: { fillColor: [246, 242, 233], textColor: [38, 36, 31], fontStyle: "bold" },
    styles: { font: "helvetica", fontSize: 10, cellPadding: 4, lineColor: [226, 218, 203], lineWidth: 0.2 },
    theme: "grid",
    columnStyles: { 0: { halign: "left" }, 1: { halign: "center" }, 2: { halign: "center" }, 3: { halign: "center" } },
  });

  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 65;
  doc.setFontSize(8.5);
  doc.setTextColor(138, 131, 117);
  doc.text(`Generated on ${new Date().toLocaleString("en-IN")}`, 14, finalY + 10);

  const safeLabel = dateLabel.replace(/[\s,]+/g, "-");
  doc.save(`FMB-Report-${safeLabel}.pdf`);
}

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

  .dist-table-wrap { display: block; }
  .dist-cards { display: none; }

  .dist-card { border: 1px solid #E2DACB; border-radius: 10px; padding: 12px 14px; margin-bottom: 10px; background: #FDFBF6; }
  .dist-card-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; }
  .dist-card-name { font-weight: 600; font-size: 15px; }
  .dist-card-quota { font-size: 12px; color: #8A8375; }
  .dist-card-row { display: flex; align-items: center; gap: 10px; }
  .dist-card-input-wrap { flex: 1; display: flex; flex-direction: column; gap: 3px; }
  .dist-card-input-label { font-size: 11px; color: #8A8375; }
  .dist-card-input { width: 100%; font-size: 18px !important; padding: 11px !important; text-align: center; border: 1px solid #E2DACB; border-radius: 8px; background: #FFFFFF; }
  .dist-card-shortfall { flex: 1; text-align: center; font-size: 13px; padding-top: 16px; }

  .reports-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 14px; }
  .date-input { padding: 9px 10px; border: 1px solid #E2DACB; border-radius: 6px; background: #FFFFFF; font-family: inherit; }
  .locked-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; color: #8A8375; background: #ECE6D8; padding: 4px 10px; border-radius: 20px; }

  input:disabled { background: #EDEAE0 !important; color: #9B9484 !important; cursor: not-allowed; -webkit-text-fill-color: #9B9484; opacity: 1; }

  .login-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
  .login-card { background: #FDFBF6; border: 1px solid #E2DACB; border-radius: 12px; padding: 32px 28px; max-width: 360px; width: 100%; }
  .login-input { width: 100%; padding: 12px 14px; border: 1px solid #E2DACB; border-radius: 8px; margin: 16px 0 6px; font-family: inherit; }
  .login-btn { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #1F4B43; background: #1F4B43; color: #FDFBF6; font-weight: 600; cursor: pointer; margin-top: 8px; font-family: inherit; }
  .login-error { color: #9B3A34; font-size: 13px; margin: 0; }

  .user-chip { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #8A8375; margin-bottom: 6px; }
  .logout-btn { display: flex; align-items: center; gap: 4px; background: none; border: none; color: #8A8375; cursor: pointer; font-size: 12px; padding: 0; font-family: inherit; }

  .submit-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 14px 16px; border-radius: 8px; margin-bottom: 20px; }
  .submit-bar.pending { background: #FBF3E3; border: 1px solid #E8D9B0; }
  .submit-bar.saved { background: #EEF5F1; border: 1px solid #C7DED2; }
  .edit-again-btn { background: none; border: 1px solid #1F4B43; color: #1F4B43; padding: 7px 14px; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 13px; font-family: inherit; }

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

    .dist-table-wrap { display: none; }
    .dist-cards { display: block; }

    .reports-row { flex-direction: column; align-items: stretch; }
    .date-input { width: 100%; }

    .submit-bar { flex-direction: column; align-items: stretch; text-align: center; }
    .login-card { padding: 26px 20px; }
  }
`;

export default function App() {
  useFonts();
  const [currentUser, setCurrentUser] = useState(null);
  const [menu, setMenu] = useState("Dal, Rice, Sabzi, Roti");
  const [totalMade, setTotalMade] = useState(initialTotalMade);
  const [volunteers, setVolunteers] = useState(initialVolunteers);
  const [history] = useState(initialHistory);
  const [submission, setSubmission] = useState({ submittedBy: null, submittedAt: null });

  function downloadTodayReport() {
    generateReportPdf({
      dateLabel: TODAY.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      menu,
      volunteers,
      totalMade,
      submittedBy: submission.submittedBy,
      submittedAt: submission.submittedAt,
    });
  }

  function handleSubmit() {
    setSubmission({ submittedBy: currentUser, submittedAt: new Date() });
  }

  function handleEditAgain() {
    setSubmission({ submittedBy: null, submittedAt: null });
  }

  return (
    <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", background: "#F6F2E9", minHeight: "100vh", color: "#26241F" }}>
      <style>{GLOBAL_CSS}</style>

      {!currentUser ? (
        <LoginScreen onLogin={setCurrentUser} />
      ) : (
        <>
          <Header
            menu={menu} setMenu={setMenu} onDownload={downloadTodayReport}
            currentUser={currentUser} onLogout={() => setCurrentUser(null)}
          />
          <div className="app-container">
            <TiffinModule
              totalMade={totalMade} setTotalMade={setTotalMade}
              volunteers={volunteers} setVolunteers={setVolunteers}
              locked={!!submission.submittedBy}
              submission={submission}
              onSubmit={handleSubmit}
              onEditAgain={handleEditAgain}
            />
            <ReportsSection
              todayData={{ menu, totalMade, volunteers, submittedBy: submission.submittedBy, submittedAt: submission.submittedAt }}
              history={history}
            />
          </div>
        </>
      )}
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [id, setId] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const name = USERS[id.trim()];
    if (name) {
      setError("");
      onLogin(name);
    } else {
      setError("Login ID not recognised \u2014 check with whoever set up the app.");
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1 className="app-title" style={{ fontSize: 22, marginBottom: 4 }}>Thaali Daftar</h1>
        <p style={{ fontSize: 13, color: "#6B6558", margin: "0 0 4px" }}>FMB Kitchen Register &middot; Hyderabad Jamaat</p>
        <input
          type="text"
          className="login-input"
          placeholder="Login ID"
          value={id}
          onChange={e => setId(e.target.value)}
          autoFocus
        />
        {error && <p className="login-error">{error}</p>}
        <button type="submit" className="login-btn">Log in</button>
      </form>
    </div>
  );
}

function Header({ menu, setMenu, onDownload, currentUser, onLogout }) {
  return (
    <div style={{ borderBottom: "1px solid #E2DACB", background: "#FDFBF6" }}>
      <div className="app-header-inner">
        <div className="user-chip">
          Logged in as <strong style={{ color: "#26241F" }}>{currentUser}</strong>
          <button onClick={onLogout} className="logout-btn"><LogOut size={12} /> Log out</button>
        </div>
        <div className="header-top-row">
          <div>
            <h1 className="app-title">Thaali Daftar</h1>
            <p style={{ margin: "4px 0 16px", color: "#6B6558", fontSize: 14 }}>
              FMB Kitchen Register &middot; Hyderabad Jamaat &middot; {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <button onClick={onDownload} className="download-btn">
            <Download size={15} /> Download today's report (PDF)
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

function TiffinModule({ totalMade, setTotalMade, volunteers, setVolunteers, locked, submission, onSubmit, onEditAgain }) {
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

      <SubmissionBar submission={submission} onSubmit={onSubmit} onEditAgain={onEditAgain} />

      {/* Total made entry */}
      <Section title="Total tiffins made today" note="Confirm or adjust \u2014 defaults to yesterday's count">
        <input
          className="num-input"
          type="number"
          value={totalMade}
          onChange={e => setTotalMade(e.target.value)}
          disabled={locked}
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
          <>
            <div className="dist-table-wrap" style={{ overflowX: "auto" }}>
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
                            disabled={locked}
                            style={{ width: 64, background: "#FAF6EC", color: "#6B6558" }}
                          />
                        </Td>
                        <Td>
                          <input
                            className="num-input grid-input"
                            type="number"
                            value={v.delivered}
                            onChange={e => updateDelivered(idx, e.target.value)}
                            disabled={locked}
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

            {/* Mobile-only: one tall card per distributor instead of a cramped scrolling table */}
            <div className="dist-cards">
              {volunteers.map((v, idx) => {
                const delivered = Number(v.delivered) || 0;
                const shortfall = (Number(v.quota) || 0) - delivered;
                const isSelf = v.name === "Self";
                return (
                  <div key={v.name} className="dist-card" style={{ background: isSelf ? "#FAF6EC" : "#FDFBF6" }}>
                    <div className="dist-card-header">
                      <span className="dist-card-name">{v.name}</span>
                      <span className="dist-card-quota">quota</span>
                    </div>
                    <div className="dist-card-row">
                      <div className="dist-card-input-wrap" style={{ maxWidth: 90 }}>
                        <span className="dist-card-input-label">Quota</span>
                        <input
                          className="num-input dist-card-input"
                          type="number"
                          value={v.quota}
                          onChange={e => updateQuota(idx, e.target.value)}
                          disabled={locked}
                          style={{ background: "#FAF6EC", color: "#6B6558" }}
                        />
                      </div>
                      <div className="dist-card-input-wrap">
                        <span className="dist-card-input-label">Delivered</span>
                        <input
                          className="num-input dist-card-input"
                          type="number"
                          value={v.delivered}
                          onChange={e => updateDelivered(idx, e.target.value)}
                          disabled={locked}
                        />
                      </div>
                      <div className="dist-card-shortfall">
                        {shortfall > 0 ? (
                          <span style={{ color: "#9B3A34", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <AlertTriangle size={13} /> {shortfall}
                          </span>
                        ) : (
                          <span style={{ color: "#3F7A5C" }}>on target</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="dist-card" style={{ background: "#F6F2E9", borderStyle: "dashed" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 14 }}>
                  <span>Total</span>
                  <span>
                    {grandDistributed} delivered
                    {totalShortfall > 0 ? (
                      <span style={{ color: "#9B3A34" }}> &middot; {totalShortfall} short</span>
                    ) : null}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </Section>
    </div>
  );
}

function SubmissionBar({ submission, onSubmit, onEditAgain }) {
  if (submission.submittedBy) {
    const time = submission.submittedAt
      ? new Date(submission.submittedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
      : "";
    return (
      <div className="submit-bar saved">
        <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 500 }}>
          <CheckCircle2 size={16} style={{ color: "#3F7A5C", flexShrink: 0 }} />
          Saved by {submission.submittedBy}{time ? ` at ${time}` : ""}
        </span>
        <button onClick={onEditAgain} className="edit-again-btn">Edit</button>
      </div>
    );
  }
  return (
    <div className="submit-bar pending">
      <span style={{ fontSize: 14, color: "#6B6558" }}>Not yet saved for today</span>
      <button onClick={onSubmit} className="download-btn" style={{ width: "auto" }}>
        Submit for today
      </button>
    </div>
  );
}

function ReportsSection({ todayData, history }) {
  const [selectedDate, setSelectedDate] = useState(TODAY_ISO);

  const isToday = selectedDate === TODAY_ISO;
  const record = isToday ? todayData : history[selectedDate];

  const dateLabel = new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  function handleDownload() {
    if (!record) return;
    generateReportPdf({
      dateLabel,
      menu: record.menu,
      volunteers: record.volunteers,
      totalMade: record.totalMade,
      submittedBy: record.submittedBy,
      submittedAt: record.submittedAt,
    });
  }

  return (
    <Section title="Reports" note="Look up or download any past day's report \u2014 same layout as the daily register">
      <div className="reports-row">
        <input
          type="date"
          className="date-input"
          value={selectedDate}
          max={TODAY_ISO}
          onChange={e => setSelectedDate(e.target.value)}
        />
        {isToday ? (
          <span className="locked-badge">Today \u2014 editable above</span>
        ) : (
          <span className="locked-badge"><Lock size={11} /> Locked, past day</span>
        )}
        <button
          onClick={handleDownload}
          disabled={!record}
          className="download-btn"
          style={{ opacity: record ? 1 : 0.5, cursor: record ? "pointer" : "not-allowed", width: "auto" }}
        >
          <Download size={14} /> Download PDF
        </button>
      </div>

      {record ? (
        <>
          <p style={{ fontSize: 13, color: "#6B6558", margin: "0 0 6px" }}>
            <strong style={{ color: "#26241F" }}>{dateLabel}</strong> &middot; Menu: {record.menu || "\u2014"}
          </p>
          <p style={{ fontSize: 12, margin: "0 0 14px", color: record.submittedBy ? "#3F7A5C" : "#9B3A34" }}>
            {record.submittedBy ? `Saved by ${record.submittedBy}` : "Not yet saved"}
          </p>
          <div className="summary-grid" style={{ marginBottom: 0 }}>
            <SummaryCard label="Made" value={fmt(record.totalMade)} sub="tiffins" />
            <SummaryCard label="Distributed" value={fmt(record.volunteers.reduce((a, v) => a + (Number(v.delivered) || 0), 0))} sub="that day" />
            <SummaryCard
              label="Leftover"
              value={fmt((Number(record.totalMade) || 0) - record.volunteers.reduce((a, v) => a + (Number(v.delivered) || 0), 0))}
              sub="that day"
            />
            <SummaryCard
              label="Shortfall"
              value={fmt(record.volunteers.reduce((a, v) => a + Math.max(0, (Number(v.quota) || 0) - (Number(v.delivered) || 0)), 0))}
              sub="that day"
            />
          </div>
        </>
      ) : (
        <p style={{ fontSize: 13, color: "#8A8375" }}>No entry recorded for this date.</p>
      )}
    </Section>
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