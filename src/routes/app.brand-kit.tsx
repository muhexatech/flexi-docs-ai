import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/app/brand-kit")({ component: BrandKitPage });

function BrandKitPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ display_name: "", company_name: "", logo_url: "", brand_primary: "#0a0a0b", brand_accent: "#d4d4d8" });

  useEffect(() => {
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (data) setForm({
        display_name: (data as any).display_name ?? "",
        company_name: (data as any).company_name ?? "",
        logo_url: (data as any).logo_url ?? "",
        brand_primary: (data as any).brand_primary ?? "#0a0a0b",
        brand_accent: (data as any).brand_accent ?? "#d4d4d8",
      });
      setLoading(false);
    })();
  }, []);

  async function save() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("profiles").update(form).eq("id", user.id);
    if (error) toast.error(error.message); else toast.success("Brand kit saved");
    setSaving(false);
  }

  async function uploadLogo(file: File) {
    if (!file.type.startsWith("image/")) { toast.error("Please choose an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Max file size is 5MB"); return; }
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Not signed in"); return; }
      const ext = file.name.split(".").pop() || "png";
      const path = `${user.id}/logo-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("brand-logos").upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) { toast.error(upErr.message); return; }
      const { data: pub } = supabase.storage.from("brand-logos").getPublicUrl(path);
      setForm((f) => ({ ...f, logo_url: pub.publicUrl }));
      toast.success("Logo uploaded — don't forget to save");
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <div className="p-10 text-sm text-zinc-500">Loading…</div>;

  return (
    <div className="p-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 mb-3">Identity</div>
        <h1 className="text-3xl font-semibold text-zinc-50 tracking-tight">Brand Kit</h1>
        <p className="text-sm text-zinc-500 mt-2">Lock in your identity. Every generated document inherits these defaults.</p>
      </div>
      <div className="bg-zinc-900/40 ring-1 ring-zinc-800 rounded-2xl p-6 flex flex-col gap-5">
        <Field label="Display name"><input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} className="input" /></Field>
        <Field label="Company name"><input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} className="input" /></Field>
        <Field label="Logo URL"><input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://..." className="input" /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Primary color">
            <div className="flex gap-2 items-center">
              <input type="color" value={form.brand_primary} onChange={(e) => setForm({ ...form, brand_primary: e.target.value })} className="size-10 rounded-lg bg-transparent ring-1 ring-zinc-800" />
              <input value={form.brand_primary} onChange={(e) => setForm({ ...form, brand_primary: e.target.value })} className="input flex-1" />
            </div>
          </Field>
          <Field label="Accent color">
            <div className="flex gap-2 items-center">
              <input type="color" value={form.brand_accent} onChange={(e) => setForm({ ...form, brand_accent: e.target.value })} className="size-10 rounded-lg bg-transparent ring-1 ring-zinc-800" />
              <input value={form.brand_accent} onChange={(e) => setForm({ ...form, brand_accent: e.target.value })} className="input flex-1" />
            </div>
          </Field>
        </div>
        <button onClick={save} disabled={saving} className="self-start bg-zinc-100 text-neutral-900 rounded-xl px-5 py-2 text-sm font-medium hover:bg-white transition disabled:opacity-60">{saving ? "Saving…" : "Save brand kit"}</button>
      </div>
      <style>{`.input{background:rgb(24 24 27 / 0.6); border:none; outline:none; padding:0.5rem 0.75rem; border-radius:0.625rem; color:rgb(244 244 245); font-size:0.875rem; box-shadow: 0 0 0 1px rgb(39 39 42); width:100%;} .input:focus{box-shadow: 0 0 0 1px rgb(82 82 91);}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500">{label}</span>
      {children}
    </label>
  );
}
