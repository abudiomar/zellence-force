export const UI_DENSITIES = ["comfortable", "compact"] as const;
export type UiDensity = (typeof UI_DENSITIES)[number];

export const UI_STATUS_TONES = [
  "neutral",
  "info",
  "success",
  "warning",
  "danger",
  "review",
  "locked"
] as const;
export type StatusTone = (typeof UI_STATUS_TONES)[number];

export const UI_TOKENS = {
  color: {
    background: "#f7f9fb",
    surface: "#ffffff",
    surfaceMuted: "#eef3f5",
    text: "#18212f",
    textMuted: "#64748b",
    border: "#d9e1e7",
    primary: "#147c75",
    primaryText: "#ffffff",
    info: "#2563eb",
    success: "#16803c",
    warning: "#b7791b",
    danger: "#b42318",
    review: "#7c3aed",
    locked: "#6b7280",
    focus: "#0ea5a3"
  },
  radius: {
    sm: "6px",
    md: "8px"
  },
  spacing: {
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    8: "32px"
  },
  typography: {
    body: "15px",
    small: "13px",
    title: "22px",
    line: "1.5"
  },
  size: {
    controlComfortable: "40px",
    controlCompact: "34px",
    touch: "48px",
    sidebar: "272px",
    topbar: "64px",
    rowComfortable: "48px",
    rowCompact: "40px"
  }
} as const;
