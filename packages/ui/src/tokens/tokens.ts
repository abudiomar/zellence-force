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
    background: "#f6f7f8",
    surface: "#ffffff",
    surfaceMuted: "#edf2f4",
    text: "#172026",
    textMuted: "#5b6570",
    border: "#d6dde2",
    primary: "#0f766e",
    primaryText: "#ffffff",
    info: "#2563eb",
    success: "#16803c",
    warning: "#b7791f",
    danger: "#b42318",
    review: "#7c3aed",
    locked: "#6b7280",
    focus: "#0ea5a3"
  },
  radius: {
    sm: "4px",
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
    body: "16px",
    small: "14px",
    title: "24px",
    line: "1.5"
  },
  size: {
    controlComfortable: "44px",
    controlCompact: "36px",
    touch: "48px",
    sidebar: "280px",
    topbar: "64px",
    rowComfortable: "52px",
    rowCompact: "42px"
  }
} as const;
