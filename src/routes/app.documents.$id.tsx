import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Sparkles, Download, Trash2, Plus, Palette, Check, Type, AlignLeft, List, PenLine } from "lucide-react";
import { DocumentPaper, type DocBlock, type BrandInfo } from "@/components/document-paper";
import { DOC_THEMES, getTheme, DEFAULT_THEME_ID } from "@/lib/doc-themes";
import { exportNodeToPdf } from "@/lib/pdf-export";

export const Route = createFileRoute("/app/documents/$id")({ component: EditorPage });

function EditorPage() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState("general");
  const [blocks, setBlocks] = useState<DocBlock[]>([]);
  const [themeId, setThemeId] = useState<string>(DEFAULT_THEME_ID);
  const [brand, setBrand] = useState<BrandInfo>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const theme = useMemo(() => getTheme(themeId), [themeId]);

  // Load doc + brand kit
  useEffect(() => {
    void (async () => {
      const { data: doc, error } = await supabase.from("documents").select("*").eq("id", id).maybeSingle();
      if (error || !doc) { toast.error("Document not found"); nav({ to: "/app" }); return; }
      const d = doc as any;
      setTitle(d.title);
      setDocType(d.doc_type);
      setBlocks(((d.content?.blocks ?? []) as DocBlock[]));
      setThemeId(d.content?.theme ?? DEFAULT_THEME_ID);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: prof } = await supabase.from("profiles").select("display_name, company_name, logo_url").eq("id", user.id).maybeSingle();
        if (prof) setBrand(prof as BrandInfo);
      }
      setLoading(false);
    })();
  }, [id, nav]);

  // Autosave
  useEffect(() => {
    if (loading) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      await supabase.from("documents").update({ title, content: { blocks, theme: themeId } }).eq("id", id);
      setSaving(false);
    }, 700);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [title, blocks, themeId, id, loading]);

  function updateBlock(i: number, patch: Partial<DocBlock>) {
    setBlocks((bs) => bs.map((b, idx) => (idx === i ? ({ ...b, ...patch } as DocBlock) : b)));
  }
  function removeBlock(i: number) { setBlocks((bs) => bs.filter((_, idx) => idx !== i)); }
  function addBlock(type: DocBlock["type"]) {
    const tpl: Record<DocBlock["type"], DocBlock> = {
      heading: { type: "heading", text: "New section" },
      paragraph: { type: "paragraph", text: "" },
      list: { type: "list", items: ["Item 1", "Item 2"] },
      signature: { type: "signature", name: "Your name", role: "Your role" },
    };
    setBlocks((bs) => [...bs, tpl[type]]);
  }

  async function aiRewrite() {
    if (!aiPrompt.trim()) return;
    setAiBusy(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt, docType, company: brand.company_name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.title) setTitle(data.title);
      if (Array.isArray(data.blocks)) setBlocks(data.blocks);
      setAiPrompt("");
      toast.success("Updated by AI");
    } catch (e: any) { toast.error(e.message); }
    finally { setAiBusy(false); }
  }

  async function onDelete() {
    if (!confirm("Delete this document?")) return;
    await supabase.from("documents").delete().eq("id", id);
    nav({ to: "/app" });
  }

  async function onExport() {
    if (!exportRef.current) return;
    setExporting(true);
    try {
      // Allow the offscreen node to mount + fonts to settle
      await new Promise((r) => setTimeout(r, 120));
      if ((document as any).fonts?.ready) await (document as any).fonts.ready;
      await exportNodeToPdf(exportRef.current, title || "document");
      toast.success("PDF downloaded");
    } catch (e: any) {
      toast.error(e?.message ?? "Export failed");
    } finally {
      setExporting(false);
    }
  }

  if (loading) return <div className="min-h-screen grid place-items-center text-zinc-500 text-sm">Loading…</div>;

  return (
    <div className="flex h-screen bg-[#070708]">
      {/* Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-zinc-900 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/app" className="text-zinc-500 hover:text-zinc-200"><ArrowLeft className="size-4" /></Link>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-transparent text-sm font-medium text-zinc-100 outline-none min-w-0 truncate" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">{saving ? "Saving…" : "Saved"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setThemePickerOpen((v) => !v)}
                className="text-xs text-zinc-300 ring-1 ring-zinc-800 hover:bg-zinc-900 rounded-lg px-3 py-1.5 inline-flex items-center gap-1.5"
              >
                <Palette className="size-3.5" /> {theme.name}
              </button>
              {themePickerOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 max-h-[70vh] overflow-y-auto bg-zinc-950 ring-1 ring-zinc-800 rounded-xl shadow-2xl p-2 z-50">
                  {DOC_THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { setThemeId(t.id); setThemePickerOpen(false); }}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-900 text-left"
                    >
                      <div
                        className="w-10 h-12 rounded-md ring-1 ring-zinc-800 shrink-0 relative overflow-hidden"
                        style={{ background: t.pageBg }}
                      >
                        <div className="absolute inset-x-0 top-0 h-3" style={{ background: t.accent }} />
                        <div className="absolute left-1.5 top-4 right-1.5 h-0.5 rounded" style={{ background: t.accent, opacity: 0.6 }} />
                        <div className="absolute left-1.5 top-6 right-3 h-0.5 rounded" style={{ background: t.pageColor, opacity: 0.3 }} />
                        <div className="absolute left-1.5 top-7.5 right-4 h-0.5 rounded" style={{ background: t.pageColor, opacity: 0.3 }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-zinc-100 flex items-center gap-1.5">
                          {t.name}
                          {themeId === t.id && <Check className="size-3 text-emerald-400" />}
                        </div>
                        <div className="text-[10px] text-zinc-500 truncate">{t.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={onExport}
              disabled={exporting}
              className="text-xs text-zinc-900 bg-zinc-100 hover:bg-white rounded-lg px-3 py-1.5 inline-flex items-center gap-1.5 disabled:opacity-60 font-medium"
            >
              <Download className="size-3.5" />{exporting ? "Exporting…" : "Download PDF"}
            </button>
            <button onClick={onDelete} className="text-xs text-zinc-500 hover:text-red-400 rounded-lg p-1.5"><Trash2 className="size-3.5" /></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="py-10 px-6">
            <DocumentPaper
              title={title}
              blocks={blocks}
              theme={theme}
              brand={brand}
              onTitleChange={setTitle}
              onUpdateBlock={updateBlock}
            />

            {/* Add block toolbar */}
            <div className="mx-auto mt-6 flex flex-wrap justify-center gap-2" style={{ width: 794 }}>
              {([
                { t: "heading", icon: Type, label: "Heading" },
                { t: "paragraph", icon: AlignLeft, label: "Paragraph" },
                { t: "list", icon: List, label: "List" },
                { t: "signature", icon: PenLine, label: "Signature" },
              ] as const).map(({ t, icon: Icon, label }) => (
                <button
                  key={t}
                  onClick={() => addBlock(t)}
                  className="text-xs text-zinc-400 ring-1 ring-zinc-800 hover:bg-zinc-900 hover:text-zinc-100 rounded-lg px-3 py-1.5 inline-flex items-center gap-1.5"
                >
                  <Icon className="size-3.5" />{label}
                </button>
              ))}
              {blocks.length > 0 && (
                <button
                  onClick={() => {
                    const idx = window.prompt(`Remove block # (1-${blocks.length})`);
                    const n = idx ? parseInt(idx, 10) - 1 : -1;
                    if (n >= 0 && n < blocks.length) removeBlock(n);
                  }}
                  className="text-xs text-zinc-500 ring-1 ring-zinc-800 hover:bg-zinc-900 hover:text-red-400 rounded-lg px-3 py-1.5 inline-flex items-center gap-1.5"
                >
                  <Trash2 className="size-3.5" /> Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI panel */}
      <aside className="w-80 border-l border-zinc-900 p-5 flex flex-col gap-4 shrink-0">
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-200"><Sparkles className="size-3.5 text-zinc-400" />AI Assistant</div>
        <div className="text-xs text-zinc-500 leading-relaxed">Describe a change and the engine will redraft the document.</div>
        <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} rows={5} placeholder="Make it more formal, add an indemnity clause, shorten by 30%..." className="bg-zinc-900/60 ring-1 ring-zinc-800 rounded-xl p-3 text-sm text-zinc-100 outline-none focus:ring-zinc-600 transition resize-none" />
        <button onClick={aiRewrite} disabled={aiBusy} className="bg-zinc-100 text-neutral-900 rounded-xl py-2 text-sm font-medium hover:bg-white transition disabled:opacity-60">{aiBusy ? "Thinking…" : "Apply with AI"}</button>

        <div className="mt-4">
          <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">Quick tone</div>
          <div className="flex flex-wrap gap-1.5">
            {["Make it more formal", "Make it concise", "Add legal disclaimer", "Friendlier tone", "Translate to formal English"].map((q) => (
              <button key={q} onClick={() => setAiPrompt(q)} className="text-[11px] text-zinc-400 ring-1 ring-zinc-800 hover:bg-zinc-900 hover:text-zinc-100 rounded-full px-2.5 py-1">
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto p-3 bg-zinc-900/40 ring-1 ring-zinc-800 rounded-xl text-[11px] text-zinc-500 leading-relaxed">
          <div className="text-zinc-300 font-medium mb-1">Tip</div>
          Set your logo and brand colors in Brand Kit — every theme inherits them.
        </div>
      </aside>

      {/* Offscreen static copy used for clean PDF capture */}
      {typeof document !== "undefined" &&
        createPortal(
          <div
            style={{
              position: "fixed",
              left: -10000,
              top: 0,
              width: 794,
              pointerEvents: "none",
            }}
          >
            <DocumentPaper
              ref={exportRef}
              title={title}
              blocks={blocks}
              theme={theme}
              brand={brand}
              staticMode
            />
          </div>,
          document.body
        )}
    </div>
  );
}
