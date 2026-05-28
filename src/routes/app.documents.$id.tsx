import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Sparkles, Download, Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/app/documents/$id")({ component: EditorPage });

type Block =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "signature"; name: string; role?: string };

function EditorPage() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState("general");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    void (async () => {
      const { data, error } = await supabase.from("documents").select("*").eq("id", id).maybeSingle();
      if (error || !data) { toast.error("Document not found"); nav({ to: "/app" }); return; }
      setTitle((data as any).title); setDocType((data as any).doc_type);
      setBlocks(((data as any).content?.blocks ?? []) as Block[]);
      setLoading(false);
    })();
  }, [id, nav]);

  useEffect(() => {
    if (loading) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      await supabase.from("documents").update({ title, content: { blocks } }).eq("id", id);
      setSaving(false);
    }, 700);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [title, blocks, id, loading]);

  function updateBlock(i: number, patch: Partial<Block>) {
    setBlocks((bs) => bs.map((b, idx) => (idx === i ? ({ ...b, ...patch } as Block) : b)));
  }
  function removeBlock(i: number) { setBlocks((bs) => bs.filter((_, idx) => idx !== i)); }
  function addBlock(type: Block["type"]) {
    const tpl: Record<Block["type"], Block> = {
      heading: { type: "heading", text: "New heading" },
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
      const res = await fetch("/api/generate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ prompt: aiPrompt, docType }) });
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

  function onExport() { window.print(); }

  if (loading) return <div className="min-h-screen grid place-items-center text-zinc-500 text-sm">Loading…</div>;

  return (
    <div className="flex h-screen">
      {/* Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-zinc-900 flex items-center justify-between px-6 print:hidden">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/app" className="text-zinc-500 hover:text-zinc-200"><ArrowLeft className="size-4" /></Link>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-transparent text-sm font-medium text-zinc-100 outline-none min-w-0 truncate" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">{saving ? "Saving…" : "Saved"}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onExport} className="text-xs text-zinc-300 ring-1 ring-zinc-800 hover:bg-zinc-900 rounded-lg px-3 py-1.5 inline-flex items-center gap-1.5"><Download className="size-3.5" />Export PDF</button>
            <button onClick={onDelete} className="text-xs text-zinc-500 hover:text-red-400 rounded-lg p-1.5"><Trash2 className="size-3.5" /></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-[#050505] p-8 print:bg-white print:p-0">
          <div className="mx-auto max-w-3xl bg-white text-zinc-900 rounded-sm shadow-2xl p-16 min-h-[1100px] print:shadow-none print:rounded-none">
            {blocks.map((b, i) => (
              <div key={i} className="group relative mb-5">
                {b.type === "heading" && (
                  <input value={b.text} onChange={(e) => updateBlock(i, { text: e.target.value })} className="w-full text-2xl font-semibold tracking-tight outline-none bg-transparent" />
                )}
                {b.type === "paragraph" && (
                  <textarea value={b.text} onChange={(e) => updateBlock(i, { text: e.target.value })} rows={Math.max(3, b.text.split("\n").length)} className="w-full text-[15px] leading-relaxed outline-none bg-transparent resize-none" />
                )}
                {b.type === "list" && (
                  <ul className="list-disc pl-6 space-y-1">
                    {b.items.map((it, j) => (
                      <li key={j}><input value={it} onChange={(e) => { const items = [...b.items]; items[j] = e.target.value; updateBlock(i, { items } as any); }} className="w-full bg-transparent outline-none text-[15px]" /></li>
                    ))}
                    <li className="list-none"><button onClick={() => updateBlock(i, { items: [...b.items, "New item"] } as any)} className="text-xs text-zinc-400 print:hidden">+ add item</button></li>
                  </ul>
                )}
                {b.type === "signature" && (
                  <div className="mt-10 pt-6 border-t border-zinc-300">
                    <input value={b.name} onChange={(e) => updateBlock(i, { name: e.target.value } as any)} className="block text-sm font-semibold outline-none bg-transparent" />
                    <input value={b.role ?? ""} onChange={(e) => updateBlock(i, { role: e.target.value } as any)} className="block text-xs text-zinc-500 outline-none bg-transparent" />
                  </div>
                )}
                <button onClick={() => removeBlock(i)} className="absolute -left-8 top-1 opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 print:hidden"><Trash2 className="size-3.5" /></button>
              </div>
            ))}
            <div className="flex flex-wrap gap-2 mt-8 print:hidden">
              {(["heading", "paragraph", "list", "signature"] as const).map((t) => (
                <button key={t} onClick={() => addBlock(t)} className="text-xs text-zinc-500 ring-1 ring-zinc-200 hover:bg-zinc-50 rounded-md px-2.5 py-1 inline-flex items-center gap-1"><Plus className="size-3" />{t}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI panel */}
      <aside className="w-80 border-l border-zinc-900 p-5 flex flex-col gap-4 print:hidden">
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-200"><Sparkles className="size-3.5 text-zinc-400" />AI Assistant</div>
        <div className="text-xs text-zinc-500 leading-relaxed">Describe a change and the engine will redraft the document.</div>
        <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} rows={5} placeholder="Make it more formal, add an indemnity clause, shorten by 30%..." className="bg-zinc-900/60 ring-1 ring-zinc-800 rounded-xl p-3 text-sm text-zinc-100 outline-none focus:ring-zinc-600 transition resize-none" />
        <button onClick={aiRewrite} disabled={aiBusy} className="bg-zinc-100 text-neutral-900 rounded-xl py-2 text-sm font-medium hover:bg-white transition disabled:opacity-60">{aiBusy ? "Thinking…" : "Apply with AI"}</button>
        <div className="mt-auto p-3 bg-zinc-900/40 ring-1 ring-zinc-800 rounded-xl text-[11px] text-zinc-500 leading-relaxed">
          <div className="text-zinc-300 font-medium mb-1">Tip</div>
          Use Export PDF (top right) to print or save as PDF.
        </div>
      </aside>
    </div>
  );
}
