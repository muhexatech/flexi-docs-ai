export interface DocTheme {
  id: string;
  name: string;
  description: string;
  // Page
  pageBg: string;
  pageColor: string;
  fontFamily: string;
  headingFamily: string;
  // Brand accents
  accent: string;
  accentSoft: string;
  // Header style
  headerStyle: "band" | "side-strip" | "minimal" | "gradient" | "geometric" | "monogram";
  // Decorative
  decoration?: "corner-arc" | "diagonal-slash" | "dot-grid" | "blueprint" | "glass" | "none";
}

export const DOC_THEMES: DocTheme[] = [
  {
    id: "corporate-blue",
    name: "Corporate Blue",
    description: "Trusted enterprise standard",
    pageBg: "#ffffff",
    pageColor: "#0f172a",
    fontFamily: "'Inter', system-ui, sans-serif",
    headingFamily: "'Inter', system-ui, sans-serif",
    accent: "#1d4ed8",
    accentSoft: "#dbeafe",
    headerStyle: "band",
    decoration: "diagonal-slash",
  },
  {
    id: "minimal-white",
    name: "Minimal White",
    description: "Editorial clarity, Swiss",
    pageBg: "#ffffff",
    pageColor: "#111111",
    fontFamily: "'Inter', system-ui, sans-serif",
    headingFamily: "'Instrument Serif', Georgia, serif",
    accent: "#111111",
    accentSoft: "#f4f4f5",
    headerStyle: "minimal",
    decoration: "none",
  },
  {
    id: "executive-dark",
    name: "Executive Dark",
    description: "Premium dark stationery",
    pageBg: "#0b0b10",
    pageColor: "#e5e7eb",
    fontFamily: "'Inter', system-ui, sans-serif",
    headingFamily: "'Inter', system-ui, sans-serif",
    accent: "#d4af37",
    accentSoft: "rgba(212,175,55,0.12)",
    headerStyle: "monogram",
    decoration: "corner-arc",
  },
  {
    id: "modern-gradient",
    name: "Modern Gradient",
    description: "Vibrant SaaS energy",
    pageBg: "#ffffff",
    pageColor: "#1a1033",
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    headingFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    accent: "#7c3aed",
    accentSoft: "#ede9fe",
    headerStyle: "gradient",
    decoration: "corner-arc",
  },
  {
    id: "hr-professional",
    name: "HR Professional",
    description: "Warm, human, formal",
    pageBg: "#fbfaf7",
    pageColor: "#1f2937",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    headingFamily: "'DM Sans', system-ui, sans-serif",
    accent: "#0d7a5f",
    accentSoft: "#d1fae5",
    headerStyle: "side-strip",
    decoration: "none",
  },
  {
    id: "startup-modern",
    name: "Startup Modern",
    description: "Bold, geometric, fresh",
    pageBg: "#ffffff",
    pageColor: "#0f0f0f",
    fontFamily: "'Manrope', system-ui, sans-serif",
    headingFamily: "'Manrope', system-ui, sans-serif",
    accent: "#ff5722",
    accentSoft: "#ffe4d6",
    headerStyle: "geometric",
    decoration: "dot-grid",
  },
  {
    id: "legal-professional",
    name: "Legal Professional",
    description: "Serif authority, classic",
    pageBg: "#fdfcf7",
    pageColor: "#1c1917",
    fontFamily: "'Source Serif 4', Georgia, serif",
    headingFamily: "'Source Serif 4', Georgia, serif",
    accent: "#7c2d12",
    accentSoft: "#fef3c7",
    headerStyle: "minimal",
    decoration: "none",
  },
  {
    id: "ai-futuristic",
    name: "AI Futuristic",
    description: "Glass, gradients, neon",
    pageBg: "#0a0a1a",
    pageColor: "#e0e7ff",
    fontFamily: "'Manrope', system-ui, sans-serif",
    headingFamily: "'Manrope', system-ui, sans-serif",
    accent: "#22d3ee",
    accentSoft: "rgba(34,211,238,0.14)",
    headerStyle: "gradient",
    decoration: "blueprint",
  },
  {
    id: "elegant-business",
    name: "Elegant Business",
    description: "Refined, calm, prestigious",
    pageBg: "#ffffff",
    pageColor: "#1a1a1a",
    fontFamily: "'Inter', system-ui, sans-serif",
    headingFamily: "'Instrument Serif', Georgia, serif",
    accent: "#0f172a",
    accentSoft: "#e2e8f0",
    headerStyle: "band",
    decoration: "diagonal-slash",
  },
  {
    id: "premium-glass",
    name: "Premium Glass",
    description: "Subtle texture, soft depth",
    pageBg: "#f7f8fb",
    pageColor: "#0f172a",
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    headingFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    accent: "#2563eb",
    accentSoft: "rgba(37,99,235,0.10)",
    headerStyle: "side-strip",
    decoration: "glass",
  },
];

export const DOC_THEME_MAP: Record<string, DocTheme> = Object.fromEntries(
  DOC_THEMES.map((t) => [t.id, t])
);

export const DEFAULT_THEME_ID = "corporate-blue";

export function getTheme(id?: string | null): DocTheme {
  return DOC_THEME_MAP[id ?? ""] ?? DOC_THEME_MAP[DEFAULT_THEME_ID];
}
