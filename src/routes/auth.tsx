import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/auth")({ component: AuthPage });

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) nav({ to: "/app" }); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => { if (session) nav({ to: "/app" }); });
    return () => sub.subscription.unsubscribe();
  }, [nav]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/app" } });
        if (error) throw error;
        toast.success("Account created. Check your email to confirm.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) { toast.error(err.message ?? "Authentication failed"); }
    finally { setLoading(false); }
  }

  async function onGoogle() {
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/app" });
    if (res.error) toast.error("Google sign-in failed");
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Toaster richColors theme="dark" />
      <div className="hidden lg:flex flex-1 border-r border-zinc-900 p-12 flex-col justify-between">
        <Link to="/" className="font-semibold text-zinc-50">DocuAI</Link>
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 mb-4">Protocol 2.0</div>
          <h1 className="text-5xl font-semibold text-zinc-50 tracking-tight leading-[1.05] max-w-md">Documents that draft themselves.</h1>
          <p className="text-zinc-500 mt-6 max-w-sm">Generate, edit, brand and export enterprise-grade documents with AI.</p>
        </div>
        <div className="text-xs font-mono text-zinc-600">© 2026 PRECISION SYSTEMS</div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 mb-3">{mode === "signin" ? "Sign in" : "Create account"}</div>
          <h2 className="text-2xl font-semibold text-zinc-50 mb-8">{mode === "signin" ? "Welcome back" : "Get started"}</h2>

          <button onClick={onGoogle} className="w-full ring-1 ring-zinc-800 hover:ring-zinc-700 hover:bg-zinc-900/50 transition rounded-xl py-2.5 text-sm text-zinc-100 mb-3 font-medium">
            Continue with Google
          </button>
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-zinc-900" /><span className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">or</span><div className="flex-1 h-px bg-zinc-900" />
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <input type="email" required placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)}
              className="bg-zinc-900/50 ring-1 ring-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 outline-none focus:ring-zinc-600 transition" />
            <input type="password" required minLength={6} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="bg-zinc-900/50 ring-1 ring-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 outline-none focus:ring-zinc-600 transition" />
            <button disabled={loading} className="bg-zinc-100 text-neutral-900 rounded-xl py-2.5 text-sm font-medium hover:bg-white transition disabled:opacity-60">
              {loading ? "..." : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="mt-6 text-xs text-zinc-500 hover:text-zinc-300 transition">
            {mode === "signin" ? "Don't have an account? Create one" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
