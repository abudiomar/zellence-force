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
    background: "#faf8f4",
    surface: "#ffffff",
    surfaceMuted: "#f0ebe1",
    text: "#1f1b15",
    textMuted: "#7a7064",
    border: "#e4ddcf",
    primary: "#cda028",
    primaryText: "#ffffff",
    info: "#2f74b5",
    success: "#2f7d4f",
    warning: "#d99a2b",
    danger: "#d64545",
    review: "#7c5cd6",
    locked: "#8a8278",
    focus: "#cda028"
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
