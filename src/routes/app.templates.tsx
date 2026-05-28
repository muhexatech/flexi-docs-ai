import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { DOC_TYPES, type DocCategory } from "@/lib/doc-types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/app/templates")({ component: TemplatesPage });

const CATEGORIES: (DocCategory | "All")[] = ["All", "HR", "Business", "Legal", "Education", "Corporate"];

function TemplatesPage() {
  const nav = useNavigate();
  const [cat, setCat] = useState<(DocCategory | "All")>("All");
  const items = DOC_TYPES.filter((d) => cat === "All" || d.category === cat);

  async function useTemplate(typeId: string) {
    const tpl = DOC_TYPES.find((d) => d.id === typeId)!;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    try {
      const res = await fetch("/api/generate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ prompt: tpl.samplePrompt, docType: typeId }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      const { data: doc, error } = await supabase.from("documents").insert({ user_id: user.id, title: data.title ?? tpl.name, doc_type: typeId, content: { blocks: data.blocks ?? [] } }).select().single();
      if (error) throw error;
      nav({ to: "/app/documents/$id", params: { id: (doc as any).id } });
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <div className="p-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 mb-3">Library</div>
        <h1 className="text-3xl font-semibold text-zinc-50 tracking-tight">Templates</h1>
      </div>
      <div className="flex gap-2 mb-8">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`text-xs px-3 py-1.5 rounded-full ring-1 transition ${cat === c ? "bg-zinc-100 text-neutral-900 ring-zinc-100" : "ring-zinc-800 text-zinc-400 hover:text-zinc-100"}`}>{c}</button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((d) => (
          <button key={d.id} onClick={() => useTemplate(d.id)} className="text-left p-5 rounded-xl bg-zinc-900/40 ring-1 ring-zinc-800 hover:ring-zinc-700 hover:bg-zinc-900/70 transition">
            <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">{d.category}</div>
            <div className="text-sm font-medium text-zinc-100 mb-1">{d.name}</div>
            <div className="text-xs text-zinc-500 mb-4">{d.description}</div>
            <div className="text-[11px] text-zinc-600 italic line-clamp-2">"{d.samplePrompt}"</div>
          </button>
        ))}
      </div>
    </div>
  );
}
