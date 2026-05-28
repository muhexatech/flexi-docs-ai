import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileText, LayoutTemplate, Palette, Sparkles, LogOut } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/app")({ component: AppLayout });

function AppLayout() {
  const nav = useNavigate();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) nav({ to: "/auth" });
      else { setEmail(session.user.email ?? null); setReady(true); }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) nav({ to: "/auth" });
      else { setEmail(data.session.user.email ?? null); setReady(true); }
    });
    return () => sub.subscription.unsubscribe();
  }, [nav]);

  if (!ready) return <div className="min-h-screen grid place-items-center text-zinc-500 text-sm">Loading…</div>;

  const items = [
    { to: "/app", label: "Documents", icon: FileText, exact: true },
    { to: "/app/templates", label: "Templates", icon: LayoutTemplate },
    { to: "/app/brand-kit", label: "Brand Kit", icon: Palette },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      <Toaster richColors theme="dark" />
      <aside className="w-64 border-r border-zinc-900 bg-sidebar p-5 flex flex-col gap-6 shrink-0">
        <Link to="/" className="font-semibold text-zinc-50 text-lg tracking-tight">DocuAI</Link>
        <div className="flex flex-col gap-1">
          <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2 px-2">Workspace</div>
          {items.map(({ to, label, icon: Icon, exact }) => {
            const active = exact ? path === to : path.startsWith(to);
            return (
              <Link key={to} to={to} className={`flex items-center gap-2.5 py-2 px-2.5 rounded-md text-sm transition ${active ? "bg-zinc-800/60 text-zinc-50" : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/40"}`}>
                <Icon className="size-4" /><span className="font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
        <div className="mt-auto flex flex-col gap-3">
          <div className="p-3 bg-zinc-900/60 ring-1 ring-zinc-800 rounded-xl">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-300 mb-2"><Sparkles className="size-3.5" />AI Capacity</div>
            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-zinc-100 w-2/3" /></div>
            <div className="mt-2 text-[10px] text-zinc-500">4.2k tokens remaining</div>
          </div>
          <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
            <span className="truncate">{email}</span>
            <button onClick={() => supabase.auth.signOut()} className="hover:text-zinc-200" aria-label="Sign out"><LogOut className="size-3.5" /></button>
          </div>
        </div>
      </aside>
      <main className="flex-1 min-w-0 overflow-y-auto"><Outlet /></main>
    </div>
  );
}
