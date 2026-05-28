import { forwardRef } from "react";
import { DocTheme } from "@/lib/doc-themes";

export type DocBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "signature"; name: string; role?: string };

export interface BrandInfo {
  company_name?: string | null;
  logo_url?: string | null;
  display_name?: string | null;
}

interface Props {
  title: string;
  blocks: DocBlock[];
  theme: DocTheme;
  brand: BrandInfo;
  /** Render in static/print mode (no inputs, no interactions) */
  staticMode?: boolean;
  onUpdateBlock?: (i: number, patch: Partial<DocBlock>) => void;
  onTitleChange?: (v: string) => void;
}

/**
 * A4-proportion document paper. 794 × 1123 px ≈ A4 @ 96dpi.
 * Used for both on-screen editing and offscreen PDF capture.
 */
export const DocumentPaper = forwardRef<HTMLDivElement, Props>(function DocumentPaper(
  { title, blocks, theme, brand, staticMode, onUpdateBlock, onTitleChange },
  ref
) {
  const editable = !staticMode;

  return (
    <div
      ref={ref}
      data-doc-paper
      style={{
        width: 794,
        minHeight: 1123,
        background: theme.pageBg,
        color: theme.pageColor,
        fontFamily: theme.fontFamily,
        position: "relative",
        overflow: "hidden",
        boxShadow: staticMode ? "none" : "0 30px 80px -20px rgba(0,0,0,0.6), 0 8px 24px -8px rgba(0,0,0,0.4)",
        borderRadius: staticMode ? 0 : 4,
        margin: "0 auto",
      }}
    >
      <Decorations theme={theme} />
      <Header theme={theme} brand={brand} />

      <div style={{ padding: "56px 72px 72px", position: "relative", zIndex: 2 }}>
        {/* Title */}
        <div style={{ marginBottom: 32 }}>
          {editable ? (
            <input
              value={title}
              onChange={(e) => onTitleChange?.(e.target.value)}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                fontFamily: theme.headingFamily,
                fontSize: 34,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: theme.pageColor,
              }}
            />
          ) : (
            <h1
              style={{
                fontFamily: theme.headingFamily,
                fontSize: 34,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              {title}
            </h1>
          )}
          <div
            style={{
              marginTop: 14,
              width: 56,
              height: 3,
              background: theme.accent,
              borderRadius: 2,
            }}
          />
        </div>

        {/* Blocks */}
        {blocks.map((b, i) => (
          <BlockView
            key={i}
            block={b}
            index={i}
            theme={theme}
            editable={editable}
            onUpdate={onUpdateBlock}
          />
        ))}
      </div>

      <Footer theme={theme} brand={brand} />
    </div>
  );
});

function BlockView({
  block,
  index,
  theme,
  editable,
  onUpdate,
}: {
  block: DocBlock;
  index: number;
  theme: DocTheme;
  editable: boolean;
  onUpdate?: (i: number, patch: Partial<DocBlock>) => void;
}) {
  const textStyle: React.CSSProperties = {
    fontSize: 14.5,
    lineHeight: 1.75,
    color: theme.pageColor,
    fontFamily: theme.fontFamily,
  };

  if (block.type === "heading") {
    const style: React.CSSProperties = {
      fontFamily: theme.headingFamily,
      fontSize: 20,
      fontWeight: 600,
      letterSpacing: "-0.01em",
      marginTop: 28,
      marginBottom: 10,
      color: theme.pageColor,
      paddingBottom: 6,
      borderBottom: `1px solid ${theme.accent}22`,
    };
    return editable ? (
      <input
        value={block.text}
        onChange={(e) => onUpdate?.(index, { text: e.target.value } as Partial<DocBlock>)}
        style={{ ...style, width: "100%", background: "transparent", border: "none", outline: "none" }}
      />
    ) : (
      <h2 style={style}>{block.text}</h2>
    );
  }

  if (block.type === "paragraph") {
    const style: React.CSSProperties = { ...textStyle, marginBottom: 14, whiteSpace: "pre-wrap" };
    return editable ? (
      <textarea
        value={block.text}
        onChange={(e) => onUpdate?.(index, { text: e.target.value } as Partial<DocBlock>)}
        rows={Math.max(2, block.text.split("\n").length)}
        style={{
          ...style,
          width: "100%",
          background: "transparent",
          border: "none",
          outline: "none",
          resize: "none",
        }}
      />
    ) : (
      <p style={style}>{block.text}</p>
    );
  }

  if (block.type === "list") {
    return (
      <ul style={{ ...textStyle, paddingLeft: 0, listStyle: "none", margin: "8px 0 18px" }}>
        {block.items.map((it, j) => (
          <li
            key={j}
            style={{
              position: "relative",
              paddingLeft: 22,
              marginBottom: 8,
            }}
          >
            <span
              style={{
                position: "absolute",
                left: 0,
                top: 10,
                width: 8,
                height: 8,
                background: theme.accent,
                borderRadius: 2,
              }}
            />
            {editable ? (
              <input
                value={it}
                onChange={(e) => {
                  const items = [...block.items];
                  items[j] = e.target.value;
                  onUpdate?.(index, { items } as Partial<DocBlock>);
                }}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  ...textStyle,
                }}
              />
            ) : (
              <span>{it}</span>
            )}
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === "signature") {
    return (
      <div
        style={{
          marginTop: 56,
          paddingTop: 24,
          borderTop: `1px solid ${theme.accent}33`,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.55 }}>
          Authorized signatory
        </div>
        {editable ? (
          <>
            <input
              value={block.name}
              onChange={(e) => onUpdate?.(index, { name: e.target.value } as Partial<DocBlock>)}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                fontFamily: theme.headingFamily,
                fontSize: 16,
                fontWeight: 600,
                color: theme.pageColor,
                marginTop: 6,
              }}
            />
            <input
              value={block.role ?? ""}
              onChange={(e) => onUpdate?.(index, { role: e.target.value } as Partial<DocBlock>)}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: 12.5,
                opacity: 0.7,
                color: theme.pageColor,
              }}
            />
          </>
        ) : (
          <>
            <div style={{ fontFamily: theme.headingFamily, fontSize: 16, fontWeight: 600, marginTop: 6 }}>
              {block.name}
            </div>
            <div style={{ fontSize: 12.5, opacity: 0.7 }}>{block.role}</div>
          </>
        )}
      </div>
    );
  }

  return null;
}

function Header({ theme, brand }: { theme: DocTheme; brand: BrandInfo }) {
  const company = brand.company_name || brand.display_name || "Your Company";

  const baseRow: React.CSSProperties = {
    padding: "28px 72px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    zIndex: 2,
  };

  const Logo = () =>
    brand.logo_url ? (
      <img src={brand.logo_url} alt="" crossOrigin="anonymous" style={{ height: 36, objectFit: "contain" }} />
    ) : (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: theme.accent,
            color: theme.pageBg,
            display: "grid",
            placeItems: "center",
            fontWeight: 700,
            fontSize: 14,
            fontFamily: theme.headingFamily,
          }}
        >
          {company.slice(0, 1).toUpperCase()}
        </div>
        <div style={{ fontFamily: theme.headingFamily, fontWeight: 600, fontSize: 14, letterSpacing: "-0.01em" }}>
          {company}
        </div>
      </div>
    );

  if (theme.headerStyle === "band") {
    return (
      <div style={{ background: theme.accent, padding: "20px 72px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 2 }}>
        <div style={{ fontFamily: theme.headingFamily, fontWeight: 600, fontSize: 15 }}>{company}</div>
        <div style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.85 }}>
          {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>
    );
  }

  if (theme.headerStyle === "side-strip") {
    return (
      <>
        <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 8, background: theme.accent, zIndex: 1 }} />
        <div style={baseRow}>
          <Logo />
          <div style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.55 }}>
            {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>
      </>
    );
  }

  if (theme.headerStyle === "gradient") {
    return (
      <div
        style={{
          padding: "30px 72px",
          background: `linear-gradient(120deg, ${theme.accent}, ${theme.accent}aa 50%, transparent)`,
          color: "#fff",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div style={{ fontFamily: theme.headingFamily, fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em" }}>{company}</div>
        <div style={{ marginTop: 4, fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.85 }}>
          Official Document
        </div>
      </div>
    );
  }

  if (theme.headerStyle === "geometric") {
    return (
      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: 180, height: 80, background: theme.accent, clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0% 100%)" }} />
        <div style={baseRow}>
          <Logo />
        </div>
      </div>
    );
  }

  if (theme.headerStyle === "monogram") {
    return (
      <div style={{ ...baseRow, borderBottom: `1px solid ${theme.accent}33` }}>
        <Logo />
        <div style={{ fontFamily: theme.headingFamily, fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: theme.accent }}>
          Confidential
        </div>
      </div>
    );
  }

  // minimal
  return (
    <div style={baseRow}>
      <Logo />
      <div style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.5 }}>
        {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
      </div>
    </div>
  );
}

function Footer({ theme, brand }: { theme: DocTheme; brand: BrandInfo }) {
  const company = brand.company_name || brand.display_name || "";
  return (
    <div
      style={{
        position: "absolute",
        left: 72,
        right: 72,
        bottom: 28,
        display: "flex",
        justifyContent: "space-between",
        fontSize: 10.5,
        opacity: 0.55,
        borderTop: `1px solid ${theme.accent}22`,
        paddingTop: 10,
        zIndex: 2,
      }}
    >
      <span>{company}</span>
    </div>
  );
}

function Decorations({ theme }: { theme: DocTheme }) {
  if (theme.decoration === "none" || !theme.decoration) return null;

  if (theme.decoration === "corner-arc") {
    return (
      <svg style={{ position: "absolute", bottom: -60, right: -60, width: 280, height: 280, zIndex: 1, opacity: 0.85 }} viewBox="0 0 200 200">
        <circle cx="200" cy="200" r="180" fill="none" stroke={theme.accent} strokeWidth="1" opacity="0.25" />
        <circle cx="200" cy="200" r="130" fill="none" stroke={theme.accent} strokeWidth="1" opacity="0.35" />
        <circle cx="200" cy="200" r="80" fill={theme.accent} opacity="0.08" />
      </svg>
    );
  }

  if (theme.decoration === "diagonal-slash") {
    return (
      <svg style={{ position: "absolute", top: 0, right: 0, width: 260, height: 1123, zIndex: 1, opacity: 0.18 }} viewBox="0 0 260 1123" preserveAspectRatio="none">
        <polygon points="200,0 260,0 100,1123 40,1123" fill={theme.accent} />
        <polygon points="240,0 260,0 130,1123 110,1123" fill={theme.accent} opacity="0.6" />
      </svg>
    );
  }

  if (theme.decoration === "dot-grid") {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          opacity: 0.35,
          backgroundImage: `radial-gradient(${theme.accent}33 1px, transparent 1px)`,
          backgroundSize: "18px 18px",
          pointerEvents: "none",
        }}
      />
    );
  }

  if (theme.decoration === "blueprint") {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          opacity: 0.18,
          backgroundImage: `
            linear-gradient(${theme.accent}66 1px, transparent 1px),
            linear-gradient(90deg, ${theme.accent}66 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        }}
      />
    );
  }

  if (theme.decoration === "glass") {
    return (
      <>
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -80,
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${theme.accent}33, transparent 70%)`,
            zIndex: 1,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -120,
            left: -100,
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${theme.accent}22, transparent 70%)`,
            zIndex: 1,
            pointerEvents: "none",
          }}
        />
      </>
    );
  }

  return null;
}
