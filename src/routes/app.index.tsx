import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DOC_TYPES } from "@/lib/doc-types";
import { Sparkles, Plus, FileText, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/app/")({ component: Dashboard });

type Doc = { id: string; title: string; doc_type: string; updated_at: string };

function Dashboard() {
  const nav = useNavigate();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [prompt, setPrompt] = useState("");
  const [docType, setDocType] = useState("offer_letter");
  const [generating, setGenerating] = useState(false);

  useEffect(() => { void load(); }, []);
  async function load() {
    const { data } = await supabase.from("documents").select("id,title,doc_type,updated_at").order("updated_at", { ascending: false }).limit(24);
    setDocs((data as any) ?? []);
  }

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/generate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ prompt, docType }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { data: inserted, error } = await supabase.from("documents").insert({
        user_id: user.id, title: data.title ?? "Untitled Document", doc_type: docType, content: { blocks: data.blocks ?? [] },
      }).select().single();
      if (error) throw error;
      toast.success("Document drafted");
      nav({ to: "/app/documents/$id", params: { id: (inserted as any).id } });
    } catch (err: any) { toast.error(err.message); }
    finally { setGenerating(false); }
  }

  async function createBlank() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from("documents").insert({ user_id: user.id, title: "Untitled Document", doc_type: "general", content: { blocks: [{ type: "heading", text: "New Document" }, { type: "paragraph", text: "" }] } }).select().single();
    if (error) return toast.error(error.message);
    nav({ to: "/app/documents/$id", params: { id: (data as any).id } });
  }

  return (
    <div className="p-10 max-w-6xl mx-auto">
      <div className="mb-10">
        <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 mb-3">AI Workspace</div>
        <h1 className="text-3xl font-semibold text-zinc-50 tracking-tight mb-1">Draft a new document</h1>
        <p className="text-sm text-zinc-500">Describe what you need. The engine handles the structure, tone, and formatting.</p>
      </div>

      <form onSubmit={onGenerate} className="bg-neutral-900/50 ring-1 ring-zinc-800 rounded-2xl p-3 mb-12">
        <div className="flex items-center gap-3 px-3 py-2">
          <Sparkles className="size-4 text-zinc-500 shrink-0" />
          <select value={docType} onChange={(e) => setDocType(e.target.value)} className="bg-zinc-900 ring-1 ring-zinc-800 rounded-lg text-xs text-zinc-300 px-2 py-1.5 outline-none">
            {DOC_TYPES.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Draft a standard NDA for a Series A startup..." className="flex-1 bg-transparent outline-none text-sm text-zinc-100 placeholder:text-zinc-600 py-2" />
          <button disabled={generating} className="bg-zinc-100 text-neutral-900 h-9 px-4 rounded-xl text-sm font-medium hover:bg-white transition disabled:opacity-60 inline-flex items-center gap-1.5">
            {generating ? "Drafting..." : "Generate"} {!generating && <ArrowRight className="size-3.5" />}
          </button>
        </div>
      </form>

      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-medium text-zinc-100">Recent Assets</h2>
        <button onClick={createBlank} className="text-xs text-zinc-400 hover:text-zinc-100 inline-flex items-center gap-1.5"><Plus className="size-3.5" />Blank document</button>
      </div>

      {docs.length === 0 ? (
        <div className="ring-1 ring-zinc-800 rounded-xl p-12 text-center">
          <FileText className="size-6 text-zinc-600 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">No documents yet. Generate your first above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {docs.map((d) => (
            <Link key={d.id} to="/app/documents/$id" params={{ id: d.id }} className="group">
              <div className="w-full aspect-[4/5] bg-zinc-900 ring-1 ring-zinc-800 group-hover:ring-zinc-700 rounded-lg p-4 mb-3 transition">
                <div className="w-full h-full bg-zinc-950/40 rounded grid place-items-center">
                  <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-600">{d.doc_type}.pdf</span>
                </div>
              </div>
              <div className="text-sm font-medium text-zinc-200 truncate">{d.title}</div>
              <div className="text-xs text-zinc-500">{formatDistanceToNow(new Date(d.updated_at))} ago</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
