// Theme palettes for SEAIPC OJS — applied as CSS variables at runtime.
// Each palette defines the primary accent color, its hover, and an optional soft tint.

export const PALETTES = [
  {
    key: "blue-classic",
    name: "Classic Blue (IKB)",
    description: "The default authoritative academic blue.",
    primary: "#002FA7",
    hover: "#1e3a8a",
    soft: "#e0e7ff",
    onPrimary: "#ffffff",
  },
  {
    key: "emerald",
    name: "Emerald",
    description: "Fresh, optimistic green — modern and trustworthy.",
    primary: "#047857",
    hover: "#065f46",
    soft: "#d1fae5",
    onPrimary: "#ffffff",
  },
  {
    key: "slate",
    name: "Slate Monochrome",
    description: "Quiet editorial grey for a minimalist, Swiss feel.",
    primary: "#334155",
    hover: "#1e293b",
    soft: "#e2e8f0",
    onPrimary: "#ffffff",
  },
  {
    key: "royal-purple",
    name: "Royal Purple",
    description: "Confident, regal — great for prestige conferences.",
    primary: "#5b21b6",
    hover: "#4c1d95",
    soft: "#ede9fe",
    onPrimary: "#ffffff",
  },
  {
    key: "amber",
    name: "Amber Academic",
    description: "Warm scholarly amber — evokes old paper and wisdom.",
    primary: "#B45309",
    hover: "#92400e",
    soft: "#fef3c7",
    onPrimary: "#ffffff",
  },
  {
    key: "teal",
    name: "Teal",
    description: "Calm and balanced — between green and blue.",
    primary: "#0F766E",
    hover: "#115e59",
    soft: "#ccfbf1",
    onPrimary: "#ffffff",
  },
  {
    key: "rose",
    name: "Rose",
    description: "Bold and warm — a distinctive editorial signature.",
    primary: "#BE123C",
    hover: "#9f1239",
    soft: "#ffe4e6",
    onPrimary: "#ffffff",
  },
  {
    key: "indigo",
    name: "Indigo Scholar",
    description: "Deep indigo — intellectual and approachable.",
    primary: "#4338CA",
    hover: "#3730a3",
    soft: "#e0e7ff",
    onPrimary: "#ffffff",
  },
];

export function applyPalette(key) {
  const p = PALETTES.find((x) => x.key === key) || PALETTES[0];
  const r = document.documentElement;
  r.style.setProperty("--brand", p.primary);
  r.style.setProperty("--brand-hover", p.hover);
  r.style.setProperty("--brand-soft", p.soft);
  r.style.setProperty("--brand-on", p.onPrimary);
  r.setAttribute("data-palette", p.key);
}

export function getPalette(key) {
  return PALETTES.find((x) => x.key === key) || PALETTES[0];
}
