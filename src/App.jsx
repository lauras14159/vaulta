import { useState, useMemo, useEffect } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ── Fonts ── */
const fl = document.createElement("link");
fl.href =
  "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap";
fl.rel = "stylesheet";
document.head.appendChild(fl);

const injectStyles = () => {
  let el = document.getElementById("flowly-styles");
  if (el) return;
  el = document.createElement("style");
  el.id = "flowly-styles";
  el.textContent = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
    input:-webkit-autofill { -webkit-box-shadow: 0 0 0 30px var(--panel) inset !important; -webkit-text-fill-color: var(--text) !important; }
    select option { background: var(--panel); color: var(--text); }
    @keyframes fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    @keyframes scaleIn { from { opacity:0; transform:scale(.95); } to { opacity:1; transform:scale(1); } }
    .fu  { animation: fadeUp .38s ease both; }
    .fu1 { animation: fadeUp .38s .07s ease both; }
    .fu2 { animation: fadeUp .38s .14s ease both; }
    .fu3 { animation: fadeUp .38s .21s ease both; }
    .si  { animation: scaleIn .26s ease both; }
    .hl  { transition: transform .2s, box-shadow .2s; }
    .hl:hover { transform: translateY(-2px); }
    .ib  { background: none; border: none; cursor: pointer; transition: opacity .15s; font-family: inherit; }
    .ib:hover { opacity: .6; }
  `;
  document.head.appendChild(el);
};
injectStyles();

/* ── Themes ── */
const DARK = {
  bg: "#08090e",
  panel: "#0f1017",
  card: "#161820",
  border: "#1e2030",
  borderFocus: "#6366f1",
  text: "#ededf0",
  textSub: "#8a8da8",
  textMuted: "#44475a",
  hover: "rgba(255,255,255,.03)",
  shadow: "rgba(0,0,0,.6)",
  accent: "#6366f1",
  accentBg: "rgba(99,102,241,.1)",
  income: "#34d399",
  incomeBg: "rgba(52,211,153,.1)",
  expense: "#f87171",
  expenseBg: "rgba(248,113,113,.1)",
  amber: "#fbbf24",
  blue: "#60a5fa",
  purple: "#a78bfa",
  gFrom: "#6366f1",
  gTo: "#4f46e5",
};
const LIGHT = {
  bg: "#f5f4ff",
  panel: "#ffffff",
  card: "#eeecfc",
  border: "#dddaf0",
  borderFocus: "#6366f1",
  text: "#18172e",
  textSub: "#5a587a",
  textMuted: "#9e9cb8",
  hover: "rgba(99,102,241,.04)",
  shadow: "rgba(99,102,241,.1)",
  accent: "#6366f1",
  accentBg: "rgba(99,102,241,.07)",
  income: "#059669",
  incomeBg: "rgba(5,150,105,.09)",
  expense: "#dc2626",
  expenseBg: "rgba(220,38,38,.07)",
  amber: "#d97706",
  blue: "#2563eb",
  purple: "#7c3aed",
  gFrom: "#6366f1",
  gTo: "#4f46e5",
};

function applyTheme(t) {
  let el = document.getElementById("fw-theme");
  if (!el) {
    el = document.createElement("style");
    el.id = "fw-theme";
    document.head.appendChild(el);
  }
  el.textContent = `:root{${Object.entries(t)
    .map(([k, v]) => `--${k}:${v}`)
    .join(";")}}body{background:${t.bg};color:${t.text}}`;
}

/* ── Constants ── */
const CURRENCIES = [
  { code: "USD", sym: "$" },
  { code: "EUR", sym: "€" },
  { code: "GBP", sym: "£" },
  { code: "LBP", sym: "ل.ل" },
  { code: "JPY", sym: "¥" },
  { code: "CAD", sym: "CA$" },
  { code: "AED", sym: "د.إ" },
  { code: "INR", sym: "₹" },
  { code: "CHF", sym: "Fr" },
  { code: "AUD", sym: "A$" },
];
const getCur = (code) =>
  CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
const fmtC = (n, code) => {
  const c = getCur(code || "USD");
  return (
    c.sym +
    Math.abs(n).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
};
const fmtK = (n, sym) =>
  n >= 1000
    ? (sym || "$") + (n / 1000).toFixed(1) + "k"
    : (sym || "$") + n.toFixed(0);
const uid = () => Math.random().toString(36).slice(2, 9);
const daysUntil = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);

const EMOJIS = [
  "💡",
  "🏠",
  "🚗",
  "🍕",
  "🎯",
  "🎮",
  "💪",
  "🌿",
  "🐾",
  "🎵",
  "✂️",
  "🔧",
  "🎨",
  "🛒",
  "🌍",
  "📱",
  "💊",
  "🧴",
  "☕",
  "🏖️",
  "🎬",
  "🎓",
  "🔑",
  "💎",
  "🌈",
  "🐶",
  "🏋️",
  "🍺",
  "🧸",
  "✈️",
];
const PALETTE = [
  "#6366f1",
  "#f87171",
  "#34d399",
  "#fbbf24",
  "#a78bfa",
  "#fb923c",
  "#06b6d4",
  "#f472b6",
  "#a3e635",
  "#38bdf8",
  "#e879f9",
  "#facc15",
  "#94a3b8",
  "#6b7280",
  "#ef4444",
  "#3b82f6",
];

const DEF_CATS = [
  { id: "sal", type: "income", name: "Salary", emoji: "💼", color: "#34d399" },
  {
    id: "fre",
    type: "income",
    name: "Freelance",
    emoji: "💻",
    color: "#60a5fa",
  },
  {
    id: "inv",
    type: "income",
    name: "Investments",
    emoji: "📈",
    color: "#a78bfa",
  },
  { id: "gif", type: "income", name: "Gifts", emoji: "🎁", color: "#fbbf24" },
  {
    id: "oi",
    type: "income",
    name: "Other Income",
    emoji: "💰",
    color: "#38bdf8",
  },
  {
    id: "hou",
    type: "expense",
    name: "Housing",
    emoji: "🏠",
    color: "#f87171",
  },
  { id: "foo", type: "expense", name: "Food", emoji: "🍔", color: "#fb923c" },
  {
    id: "tra",
    type: "expense",
    name: "Transport",
    emoji: "🚗",
    color: "#facc15",
  },
  { id: "hea", type: "expense", name: "Health", emoji: "💊", color: "#e879f9" },
  {
    id: "ent",
    type: "expense",
    name: "Entertainment",
    emoji: "🎮",
    color: "#06b6d4",
  },
  {
    id: "sho",
    type: "expense",
    name: "Shopping",
    emoji: "🛍️",
    color: "#f472b6",
  },
  {
    id: "edu",
    type: "expense",
    name: "Education",
    emoji: "📚",
    color: "#a3e635",
  },
  {
    id: "uti",
    type: "expense",
    name: "Utilities",
    emoji: "⚡",
    color: "#94a3b8",
  },
  { id: "tvl", type: "expense", name: "Travel", emoji: "✈️", color: "#fb923c" },
  { id: "oth", type: "expense", name: "Other", emoji: "📦", color: "#6b7280" },
];

const mkTxns = () => [
  {
    id: uid(),
    type: "income",
    catId: "sal",
    amount: 4500,
    note: "Monthly salary",
    date: "2025-04-01",
    currency: "USD",
  },
  {
    id: uid(),
    type: "expense",
    catId: "hou",
    amount: 1200,
    note: "April rent",
    date: "2025-04-02",
    currency: "USD",
  },
  {
    id: uid(),
    type: "expense",
    catId: "foo",
    amount: 320,
    note: "Groceries",
    date: "2025-04-03",
    currency: "USD",
  },
  {
    id: uid(),
    type: "income",
    catId: "fre",
    amount: 800,
    note: "Design project",
    date: "2025-04-05",
    currency: "USD",
  },
  {
    id: uid(),
    type: "expense",
    catId: "tra",
    amount: 150,
    note: "Gas & parking",
    date: "2025-04-06",
    currency: "USD",
  },
  {
    id: uid(),
    type: "expense",
    catId: "ent",
    amount: 90,
    note: "Streaming services",
    date: "2025-04-07",
    currency: "USD",
  },
  {
    id: uid(),
    type: "expense",
    catId: "sho",
    amount: 240,
    note: "New clothes",
    date: "2025-04-09",
    currency: "USD",
  },
  {
    id: uid(),
    type: "income",
    catId: "inv",
    amount: 220,
    note: "Dividend payout",
    date: "2025-04-10",
    currency: "USD",
  },
  {
    id: uid(),
    type: "expense",
    catId: "hea",
    amount: 60,
    note: "Gym membership",
    date: "2025-04-12",
    currency: "USD",
  },
  {
    id: uid(),
    type: "expense",
    catId: "uti",
    amount: 130,
    note: "Electric + internet",
    date: "2025-04-14",
    currency: "USD",
  },
  {
    id: uid(),
    type: "expense",
    catId: "foo",
    amount: 85,
    note: "Restaurant dinner",
    date: "2025-04-16",
    currency: "USD",
  },
  {
    id: uid(),
    type: "income",
    catId: "fre",
    amount: 600,
    note: "Logo design",
    date: "2025-04-18",
    currency: "USD",
  },
  {
    id: uid(),
    type: "expense",
    catId: "tvl",
    amount: 380,
    note: "Weekend trip",
    date: "2025-04-20",
    currency: "USD",
  },
  {
    id: uid(),
    type: "expense",
    catId: "edu",
    amount: 50,
    note: "Online course",
    date: "2025-04-21",
    currency: "USD",
  },
];

const mkRecurring = () => [
  {
    id: uid(),
    catId: "hou",
    amount: 1200,
    note: "Monthly Rent",
    frequency: "monthly",
    nextDate: "2025-05-01",
    currency: "USD",
  },
  {
    id: uid(),
    catId: "ent",
    amount: 15,
    note: "Netflix",
    frequency: "monthly",
    nextDate: "2025-05-07",
    currency: "USD",
  },
  {
    id: uid(),
    catId: "hea",
    amount: 60,
    note: "Gym Membership",
    frequency: "monthly",
    nextDate: "2025-05-12",
    currency: "USD",
  },
];
const mkBills = () => [
  {
    id: uid(),
    catId: "uti",
    amount: 130,
    note: "Electric Bill",
    dueDate: "2025-05-05",
    paid: false,
    currency: "USD",
  },
  {
    id: uid(),
    catId: "hou",
    amount: 1200,
    note: "Rent",
    dueDate: "2025-05-01",
    paid: false,
    currency: "USD",
  },
  {
    id: uid(),
    catId: "ent",
    amount: 15,
    note: "Netflix",
    dueDate: "2025-04-22",
    paid: true,
    currency: "USD",
  },
];
const mkBudgets = () => [
  { id: uid(), catId: "foo", limit: 400, currency: "USD" },
  { id: uid(), catId: "sho", limit: 300, currency: "USD" },
  { id: uid(), catId: "ent", limit: 100, currency: "USD" },
  { id: uid(), catId: "tra", limit: 200, currency: "USD" },
];
const mkGoals = () => [
  {
    id: uid(),
    name: "Japan Trip",
    target: 5000,
    saved: 1800,
    emoji: "✈️",
    deadline: "2025-12-01",
  },
  {
    id: uid(),
    name: "Emergency Fund",
    target: 10000,
    saved: 6200,
    emoji: "🛡️",
    deadline: "",
  },
  {
    id: uid(),
    name: "New Laptop",
    target: 2000,
    saved: 800,
    emoji: "💻",
    deadline: "2025-08-01",
  },
];

const MONTHLY = [
  { m: "Jan", inc: 3200, exp: 2100 },
  { m: "Feb", inc: 3800, exp: 2400 },
  { m: "Mar", inc: 4100, exp: 2800 },
  { m: "Apr", inc: 4500, exp: 2450 },
  { m: "May", inc: 3900, exp: 2100 },
  { m: "Jun", inc: 5200, exp: 3100 },
  { m: "Jul", inc: 4800, exp: 2700 },
  { m: "Aug", inc: 5500, exp: 2900 },
];

/* ── Logo ── */
function FlowlyLogo({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#lg)" />
      <path
        d="M7 21 Q11 11 16 17 Q21 23 25 13"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="25" cy="13" r="2.5" fill="white" />
      <circle cx="7" cy="21" r="1.8" fill="rgba(255,255,255,.55)" />
    </svg>
  );
}

/* ── UI Primitives ── */
function Btn({
  children,
  onClick,
  variant = "primary",
  size = "md",
  full = false,
  disabled = false,
}) {
  const pad = { sm: "6px 12px", md: "9px 18px", lg: "12px 26px" };
  const fs = { sm: 12, md: 13, lg: 15 };
  const vs = {
    primary: {
      background: "linear-gradient(135deg,var(--gFrom),var(--gTo))",
      color: "#fff",
      border: "none",
      boxShadow: "0 3px 12px rgba(99,102,241,.25)",
    },
    ghost: {
      background: "transparent",
      color: "var(--textSub)",
      border: "none",
    },
    outline: {
      background: "transparent",
      color: "var(--text)",
      border: "1px solid var(--border)",
    },
    danger: {
      background: "var(--expenseBg)",
      color: "var(--expense)",
      border: "1px solid var(--expense)",
    },
    success: {
      background: "var(--incomeBg)",
      color: "var(--income)",
      border: "1px solid var(--income)",
    },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: pad[size],
        borderRadius: 9,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "Plus Jakarta Sans,sans-serif",
        fontWeight: 600,
        fontSize: fs[size],
        width: full ? "100%" : "auto",
        transition: "all .2s",
        opacity: disabled ? 0.45 : 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        ...vs[variant],
      }}
    >
      {children}
    </button>
  );
}

function Field({ label, type = "text", value, onChange, placeholder, prefix }) {
  return (
    <div style={{ marginBottom: 11 }}>
      {label && (
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--textMuted)",
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            marginBottom: 5,
            fontFamily: "Plus Jakarta Sans,sans-serif",
          }}
        >
          {label}
        </div>
      )}
      <div style={{ position: "relative" }}>
        {prefix && (
          <span
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--textMuted)",
              fontSize: 13,
              fontFamily: "JetBrains Mono,monospace",
              pointerEvents: "none",
            }}
          >
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            width: "100%",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 9,
            padding: prefix ? "9px 11px 9px 28px" : "9px 11px",
            color: "var(--text)",
            fontSize: 14,
            fontFamily: "JetBrains Mono,monospace",
            outline: "none",
            transition: "border-color .2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--borderFocus)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
      </div>
    </div>
  );
}

function Sel({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 11 }}>
      {label && (
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--textMuted)",
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            marginBottom: 5,
            fontFamily: "Plus Jakarta Sans,sans-serif",
          }}
        >
          {label}
        </div>
      )}
      <select
        value={value}
        onChange={onChange}
        style={{
          width: "100%",
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 9,
          padding: "9px 11px",
          color: "var(--text)",
          fontSize: 14,
          fontFamily: "Plus Jakarta Sans,sans-serif",
          outline: "none",
          cursor: "pointer",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--borderFocus)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
      >
        {options.map((o) => (
          <option
            key={o.value !== undefined ? o.value : o}
            value={o.value !== undefined ? o.value : o}
          >
            {o.label !== undefined ? o.label : o}
          </option>
        ))}
      </select>
    </div>
  );
}

function Modal({ onClose, children, width = 460 }) {
  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.75)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        padding: 16,
      }}
    >
      <div
        className="si"
        style={{
          background: "var(--panel)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: 24,
          width: "100%",
          maxWidth: width,
          maxHeight: "92vh",
          overflowY: "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function MH({ title, onClose }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 18,
      }}
    >
      <span
        style={{
          fontSize: 17,
          fontWeight: 700,
          color: "var(--text)",
          fontFamily: "Plus Jakarta Sans,sans-serif",
        }}
      >
        {title}
      </span>
      <button
        onClick={onClose}
        className="ib"
        style={{ color: "var(--textMuted)", fontSize: 18, lineHeight: 1 }}
      >
        ✕
      </button>
    </div>
  );
}

function Card({ children, style: s = {} }) {
  return (
    <div
      className="hl"
      style={{
        background: "var(--panel)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: 18,
        boxShadow: "0 2px 8px var(--shadow)",
        ...s,
      }}
    >
      {children}
    </div>
  );
}

function StatCard({ label, value, sub, accent, icon, delay = "" }) {
  return (
    <div
      className={"hl fu" + delay}
      style={{
        background: "var(--panel)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "18px 20px",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 2px 8px var(--shadow)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg,${accent},transparent)`,
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--textMuted)",
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              fontFamily: "Plus Jakarta Sans,sans-serif",
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: accent,
              fontFamily: "JetBrains Mono,monospace",
              marginTop: 5,
            }}
          >
            {value}
          </div>
          {sub && (
            <div
              style={{
                fontSize: 11,
                color: "var(--textSub)",
                marginTop: 3,
                fontFamily: "Plus Jakarta Sans,sans-serif",
              }}
            >
              {sub}
            </div>
          )}
        </div>
        <span style={{ fontSize: 22, opacity: 0.5 }}>{icon}</span>
      </div>
    </div>
  );
}

function Tag({ color, children }) {
  return (
    <span
      style={{
        fontSize: 10,
        padding: "2px 7px",
        borderRadius: 5,
        background: color + "22",
        color,
        fontFamily: "Plus Jakarta Sans,sans-serif",
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}

function TxnRow({ t, cats, currency, onDelete }) {
  const cat = cats.find((c) => c.id === t.catId) || {
    emoji: "📦",
    name: "Other",
    color: "#6b7280",
  };
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: "1px solid var(--border)",
        transition: "background .15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 9,
          background:
            t.type === "income" ? "var(--incomeBg)" : "var(--expenseBg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          marginRight: 11,
          flexShrink: 0,
        }}
      >
        {cat.emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text)",
            fontFamily: "Plus Jakarta Sans,sans-serif",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {t.note || cat.name}
        </div>
        <div
          style={{ display: "flex", gap: 5, marginTop: 2, flexWrap: "wrap" }}
        >
          <Tag color="var(--textSub)">{cat.name}</Tag>
          <span
            style={{
              fontSize: 10,
              color: "var(--textMuted)",
              fontFamily: "JetBrains Mono,monospace",
            }}
          >
            {t.date}
          </span>
          {t.currency !== currency && (
            <Tag color="var(--accent)">{t.currency}</Tag>
          )}
        </div>
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: t.type === "income" ? "var(--income)" : "var(--expense)",
          fontFamily: "JetBrains Mono,monospace",
          marginLeft: 10,
          flexShrink: 0,
        }}
      >
        {t.type === "income" ? "+" : "-"}
        {fmtC(t.amount, t.currency)}
      </div>
      <button
        onClick={() => onDelete(t.id)}
        className="ib"
        style={{
          marginLeft: 8,
          color: "var(--textMuted)",
          fontSize: 12,
          padding: "3px 5px",
          borderRadius: 5,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--expense)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--textMuted)")}
      >
        ✕
      </button>
    </div>
  );
}

/* ── Modals ── */
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "radial-gradient(ellipse at 30% 20%, rgba(99,102,241,.12) 0%, transparent 55%)",
          pointerEvents: "none",
        }}
      />
      <div
        className="fu"
        style={{ width: "100%", maxWidth: 400, position: "relative" }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 14,
            }}
          >
            <FlowlyLogo size={54} />
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 800,
              color: "var(--text)",
              letterSpacing: "-0.04em",
              fontFamily: "Plus Jakarta Sans,sans-serif",
            }}
          >
            Flowly
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--textSub)",
              marginTop: 4,
              fontFamily: "Plus Jakarta Sans,sans-serif",
            }}
          >
            Your money, perfectly in flow.
          </div>
        </div>
        <div
          style={{
            background: "var(--panel)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            padding: 26,
            boxShadow: "0 24px 60px var(--shadow)",
          }}
        >
          <div
            style={{
              display: "flex",
              background: "var(--card)",
              borderRadius: 10,
              padding: 3,
              marginBottom: 20,
            }}
          >
            {["login", "signup"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  flex: 1,
                  padding: "9px 0",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "Plus Jakarta Sans,sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  transition: "all .2s",
                  background: mode === m ? "var(--accent)" : "transparent",
                  color: mode === m ? "#fff" : "var(--textSub)",
                }}
              >
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>
          {mode === "signup" && (
            <Field
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Johnson"
            />
          )}
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
          />
          <Field
            label="Password"
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="••••••••"
          />
          <div style={{ marginTop: 6 }}>
            <Btn
              full
              size="lg"
              onClick={() =>
                onLogin({ name: name || email.split("@")[0] || "User", email })
              }
            >
              {mode === "login" ? "Sign In →" : "Create Account →"}
            </Btn>
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--textMuted)",
              textAlign: "center",
              marginTop: 12,
              fontFamily: "Plus Jakarta Sans,sans-serif",
            }}
          >
            Demo: any email + password works
          </div>
        </div>
      </div>
    </div>
  );
}

function AddTxnModal({ onClose, onAdd, cats, currency }) {
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [catId, setCatId] = useState(
    cats.filter((c) => c.type === "expense")[0]?.id || "",
  );
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [cur, setCur] = useState(currency);
  function submit() {
    if (!amount || isNaN(+amount) || +amount <= 0) return;
    onAdd({
      id: uid(),
      type,
      catId,
      amount: +amount,
      note,
      date,
      currency: cur,
    });
    onClose();
  }
  return (
    <Modal onClose={onClose}>
      <MH title="New Transaction" onClose={onClose} />
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {["income", "expense"].map((t) => (
          <button
            key={t}
            onClick={() => {
              setType(t);
              setCatId(cats.filter((c) => c.type === t)[0]?.id || "");
            }}
            style={{
              flex: 1,
              padding: "9px 0",
              borderRadius: 10,
              border: "2px solid",
              cursor: "pointer",
              fontFamily: "Plus Jakarta Sans,sans-serif",
              fontSize: 13,
              fontWeight: 600,
              transition: "all .2s",
              borderColor:
                type === t
                  ? t === "income"
                    ? "var(--income)"
                    : "var(--expense)"
                  : "var(--border)",
              background:
                type === t
                  ? t === "income"
                    ? "var(--incomeBg)"
                    : "var(--expenseBg)"
                  : "transparent",
              color:
                type === t
                  ? t === "income"
                    ? "var(--income)"
                    : "var(--expense)"
                  : "var(--textSub)",
            }}
          >
            {t === "income" ? "⬆ Income" : "⬇ Expense"}
          </button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          prefix={getCur(cur).sym}
        />
        <Sel
          label="Currency"
          value={cur}
          onChange={(e) => setCur(e.target.value)}
          options={CURRENCIES.map((c) => ({
            value: c.code,
            label: c.sym + " " + c.code,
          }))}
        />
      </div>
      <Sel
        label="Category"
        value={catId}
        onChange={(e) => setCatId(e.target.value)}
        options={cats
          .filter((c) => c.type === type)
          .map((c) => ({ value: c.id, label: c.emoji + " " + c.name }))}
      />
      <Field
        label="Note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="What was this for?"
      />
      <Field
        label="Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
        <Btn variant="outline" full onClick={onClose}>
          Cancel
        </Btn>
        <Btn full onClick={submit}>
          Add Transaction
        </Btn>
      </div>
    </Modal>
  );
}

function CatsModal({ onClose, cats, onSave }) {
  const [list, setList] = useState(cats);
  const [nm, setNm] = useState("");
  const [em, setEm] = useState("💡");
  const [col, setCol] = useState("#6366f1");
  const [tp, setTp] = useState("expense");
  function addCat() {
    if (!nm.trim()) return;
    setList((p) => [
      ...p,
      { id: uid(), type: tp, name: nm.trim(), emoji: em, color: col },
    ]);
    setNm("");
  }
  return (
    <Modal onClose={() => onSave(list)} width={500}>
      <MH title="⚙️ Categories" onClose={() => onSave(list)} />
      <div
        style={{
          background: "var(--card)",
          borderRadius: 12,
          padding: 14,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--textMuted)",
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            marginBottom: 10,
            fontFamily: "Plus Jakarta Sans,sans-serif",
          }}
        >
          Add New
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <Field
              label="Name"
              value={nm}
              onChange={(e) => setNm(e.target.value)}
              placeholder="e.g. Pets"
            />
          </div>
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--textMuted)",
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                marginBottom: 5,
                fontFamily: "Plus Jakarta Sans,sans-serif",
              }}
            >
              Type
            </div>
            <select
              value={tp}
              onChange={(e) => setTp(e.target.value)}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 9,
                padding: "9px 10px",
                color: "var(--text)",
                fontSize: 13,
                fontFamily: "Plus Jakarta Sans,sans-serif",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--textMuted)",
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            marginBottom: 6,
            fontFamily: "Plus Jakarta Sans,sans-serif",
          }}
        >
          Emoji
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 4,
            marginBottom: 10,
          }}
        >
          {EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => setEm(e)}
              style={{
                width: 30,
                height: 30,
                borderRadius: 6,
                border: "2px solid",
                cursor: "pointer",
                fontSize: 14,
                borderColor: em === e ? "var(--accent)" : "var(--border)",
                background: em === e ? "var(--accentBg)" : "var(--card)",
              }}
            >
              {e}
            </button>
          ))}
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--textMuted)",
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            marginBottom: 6,
            fontFamily: "Plus Jakarta Sans,sans-serif",
          }}
        >
          Color
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 4,
            marginBottom: 12,
          }}
        >
          {PALETTE.map((c) => (
            <button
              key={c}
              onClick={() => setCol(c)}
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                border:
                  col === c ? "3px solid var(--text)" : "2px solid transparent",
                cursor: "pointer",
                background: c,
                transition: "transform .15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.3)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            />
          ))}
        </div>
        <Btn size="sm" onClick={addCat}>
          + Add
        </Btn>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          maxHeight: 200,
          overflowY: "auto",
          marginBottom: 14,
        }}
      >
        {list.map((c) => (
          <div
            key={c.id}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 11px",
              background: "var(--card)",
              borderRadius: 9,
              gap: 9,
            }}
          >
            <span style={{ fontSize: 16 }}>{c.emoji}</span>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 3,
                background: c.color,
                flexShrink: 0,
              }}
            />
            <div
              style={{
                flex: 1,
                fontSize: 13,
                fontWeight: 500,
                color: "var(--text)",
                fontFamily: "Plus Jakarta Sans,sans-serif",
              }}
            >
              {c.name}
            </div>
            <Tag
              color={c.type === "income" ? "var(--income)" : "var(--expense)"}
            >
              {c.type}
            </Tag>
            <button
              onClick={() => setList((p) => p.filter((x) => x.id !== c.id))}
              className="ib"
              style={{ color: "var(--textMuted)", fontSize: 12 }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <Btn full onClick={() => onSave(list)}>
        Save Changes
      </Btn>
    </Modal>
  );
}

function WalletModal({ onClose, wallet, onSave }) {
  const [cash, setCash] = useState(String(wallet.cash));
  const [bank, setBank] = useState(String(wallet.bank));
  const [sav, setSav] = useState(String(wallet.savings));
  return (
    <Modal onClose={onClose} width={360}>
      <MH title="💳 Update Wallet" onClose={onClose} />
      <Field
        label="Cash on Hand"
        type="number"
        value={cash}
        onChange={(e) => setCash(e.target.value)}
        placeholder="0.00"
        prefix="$"
      />
      <Field
        label="Bank Account"
        type="number"
        value={bank}
        onChange={(e) => setBank(e.target.value)}
        placeholder="0.00"
        prefix="$"
      />
      <Field
        label="Savings Account"
        type="number"
        value={sav}
        onChange={(e) => setSav(e.target.value)}
        placeholder="0.00"
        prefix="$"
      />
      <Btn
        full
        onClick={() =>
          onSave({ cash: +cash || 0, bank: +bank || 0, savings: +sav || 0 })
        }
      >
        Save Wallet
      </Btn>
    </Modal>
  );
}

function GoalModal({ onClose, onAdd }) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [saved, setSaved] = useState("");
  const [emoji, setEmoji] = useState("🎯");
  const [dl, setDl] = useState("");
  const GE = [
    "🎯",
    "✈️",
    "🏠",
    "🚗",
    "💻",
    "📱",
    "🏖️",
    "💍",
    "🎓",
    "💪",
    "🌍",
    "🎉",
  ];
  function submit() {
    if (name && target) {
      onAdd({
        id: uid(),
        name,
        target: +target,
        saved: +saved || 0,
        emoji,
        deadline: dl,
      });
      onClose();
    }
  }
  return (
    <Modal onClose={onClose} width={380}>
      <MH title="🎯 New Savings Goal" onClose={onClose} />
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}
      >
        {GE.map((e) => (
          <button
            key={e}
            onClick={() => setEmoji(e)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 7,
              border: "2px solid",
              cursor: "pointer",
              fontSize: 15,
              borderColor: emoji === e ? "var(--accent)" : "var(--border)",
              background: emoji === e ? "var(--accentBg)" : "var(--card)",
            }}
          >
            {e}
          </button>
        ))}
      </div>
      <Field
        label="Goal Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Japan Trip"
      />
      <Field
        label="Target"
        type="number"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        placeholder="5000"
        prefix="$"
      />
      <Field
        label="Already Saved"
        type="number"
        value={saved}
        onChange={(e) => setSaved(e.target.value)}
        placeholder="0"
        prefix="$"
      />
      <Field
        label="Deadline (optional)"
        type="date"
        value={dl}
        onChange={(e) => setDl(e.target.value)}
      />
      <Btn full onClick={submit}>
        Create Goal
      </Btn>
    </Modal>
  );
}

function RecurModal({ onClose, onAdd, cats, currency }) {
  const [catId, setCatId] = useState(
    cats.filter((c) => c.type === "expense")[0]?.id || "",
  );
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [freq, setFreq] = useState("monthly");
  const [next, setNext] = useState(new Date().toISOString().split("T")[0]);
  const [cur, setCur] = useState(currency);
  function submit() {
    if (amount) {
      onAdd({
        id: uid(),
        catId,
        amount: +amount,
        note,
        frequency: freq,
        nextDate: next,
        currency: cur,
      });
      onClose();
    }
  }
  return (
    <Modal onClose={onClose} width={380}>
      <MH title="🔁 New Recurring" onClose={onClose} />
      <Field
        label="Amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0.00"
        prefix={getCur(cur).sym}
      />
      <Sel
        label="Category"
        value={catId}
        onChange={(e) => setCatId(e.target.value)}
        options={cats.map((c) => ({
          value: c.id,
          label: c.emoji + " " + c.name,
        }))}
      />
      <Field
        label="Note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. Netflix subscription"
      />
      <Sel
        label="Frequency"
        value={freq}
        onChange={(e) => setFreq(e.target.value)}
        options={[
          { value: "weekly", label: "Weekly" },
          { value: "monthly", label: "Monthly" },
          { value: "yearly", label: "Yearly" },
        ]}
      />
      <Sel
        label="Currency"
        value={cur}
        onChange={(e) => setCur(e.target.value)}
        options={CURRENCIES.map((c) => ({
          value: c.code,
          label: c.sym + " " + c.code,
        }))}
      />
      <Field
        label="Next Date"
        type="date"
        value={next}
        onChange={(e) => setNext(e.target.value)}
      />
      <Btn full onClick={submit}>
        Add Recurring
      </Btn>
    </Modal>
  );
}

function BillModal({ onClose, onAdd, cats, currency }) {
  const [catId, setCatId] = useState(
    cats.filter((c) => c.type === "expense")[0]?.id || "",
  );
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [due, setDue] = useState(new Date().toISOString().split("T")[0]);
  const [cur, setCur] = useState(currency);
  function submit() {
    if (note && amount) {
      onAdd({
        id: uid(),
        catId,
        amount: +amount,
        note,
        dueDate: due,
        paid: false,
        currency: cur,
      });
      onClose();
    }
  }
  return (
    <Modal onClose={onClose} width={380}>
      <MH title="📅 New Bill Reminder" onClose={onClose} />
      <Field
        label="Bill Name"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. Electricity"
      />
      <Field
        label="Amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0.00"
        prefix={getCur(cur).sym}
      />
      <Sel
        label="Category"
        value={catId}
        onChange={(e) => setCatId(e.target.value)}
        options={cats.map((c) => ({
          value: c.id,
          label: c.emoji + " " + c.name,
        }))}
      />
      <Sel
        label="Currency"
        value={cur}
        onChange={(e) => setCur(e.target.value)}
        options={CURRENCIES.map((c) => ({
          value: c.code,
          label: c.sym + " " + c.code,
        }))}
      />
      <Field
        label="Due Date"
        type="date"
        value={due}
        onChange={(e) => setDue(e.target.value)}
      />
      <Btn full onClick={submit}>
        Add Bill
      </Btn>
    </Modal>
  );
}

function BudgetModal({ onClose, cats, budgets, onSave }) {
  const [list, setList] = useState(budgets);
  const expCats = cats.filter((c) => c.type === "expense");
  function setLimit(id, val) {
    setList((p) =>
      p.map((b) => (b.id === id ? { ...b, limit: +val || 0 } : b)),
    );
  }
  function addCat(catId) {
    if (catId && !list.find((b) => b.catId === catId))
      setList((p) => [...p, { id: uid(), catId, limit: 0, currency: "USD" }]);
  }
  return (
    <Modal onClose={() => onSave(list)} width={420}>
      <MH title="🎯 Budget Goals" onClose={() => onSave(list)} />
      <div
        style={{
          fontSize: 12,
          color: "var(--textSub)",
          marginBottom: 14,
          fontFamily: "Plus Jakarta Sans,sans-serif",
        }}
      >
        Set monthly limits. Alerts show when you hit 80%.
      </div>
      {list.map((b) => {
        const cat = cats.find((c) => c.id === b.catId);
        return (
          <div
            key={b.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <span style={{ fontSize: 18 }}>{cat ? cat.emoji : "📦"}</span>
            <div
              style={{
                flex: 1,
                fontSize: 13,
                color: "var(--text)",
                fontFamily: "Plus Jakarta Sans,sans-serif",
              }}
            >
              {cat ? cat.name : "Other"}
            </div>
            <div style={{ width: 130 }}>
              <Field
                value={String(b.limit)}
                onChange={(e) => setLimit(b.id, e.target.value)}
                placeholder="Limit"
                prefix="$"
              />
            </div>
            <button
              onClick={() => setList((p) => p.filter((x) => x.id !== b.id))}
              className="ib"
              style={{ color: "var(--textMuted)", fontSize: 12 }}
            >
              ✕
            </button>
          </div>
        );
      })}
      <div style={{ marginTop: 4, marginBottom: 14 }}>
        <Sel
          label="Add category"
          value=""
          onChange={(e) => addCat(e.target.value)}
          options={[
            { value: "", label: "+ Add category budget..." },
            ...expCats
              .filter((c) => !list.find((b) => b.catId === c.id))
              .map((c) => ({ value: c.id, label: c.emoji + " " + c.name })),
          ]}
        />
      </div>
      <Btn full onClick={() => onSave(list)}>
        Save Budgets
      </Btn>
    </Modal>
  );
}

function exportCSV(txns, cats) {
  const rows = txns.map((t) => {
    const cat = cats.find((c) => c.id === t.catId);
    return [
      t.date,
      t.type,
      cat ? cat.name : "Other",
      t.amount,
      t.currency || "USD",
      '"' + (t.note || "") + '"',
    ].join(",");
  });
  const csv = ["Date,Type,Category,Amount,Currency,Note", ...rows].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "flowly.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/* ── SIDEBAR ── */
function Sidebar({
  view,
  setView,
  dark,
  setDark,
  user,
  setUser,
  setModal,
  sideOpen,
  setSideOpen,
  overdueBills,
}) {
  const NAV = [
    { id: "dashboard", icon: "⬡", label: "Dashboard" },
    { id: "wallet", icon: "💳", label: "Wallet" },
    { id: "txns", icon: "↕", label: "Transactions" },
    { id: "recurring", icon: "🔁", label: "Recurring" },
    { id: "bills", icon: "📅", label: "Bills" },
    { id: "goals", icon: "🎯", label: "Goals" },
    { id: "analytics", icon: "◈", label: "Analytics" },
  ];

  const sideStyle = {
    width: 205,
    background: "var(--panel)",
    borderRight: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 300,
    padding: "16px 10px",
    transition: "transform .28s cubic-bezier(.4,0,.2,1)",
    transform: sideOpen ? "translateX(0)" : "translateX(-100%)",
  };

  function nav(id) {
    setView(id);
    if (window.innerWidth < 900) setSideOpen(false);
  }

  return (
    <div style={sideStyle}>
      {/* Logo + close button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          paddingLeft: 4,
          marginBottom: 22,
        }}
      >
        <FlowlyLogo size={30} />
        <span
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: "var(--text)",
            letterSpacing: "-0.04em",
            fontFamily: "Plus Jakarta Sans,sans-serif",
          }}
        >
          Flowly
        </span>
        <button
          onClick={() => setSideOpen(false)}
          className="ib"
          style={{
            marginLeft: "auto",
            color: "var(--textMuted)",
            fontSize: 20,
            lineHeight: 1,
            padding: 4,
          }}
        >
          ✕
        </button>
      </div>

      <nav style={{ flex: 1, overflowY: "auto" }}>
        {NAV.map((n) => (
          <button
            key={n.id}
            onClick={() => nav(n.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "9px 10px",
              borderRadius: 9,
              border: "none",
              marginBottom: 1,
              fontSize: 13,
              fontWeight: 600,
              width: "100%",
              cursor: "pointer",
              transition: "all .2s",
              fontFamily: "Plus Jakarta Sans,sans-serif",
              background: view === n.id ? "var(--accentBg)" : "transparent",
              color: view === n.id ? "var(--accent)" : "var(--textSub)",
            }}
          >
            <span style={{ fontSize: 15 }}>{n.icon}</span>
            {n.label}
            {n.id === "bills" && overdueBills > 0 && (
              <span
                style={{
                  marginLeft: "auto",
                  background: "var(--expense)",
                  color: "#fff",
                  borderRadius: "50%",
                  width: 16,
                  height: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 9,
                  fontWeight: 700,
                }}
              >
                {overdueBills}
              </span>
            )}
          </button>
        ))}
        <div
          style={{
            borderTop: "1px solid var(--border)",
            marginTop: 8,
            paddingTop: 8,
          }}
        >
          <button
            onClick={() => setModal("cats")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "9px 10px",
              borderRadius: 9,
              border: "1px dashed var(--border)",
              marginBottom: 4,
              fontSize: 13,
              fontWeight: 600,
              width: "100%",
              cursor: "pointer",
              fontFamily: "Plus Jakarta Sans,sans-serif",
              background: "transparent",
              color: "var(--textMuted)",
            }}
          >
            ⊕ Categories
          </button>
          <button
            onClick={() => setModal("budget")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "9px 10px",
              borderRadius: 9,
              border: "1px dashed var(--border)",
              fontSize: 13,
              fontWeight: 600,
              width: "100%",
              cursor: "pointer",
              fontFamily: "Plus Jakarta Sans,sans-serif",
              background: "transparent",
              color: "var(--textMuted)",
            }}
          >
            🎯 Budgets
          </button>
        </div>
      </nav>

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
        <button
          onClick={() => setDark((p) => !p)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 10px",
            borderRadius: 9,
            width: "100%",
            border: "none",
            cursor: "pointer",
            fontFamily: "Plus Jakarta Sans,sans-serif",
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 8,
            background: "var(--card)",
            color: "var(--textSub)",
          }}
        >
          <span>{dark ? "☀️" : "🌙"}</span> {dark ? "Light Mode" : "Dark Mode"}
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "7px 9px",
            borderRadius: 9,
            background: "var(--card)",
            marginBottom: 6,
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              background: "linear-gradient(135deg,var(--accent),var(--purple))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {user.name[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.name}
            </div>
            <div
              style={{
                fontSize: 10,
                color: "var(--textMuted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.email}
            </div>
          </div>
        </div>
        <button
          onClick={() => setUser(null)}
          style={{
            width: "100%",
            padding: "7px 10px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            fontFamily: "Plus Jakarta Sans,sans-serif",
            fontSize: 12,
            fontWeight: 600,
            background: "transparent",
            color: "var(--textMuted)",
            textAlign: "left",
          }}
        >
          ← Sign Out
        </button>
      </div>
    </div>
  );
}

/* ── MAIN APP ── */
export default function App() {
  const [dark, setDark] = useState(true);
  const [user, setUser] = useState(null);
  const [view, setView] = useState("dashboard");
  const [txns, setTxns] = useState(() => mkTxns());
  const [cats, setCats] = useState(DEF_CATS);
  const [wallet, setWallet] = useState({
    cash: 340,
    bank: 6200,
    savings: 2800,
  });
  const [goals, setGoals] = useState(() => mkGoals());
  const [recurring, setRecurring] = useState(() => mkRecurring());
  const [bills, setBills] = useState(() => mkBills());
  const [budgets, setBudgets] = useState(() => mkBudgets());
  const [currency, setCurrency] = useState("USD");
  const [modal, setModal] = useState(null);
  const [ftype, setFtype] = useState("all");
  const [search, setSearch] = useState("");
  const [sideOpen, setSideOpen] = useState(true); // open by default on desktop

  useEffect(() => {
    applyTheme(dark ? DARK : LIGHT);
  }, [dark]);

  // On small screens start closed
  useEffect(() => {
    if (window.innerWidth < 900) setSideOpen(false);
  }, []);

  const cur = getCur(currency);
  const totInc = useMemo(
    () =>
      txns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
    [txns],
  );
  const totExp = useMemo(
    () =>
      txns
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0),
    [txns],
  );
  const bal = totInc - totExp;
  const wTotal = wallet.cash + wallet.bank + wallet.savings;
  const savRate = totInc > 0 ? ((bal / totInc) * 100).toFixed(1) : 0;
  const ttStyle = {
    background: "var(--panel)",
    border: "1px solid var(--border)",
    borderRadius: 9,
    color: "var(--text)",
    fontFamily: "JetBrains Mono,monospace",
    fontSize: 11,
  };

  const catExp = useMemo(() => {
    const m = {};
    txns
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        m[t.catId] = (m[t.catId] || 0) + t.amount;
      });
    return Object.entries(m)
      .map(([catId, value]) => ({ catId, value }))
      .sort((a, b) => b.value - a.value);
  }, [txns]);

  const filtered = useMemo(
    () =>
      txns.filter((t) => {
        if (ftype !== "all" && t.type !== ftype) return false;
        const c = cats.find((x) => x.id === t.catId);
        if (
          search &&
          !t.note.toLowerCase().includes(search.toLowerCase()) &&
          !(c && c.name.toLowerCase().includes(search.toLowerCase()))
        )
          return false;
        return true;
      }),
    [txns, ftype, search, cats],
  );

  const delTxn = (id) => setTxns((p) => p.filter((x) => x.id !== id));
  const upcomingBills = bills
    .filter((b) => !b.paid)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  const overdueBills = upcomingBills.filter((b) => daysUntil(b.dueDate) < 0);

  const budgetAlerts = budgets.filter((b) => {
    if (b.limit <= 0) return false;
    const spent = txns
      .filter((t) => t.type === "expense" && t.catId === b.catId)
      .reduce((s, t) => s + t.amount, 0);
    return spent / b.limit > 0.8;
  });

  const VIEWS = {
    dashboard: "Dashboard",
    wallet: "Wallet 💳",
    txns: "Transactions",
    recurring: "Recurring 🔁",
    bills: "Bill Reminders 📅",
    goals: "Savings Goals 🎯",
    analytics: "Analytics 📊",
  };

  // Margin left only when sidebar is open (not on very small screens)
  const mainMargin = sideOpen ? 205 : 0;

  if (!user) return <AuthScreen onLogin={setUser} />;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        fontFamily: "Plus Jakarta Sans,sans-serif",
      }}
    >
      {/* Overlay when sidebar open on small screen */}
      {sideOpen && (
        <div
          onClick={() => setSideOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.5)",
            zIndex: 250,
            display: window.innerWidth < 900 ? "block" : "none",
          }}
        />
      )}

      <Sidebar
        view={view}
        setView={setView}
        dark={dark}
        setDark={setDark}
        user={user}
        setUser={setUser}
        setModal={setModal}
        sideOpen={sideOpen}
        setSideOpen={setSideOpen}
        overdueBills={overdueBills.length}
      />

      {/* MAIN */}
      <div
        style={{
          marginLeft: mainMargin,
          transition: "margin .28s cubic-bezier(.4,0,.2,1)",
          minHeight: "100vh",
          padding: "20px 24px",
        }}
      >
        {/* Top bar */}
        <div
          className="fu"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 22,
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Hamburger / toggle button — always visible */}
            <button
              onClick={() => setSideOpen((p) => !p)}
              style={{
                width: 38,
                height: 38,
                borderRadius: 9,
                background: "var(--panel)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
                transition: "all .2s",
                fontSize: 17,
                color: "var(--text)",
              }}
            >
              {sideOpen ? "✕" : "☰"}
            </button>
            <div>
              <div
                style={{
                  fontSize: 21,
                  fontWeight: 800,
                  color: "var(--text)",
                  letterSpacing: "-0.03em",
                }}
              >
                {VIEWS[view] || "Flowly"}
              </div>
              <div
                style={{ fontSize: 12, color: "var(--textSub)", marginTop: 1 }}
              >
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 9,
                padding: "7px 10px",
                color: "var(--text)",
                fontSize: 12,
                fontFamily: "Plus Jakarta Sans,sans-serif",
                outline: "none",
                cursor: "pointer",
              }}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.sym} {c.code}
                </option>
              ))}
            </select>
            <Btn
              variant="outline"
              size="sm"
              onClick={() => exportCSV(txns, cats)}
            >
              📤 CSV
            </Btn>
            {view === "goals" && (
              <Btn variant="outline" size="sm" onClick={() => setModal("goal")}>
                + Goal
              </Btn>
            )}
            {view === "recurring" && (
              <Btn
                variant="outline"
                size="sm"
                onClick={() => setModal("recur")}
              >
                + Recurring
              </Btn>
            )}
            {view === "bills" && (
              <Btn variant="outline" size="sm" onClick={() => setModal("bill")}>
                + Bill
              </Btn>
            )}
            <Btn onClick={() => setModal("txn")}>+ Add</Btn>
          </div>
        </div>

        {/* ═══ DASHBOARD ═══ */}
        {view === "dashboard" && (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
                gap: 12,
                marginBottom: 18,
              }}
            >
              <StatCard
                label="Net Balance"
                value={fmtC(bal, currency)}
                sub={savRate + "% savings rate"}
                accent={bal >= 0 ? "var(--income)" : "var(--expense)"}
                icon="💎"
              />
              <StatCard
                label="Income"
                value={fmtC(totInc, currency)}
                sub={
                  txns.filter((t) => t.type === "income").length + " entries"
                }
                accent="var(--income)"
                icon="⬆"
                delay="1"
              />
              <StatCard
                label="Expenses"
                value={fmtC(totExp, currency)}
                sub={
                  txns.filter((t) => t.type === "expense").length + " entries"
                }
                accent="var(--expense)"
                icon="⬇"
                delay="2"
              />
              <StatCard
                label="Wealth"
                value={fmtC(wTotal, currency)}
                sub="wallet total"
                accent="var(--amber)"
                icon="🏦"
                delay="3"
              />
            </div>

            {budgetAlerts.length > 0 && (
              <div
                className="fu1"
                style={{
                  background: "var(--expenseBg)",
                  border: "1px solid var(--expense)",
                  borderRadius: 12,
                  padding: "11px 15px",
                  marginBottom: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 17 }}>⚠️</span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--expense)",
                      fontFamily: "Plus Jakarta Sans,sans-serif",
                    }}
                  >
                    Budget Alert
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--textSub)",
                      fontFamily: "Plus Jakarta Sans,sans-serif",
                    }}
                  >
                    {budgetAlerts
                      .map((b) => {
                        const cat = cats.find((c) => c.id === b.catId);
                        const s = txns
                          .filter(
                            (t) => t.type === "expense" && t.catId === b.catId,
                          )
                          .reduce((x, t) => x + t.amount, 0);
                        return (
                          (cat ? cat.name : "") +
                          " " +
                          cur.sym +
                          s.toFixed(0) +
                          " / " +
                          cur.sym +
                          b.limit
                        );
                      })
                      .join("  ·  ")}
                  </div>
                </div>
              </div>
            )}

            {upcomingBills.length > 0 && (
              <div
                className="fu1"
                style={{
                  background: "var(--accentBg)",
                  border: "1px solid rgba(99,102,241,.25)",
                  borderRadius: 12,
                  padding: "11px 15px",
                  marginBottom: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 17 }}>📅</span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--accent)",
                      fontFamily: "Plus Jakarta Sans,sans-serif",
                    }}
                  >
                    Upcoming Bills
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--textSub)",
                      fontFamily: "Plus Jakarta Sans,sans-serif",
                    }}
                  >
                    {upcomingBills
                      .slice(0, 3)
                      .map((b) => {
                        const d = daysUntil(b.dueDate);
                        return (
                          b.note +
                          " " +
                          (d < 0
                            ? "OVERDUE"
                            : d === 0
                              ? "today"
                              : "in " + d + "d")
                        );
                      })
                      .join("  ·  ")}
                  </div>
                </div>
                <Btn size="sm" variant="ghost" onClick={() => setView("bills")}>
                  View →
                </Btn>
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
                gap: 14,
                marginBottom: 14,
              }}
            >
              <Card className="fu1">
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--text)",
                    marginBottom: 14,
                  }}
                >
                  Income vs Expenses
                </div>
                <ResponsiveContainer width="100%" height={190}>
                  <AreaChart data={MONTHLY}>
                    <defs>
                      <linearGradient id="gI" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#34d399"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="#34d399"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#f87171"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="#f87171"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                    />
                    <XAxis
                      dataKey="m"
                      tick={{
                        fill: "var(--textMuted)",
                        fontSize: 10,
                        fontFamily: "JetBrains Mono",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{
                        fill: "var(--textMuted)",
                        fontSize: 10,
                        fontFamily: "JetBrains Mono",
                      }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => fmtK(v, cur.sym)}
                    />
                    <Tooltip
                      contentStyle={ttStyle}
                      formatter={(v) => [fmtC(v, currency)]}
                    />
                    <Area
                      type="monotone"
                      dataKey="inc"
                      stroke="#34d399"
                      strokeWidth={2}
                      fill="url(#gI)"
                      name="Income"
                    />
                    <Area
                      type="monotone"
                      dataKey="exp"
                      stroke="#f87171"
                      strokeWidth={2}
                      fill="url(#gE)"
                      name="Expenses"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              <Card className="fu2">
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--text)",
                    marginBottom: 12,
                  }}
                >
                  By Category
                </div>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie
                      data={catExp.slice(0, 6)}
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={62}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {catExp.slice(0, 6).map((e, i) => {
                        const c = cats.find((x) => x.id === e.catId);
                        return <Cell key={i} fill={c ? c.color : "#6b7280"} />;
                      })}
                    </Pie>
                    <Tooltip
                      contentStyle={ttStyle}
                      formatter={(v, n, p) => [
                        fmtC(v, currency),
                        (
                          cats.find((c) => c.id === p.payload.catId) || {
                            name: "Other",
                          }
                        ).name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "3px 8px",
                    marginTop: 4,
                  }}
                >
                  {catExp.slice(0, 6).map((e) => {
                    const c = cats.find((x) => x.id === e.catId);
                    return (
                      <div
                        key={e.catId}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: 2,
                            background: c ? c.color : "#6b7280",
                          }}
                        />
                        <span
                          style={{
                            fontSize: 10,
                            color: "var(--textMuted)",
                            fontFamily: "Plus Jakarta Sans,sans-serif",
                          }}
                        >
                          {c ? c.name : "Other"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            <Card className="fu3">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--text)",
                  }}
                >
                  Recent Transactions
                </div>
                <Btn variant="ghost" size="sm" onClick={() => setView("txns")}>
                  View all →
                </Btn>
              </div>
              {txns.slice(0, 6).map((t) => (
                <TxnRow
                  key={t.id}
                  t={t}
                  cats={cats}
                  currency={currency}
                  onDelete={delTxn}
                />
              ))}
            </Card>
          </div>
        )}

        {/* ═══ WALLET ═══ */}
        {view === "wallet" && (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
                gap: 12,
                marginBottom: 18,
              }}
            >
              <StatCard
                label="Cash"
                value={fmtC(wallet.cash, currency)}
                accent="var(--amber)"
                icon="💵"
              />
              <StatCard
                label="Bank"
                value={fmtC(wallet.bank, currency)}
                accent="var(--blue)"
                icon="🏦"
                delay="1"
              />
              <StatCard
                label="Savings"
                value={fmtC(wallet.savings, currency)}
                accent="var(--income)"
                icon="🐷"
                delay="2"
              />
              <StatCard
                label="Net Worth"
                value={fmtC(wTotal + bal, currency)}
                accent="var(--accent)"
                icon="💎"
                delay="3"
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
                gap: 14,
              }}
            >
              <Card className="fu1">
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--text)",
                    marginBottom: 16,
                  }}
                >
                  Wallet Breakdown
                </div>
                {[
                  { l: "Cash", v: wallet.cash, c: "var(--amber)" },
                  { l: "Bank", v: wallet.bank, c: "var(--blue)" },
                  { l: "Savings", v: wallet.savings, c: "var(--income)" },
                ].map((w) => {
                  const pct = wTotal ? ((w.v / wTotal) * 100).toFixed(1) : 0;
                  return (
                    <div key={w.l} style={{ marginBottom: 13 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 5,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13,
                            color: "var(--text)",
                            fontFamily: "Plus Jakarta Sans,sans-serif",
                          }}
                        >
                          {w.l}
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            color: "var(--textSub)",
                            fontFamily: "JetBrains Mono,monospace",
                          }}
                        >
                          {fmtC(w.v, currency)} · {pct}%
                        </span>
                      </div>
                      <div
                        style={{
                          height: 6,
                          background: "var(--card)",
                          borderRadius: 3,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: pct + "%",
                            background: w.c,
                            borderRadius: 3,
                            transition: "width .6s ease",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
                <div style={{ marginTop: 16 }}>
                  <Btn variant="outline" onClick={() => setModal("wallet")}>
                    ✏️ Update Balances
                  </Btn>
                </div>
              </Card>
              <Card className="fu2">
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--text)",
                    marginBottom: 16,
                  }}
                >
                  Cash Flow
                </div>
                {[
                  { l: "💰 Wallet Total", v: wTotal, c: "var(--text)" },
                  { l: "⬆ Income", v: totInc, c: "var(--income)" },
                  { l: "⬇ Expenses", v: totExp, c: "var(--expense)" },
                  {
                    l: "📊 Net Flow",
                    v: bal,
                    c: bal >= 0 ? "var(--income)" : "var(--expense)",
                  },
                ].map((r) => (
                  <div
                    key={r.l}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "9px 0",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        color: "var(--text)",
                        fontFamily: "Plus Jakarta Sans,sans-serif",
                      }}
                    >
                      {r.l}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: r.c,
                        fontFamily: "JetBrains Mono,monospace",
                      }}
                    >
                      {fmtC(r.v, currency)}
                    </span>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        )}

        {/* ═══ TRANSACTIONS ═══ */}
        {view === "txns" && (
          <div>
            <div
              className="fu"
              style={{
                display: "flex",
                gap: 10,
                marginBottom: 14,
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: 160 }}>
                <Field
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="🔍 Search transactions..."
                />
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {["all", "income", "expense"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFtype(f)}
                    style={{
                      padding: "9px 13px",
                      borderRadius: 9,
                      border: "1px solid",
                      cursor: "pointer",
                      fontFamily: "Plus Jakarta Sans,sans-serif",
                      fontSize: 12,
                      fontWeight: 600,
                      transition: "all .2s",
                      textTransform: "capitalize",
                      borderColor:
                        ftype === f ? "var(--accent)" : "var(--border)",
                      background:
                        ftype === f ? "var(--accentBg)" : "transparent",
                      color: ftype === f ? "var(--accent)" : "var(--textSub)",
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <Card className="fu1">
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--textMuted)",
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  marginBottom: 10,
                  fontFamily: "Plus Jakarta Sans,sans-serif",
                }}
              >
                {filtered.length} transactions
              </div>
              {filtered.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: 36,
                    color: "var(--textMuted)",
                    fontFamily: "Plus Jakarta Sans,sans-serif",
                  }}
                >
                  No transactions found
                </div>
              ) : (
                filtered.map((t) => (
                  <TxnRow
                    key={t.id}
                    t={t}
                    cats={cats}
                    currency={currency}
                    onDelete={delTxn}
                  />
                ))
              )}
            </Card>
          </div>
        )}

        {/* ═══ RECURRING ═══ */}
        {view === "recurring" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))",
              gap: 12,
            }}
            className="fu"
          >
            {recurring.map((r) => {
              const cat = cats.find((c) => c.id === r.catId) || {
                emoji: "📦",
                name: "Other",
              };
              return (
                <Card key={r.id}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 9,
                        background: "var(--expenseBg)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                      }}
                    >
                      {cat.emoji}
                    </div>
                    <button
                      onClick={() =>
                        setRecurring((p) => p.filter((x) => x.id !== r.id))
                      }
                      className="ib"
                      style={{ color: "var(--textMuted)", fontSize: 12 }}
                    >
                      ✕
                    </button>
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--text)",
                      fontFamily: "Plus Jakarta Sans,sans-serif",
                    }}
                  >
                    {r.note || cat.name}
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "var(--expense)",
                      fontFamily: "JetBrains Mono,monospace",
                      margin: "6px 0",
                    }}
                  >
                    {fmtC(r.amount, r.currency)}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <Tag color="var(--accent)">{r.frequency}</Tag>
                    <Tag color="var(--textSub)">Next: {r.nextDate}</Tag>
                  </div>
                </Card>
              );
            })}
            <button
              onClick={() => setModal("recur")}
              style={{
                border: "2px dashed var(--border)",
                borderRadius: 16,
                padding: 20,
                cursor: "pointer",
                background: "transparent",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all .2s",
                minHeight: 120,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.background = "var(--accentBg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ fontSize: 24 }}>🔁</span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--textSub)",
                  fontFamily: "Plus Jakarta Sans,sans-serif",
                }}
              >
                Add Recurring
              </span>
            </button>
          </div>
        )}

        {/* ═══ BILLS ═══ */}
        {view === "bills" && (
          <div>
            {overdueBills.length > 0 && (
              <div
                style={{
                  background: "var(--expenseBg)",
                  border: "1px solid var(--expense)",
                  borderRadius: 12,
                  padding: "11px 15px",
                  marginBottom: 12,
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                }}
                className="fu"
              >
                <span style={{ fontSize: 18 }}>🚨</span>
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--expense)",
                      fontFamily: "Plus Jakarta Sans,sans-serif",
                    }}
                  >
                    {overdueBills.length} Overdue Bill
                    {overdueBills.length > 1 ? "s" : ""}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--textSub)",
                      fontFamily: "Plus Jakarta Sans,sans-serif",
                    }}
                  >
                    {overdueBills.map((b) => b.note).join(", ")}
                  </div>
                </div>
              </div>
            )}
            <div
              style={{ display: "flex", flexDirection: "column", gap: 10 }}
              className="fu1"
            >
              {bills.map((b) => {
                const cat = cats.find((c) => c.id === b.catId) || {
                  emoji: "📦",
                  name: "Other",
                };
                const d = daysUntil(b.dueDate);
                const urgent = !b.paid && d <= 3;
                return (
                  <div
                    key={b.id}
                    style={{
                      background: "var(--panel)",
                      border:
                        "1px solid " +
                        (urgent ? "var(--expense)" : "var(--border)"),
                      borderRadius: 14,
                      padding: "14px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 9,
                        background: b.paid
                          ? "var(--incomeBg)"
                          : "var(--expenseBg)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                      }}
                    >
                      {b.paid ? "✅" : cat.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "var(--text)",
                          fontFamily: "Plus Jakarta Sans,sans-serif",
                        }}
                      >
                        {b.note}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          marginTop: 3,
                          flexWrap: "wrap",
                        }}
                      >
                        <Tag
                          color={
                            b.paid
                              ? "var(--income)"
                              : urgent
                                ? "var(--expense)"
                                : "var(--textSub)"
                          }
                        >
                          {b.paid
                            ? "Paid"
                            : d < 0
                              ? Math.abs(d) + "d overdue"
                              : d === 0
                                ? "Due today"
                                : "Due in " + d + "d"}
                        </Tag>
                        <span
                          style={{
                            fontSize: 10,
                            color: "var(--textMuted)",
                            fontFamily: "JetBrains Mono,monospace",
                          }}
                        >
                          {b.dueDate}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "var(--expense)",
                          fontFamily: "JetBrains Mono,monospace",
                          marginBottom: 6,
                        }}
                      >
                        {fmtC(b.amount, b.currency)}
                      </div>
                      <Btn
                        size="sm"
                        variant={b.paid ? "outline" : "success"}
                        onClick={() =>
                          setBills((p) =>
                            p.map((x) =>
                              x.id === b.id ? { ...x, paid: !x.paid } : x,
                            ),
                          )
                        }
                      >
                        {b.paid ? "Unpay" : "Mark Paid"}
                      </Btn>
                    </div>
                    <button
                      onClick={() =>
                        setBills((p) => p.filter((x) => x.id !== b.id))
                      }
                      className="ib"
                      style={{ color: "var(--textMuted)", fontSize: 12 }}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
              <button
                onClick={() => setModal("bill")}
                style={{
                  border: "2px dashed var(--border)",
                  borderRadius: 14,
                  padding: 18,
                  cursor: "pointer",
                  background: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all .2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.background = "var(--accentBg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <span style={{ fontSize: 20 }}>📅</span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--textSub)",
                    fontFamily: "Plus Jakarta Sans,sans-serif",
                  }}
                >
                  Add Bill Reminder
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ═══ GOALS ═══ */}
        {view === "goals" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
              gap: 12,
            }}
            className="fu"
          >
            {goals.map((g) => {
              const pct = Math.min(100, (g.saved / g.target) * 100);
              return (
                <Card key={g.id}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <span style={{ fontSize: 28 }}>{g.emoji}</span>
                    <button
                      onClick={() =>
                        setGoals((p) => p.filter((x) => x.id !== g.id))
                      }
                      className="ib"
                      style={{ color: "var(--textMuted)", fontSize: 12 }}
                    >
                      ✕
                    </button>
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "var(--text)",
                      marginTop: 8,
                      fontFamily: "Plus Jakarta Sans,sans-serif",
                    }}
                  >
                    {g.name}
                  </div>
                  {g.deadline && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--textMuted)",
                        marginTop: 2,
                        fontFamily: "Plus Jakarta Sans,sans-serif",
                      }}
                    >
                      🗓{" "}
                      {new Date(g.deadline).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  )}
                  <div
                    style={{
                      height: 7,
                      background: "var(--card)",
                      borderRadius: 4,
                      overflow: "hidden",
                      margin: "12px 0 7px",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: pct + "%",
                        background:
                          "linear-gradient(90deg,var(--gFrom),var(--gTo))",
                        borderRadius: 4,
                        transition: "width .8s ease",
                      }}
                    />
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--textSub)",
                        fontFamily: "Plus Jakarta Sans,sans-serif",
                      }}
                    >
                      {fmtC(g.saved, currency)} saved
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--accent)",
                        fontFamily: "JetBrains Mono,monospace",
                      }}
                    >
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--textMuted)",
                      marginTop: 2,
                      fontFamily: "Plus Jakarta Sans,sans-serif",
                    }}
                  >
                    {fmtC(g.target - g.saved, currency)} left of{" "}
                    {fmtC(g.target, currency)}
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <Field
                      value={String(g.saved)}
                      onChange={(e) =>
                        setGoals((p) =>
                          p.map((x) =>
                            x.id === g.id
                              ? { ...x, saved: +e.target.value || 0 }
                              : x,
                          ),
                        )
                      }
                      placeholder="Update saved"
                      prefix="$"
                    />
                  </div>
                </Card>
              );
            })}
            <button
              onClick={() => setModal("goal")}
              style={{
                border: "2px dashed var(--border)",
                borderRadius: 16,
                padding: 20,
                cursor: "pointer",
                background: "transparent",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all .2s",
                minHeight: 140,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.background = "var(--accentBg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ fontSize: 24 }}>🎯</span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--textSub)",
                  fontFamily: "Plus Jakarta Sans,sans-serif",
                }}
              >
                New Goal
              </span>
            </button>
          </div>
        )}

        {/* ═══ ANALYTICS ═══ */}
        {view === "analytics" && (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
                gap: 14,
                marginBottom: 14,
              }}
            >
              <Card className="fu">
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--text)",
                    marginBottom: 14,
                  }}
                >
                  Monthly Overview
                </div>
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={MONTHLY} barGap={3}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                    />
                    <XAxis
                      dataKey="m"
                      tick={{
                        fill: "var(--textMuted)",
                        fontSize: 10,
                        fontFamily: "JetBrains Mono",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{
                        fill: "var(--textMuted)",
                        fontSize: 10,
                        fontFamily: "JetBrains Mono",
                      }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => fmtK(v, cur.sym)}
                    />
                    <Tooltip
                      contentStyle={ttStyle}
                      formatter={(v) => [fmtC(v, currency)]}
                    />
                    <Bar
                      dataKey="inc"
                      fill="#34d399"
                      radius={[4, 4, 0, 0]}
                      name="Income"
                    />
                    <Bar
                      dataKey="exp"
                      fill="#f87171"
                      radius={[4, 4, 0, 0]}
                      name="Expenses"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
              <Card className="fu1">
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--text)",
                    marginBottom: 14,
                  }}
                >
                  Spending Breakdown
                </div>
                {catExp.slice(0, 7).map((e) => {
                  const c = cats.find((x) => x.id === e.catId);
                  const pct = totExp
                    ? ((e.value / totExp) * 100).toFixed(1)
                    : 0;
                  return (
                    <div key={e.catId} style={{ marginBottom: 10 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            color: "var(--text)",
                            fontFamily: "Plus Jakarta Sans,sans-serif",
                          }}
                        >
                          {c ? c.emoji : "📦"} {c ? c.name : "Other"}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--textSub)",
                            fontFamily: "JetBrains Mono,monospace",
                          }}
                        >
                          {fmtC(e.value, currency)} · {pct}%
                        </span>
                      </div>
                      <div
                        style={{
                          height: 5,
                          background: "var(--card)",
                          borderRadius: 3,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: pct + "%",
                            background: c ? c.color : "#6b7280",
                            borderRadius: 3,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </Card>
            </div>

            <Card style={{ marginBottom: 14 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--text)",
                  marginBottom: 14,
                }}
              >
                Budget Progress
              </div>
              {budgets.length === 0 ? (
                <div
                  style={{
                    color: "var(--textMuted)",
                    fontSize: 13,
                    fontFamily: "Plus Jakarta Sans,sans-serif",
                  }}
                >
                  No budgets set — click "Budgets" in the sidebar.
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
                    gap: 11,
                  }}
                >
                  {budgets.map((b) => {
                    const cat = cats.find((c) => c.id === b.catId);
                    const spent = txns
                      .filter(
                        (t) => t.type === "expense" && t.catId === b.catId,
                      )
                      .reduce((s, t) => s + t.amount, 0);
                    const pct = b.limit
                      ? Math.min(100, (spent / b.limit) * 100)
                      : 0;
                    const over = pct > 100;
                    const warn = pct > 80;
                    return (
                      <div
                        key={b.id}
                        style={{
                          background: "var(--card)",
                          borderRadius: 11,
                          padding: 13,
                          border:
                            "1px solid " +
                            (over
                              ? "var(--expense)"
                              : warn
                                ? "var(--amber)"
                                : "var(--border)"),
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 6,
                          }}
                        >
                          <span style={{ fontSize: 16 }}>
                            {cat ? cat.emoji : "📦"}
                          </span>
                          <Tag
                            color={
                              over
                                ? "var(--expense)"
                                : warn
                                  ? "var(--amber)"
                                  : "var(--textSub)"
                            }
                          >
                            {pct.toFixed(0)}%
                          </Tag>
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "var(--text)",
                            fontFamily: "Plus Jakarta Sans,sans-serif",
                            marginBottom: 6,
                          }}
                        >
                          {cat ? cat.name : "Other"}
                        </div>
                        <div
                          style={{
                            height: 5,
                            background: "var(--border)",
                            borderRadius: 3,
                            overflow: "hidden",
                            marginBottom: 5,
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: pct + "%",
                              background: over
                                ? "var(--expense)"
                                : warn
                                  ? "var(--amber)"
                                  : cat
                                    ? cat.color
                                    : "var(--accent)",
                              borderRadius: 3,
                              transition: "width .6s",
                            }}
                          />
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: "var(--textMuted)",
                            fontFamily: "JetBrains Mono,monospace",
                          }}
                        >
                          {fmtC(spent, currency)} / {fmtC(b.limit, currency)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--text)",
                  marginBottom: 14,
                }}
              >
                Income Sources
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))",
                  gap: 10,
                }}
              >
                {Object.entries(
                  txns
                    .filter((t) => t.type === "income")
                    .reduce((m, t) => {
                      m[t.catId] = (m[t.catId] || 0) + t.amount;
                      return m;
                    }, {}),
                ).map(([catId, amt]) => {
                  const c = cats.find((x) => x.id === catId);
                  return (
                    <div
                      key={catId}
                      style={{
                        background: "var(--card)",
                        borderRadius: 11,
                        padding: "12px 14px",
                        borderLeft:
                          "3px solid " + (c ? c.color : "var(--accent)"),
                      }}
                    >
                      <div style={{ fontSize: 18, marginBottom: 5 }}>
                        {c ? c.emoji : "💰"}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--textMuted)",
                          fontFamily: "Plus Jakarta Sans,sans-serif",
                        }}
                      >
                        {c ? c.name : "Income"}
                      </div>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          fontFamily: "JetBrains Mono,monospace",
                          color: "var(--text)",
                          marginTop: 3,
                        }}
                      >
                        {fmtC(amt, currency)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* ── MODALS ── */}
      {modal === "txn" && (
        <AddTxnModal
          onClose={() => setModal(null)}
          onAdd={(t) => setTxns((p) => [t, ...p])}
          cats={cats}
          currency={currency}
        />
      )}
      {modal === "cats" && (
        <CatsModal
          onClose={() => setModal(null)}
          cats={cats}
          onSave={(c) => {
            setCats(c);
            setModal(null);
          }}
        />
      )}
      {modal === "wallet" && (
        <WalletModal
          onClose={() => setModal(null)}
          wallet={wallet}
          onSave={(w) => {
            setWallet(w);
            setModal(null);
          }}
        />
      )}
      {modal === "goal" && (
        <GoalModal
          onClose={() => setModal(null)}
          onAdd={(g) => setGoals((p) => [...p, g])}
        />
      )}
      {modal === "recur" && (
        <RecurModal
          onClose={() => setModal(null)}
          onAdd={(r) => setRecurring((p) => [...p, r])}
          cats={cats}
          currency={currency}
        />
      )}
      {modal === "bill" && (
        <BillModal
          onClose={() => setModal(null)}
          onAdd={(b) => setBills((p) => [...p, b])}
          cats={cats}
          currency={currency}
        />
      )}
      {modal === "budget" && (
        <BudgetModal
          onClose={() => setModal(null)}
          cats={cats}
          budgets={budgets}
          onSave={(b) => {
            setBudgets(b);
            setModal(null);
          }}
        />
      )}
    </div>
  );
}
