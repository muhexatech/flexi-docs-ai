import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, FileText, Layers, ShieldCheck, ArrowRight } from "lucide-react";
import { DOC_TYPES } from "@/lib/doc-types";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  return (
    <div className="min-h-screen bg-background text-zinc-400 font-sans">
      {/* Nav */}
      <nav className="py-6 px-6 max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="font-semibold text-zinc-50 tracking-tight text-lg">DocuAI</Link>
          <div className="hidden md:flex gap-6">
            <a href="#features" className="text-sm font-medium hover:text-zinc-50 transition-colors">Platform</a>
            <a href="#templates" className="text-sm font-medium hover:text-zinc-50 transition-colors">Templates</a>
            <a href="#enterprise" className="text-sm font-medium hover:text-zinc-50 transition-colors">Enterprise</a>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/auth" className="text-sm text-zinc-400 hover:text-zinc-50 px-3 py-2">Sign in</Link>
          <Link to="/auth" className="bg-zinc-50 text-neutral-950 px-4 py-2 rounded-full text-sm font-medium ring-1 ring-zinc-50/20 hover:bg-zinc-200 transition">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="py-24 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="mb-6 px-3 py-1 rounded-full ring-1 ring-zinc-800 bg-zinc-900/50 text-[11px] font-mono uppercase tracking-widest text-zinc-500">
            Protocol 2.0 — AI Document Engine
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-semibold text-zinc-50 leading-[1.05] tracking-tight text-balance max-w-[20ch] mb-8">
            Documents that draft themselves.
          </h1>
          <p className="text-base sm:text-lg text-pretty max-w-[52ch] mb-12 leading-relaxed">
            The professional standard for automated document generation. Transform structured data or a simple prompt into enterprise-grade legal, financial, and operational assets.
          </p>

          <form
            onSubmit={(e) => { e.preventDefault(); window.location.href = "/auth"; }}
            className="w-full max-w-2xl bg-neutral-900/50 ring-1 ring-white/5 p-2 rounded-2xl flex items-center gap-3"
          >
            <div className="flex-1 flex items-center gap-3 pl-4">
              <Sparkles className="size-4 text-zinc-500 shrink-0" />
              <span className="text-zinc-500 font-mono text-sm hidden sm:inline">/generate</span>
              <input
                type="text"
                placeholder="Draft a standard NDA for a Series A startup..."
                className="bg-transparent border-none outline-none text-zinc-100 text-sm w-full py-2 placeholder:text-zinc-600"
              />
            </div>
            <button className="bg-zinc-100 text-neutral-900 h-9 px-4 rounded-xl text-sm font-medium hover:bg-white transition inline-flex items-center gap-1.5">
              Draft <ArrowRight className="size-3.5" />
            </button>
          </form>

          <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-3xl">
            {["NDAs", "Offer Letters", "Proposals", "Invoices", "Certificates", "MSAs"].map((t) => (
              <span key={t} className="px-3 py-1 bg-zinc-900 ring-1 ring-zinc-800 text-zinc-400 text-xs rounded-lg">{t}</span>
            ))}
          </div>
        </div>
      </header>

      {/* App peek */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="ring-1 ring-white/5 bg-neutral-900 rounded-2xl overflow-hidden flex h-[520px] shadow-2xl">
            <aside className="w-60 border-r border-zinc-800 p-6 flex flex-col gap-6">
              <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Workspace</div>
              <div className="flex flex-col gap-1">
                {["Documents", "Templates", "Brand Kit", "AI Assistant"].map((l, i) => (
                  <div key={l} className={`flex items-center gap-2 py-1.5 px-2 rounded-md text-sm ${i === 0 ? "bg-zinc-800/60 text-zinc-50" : "text-zinc-500"}`}>
                    <div className="size-3.5 shrink-0 rounded-sm bg-zinc-700/60" />
                    <span className="font-medium">{l}</span>
                  </div>
                ))}
              </div>
              <div className="mt-auto p-3 bg-zinc-900/80 ring-1 ring-zinc-800 rounded-xl">
                <div className="text-xs font-medium text-zinc-300 mb-1.5">AI Capacity</div>
                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-zinc-100 w-2/3" />
                </div>
                <div className="mt-2 text-[10px] text-zinc-500">4.2k tokens remaining</div>
              </div>
            </aside>
            <main className="flex-1 bg-[#050505] p-8 overflow-hidden">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-medium text-zinc-100">Recent Assets</h2>
                <div className="text-xs text-zinc-500 font-mono">12 documents</div>
              </div>
              <div className="grid grid-cols-3 gap-5">
                {[
                  { name: "Series A Founders Agreement", file: "Draft_v1.pdf", ago: "2m ago" },
                  { name: "Global Partner Invoice", file: "INV_992.pdf", ago: "1h ago" },
                  { name: "Compliance Certificate", file: "CERT_2024.pdf", ago: "yesterday" },
                ].map((d) => (
                  <div key={d.file} className="group">
                    <div className="w-full aspect-[4/5] bg-zinc-900 ring-1 ring-white/5 rounded-lg grid place-items-center mb-3 p-4">
                      <div className="w-full h-full bg-zinc-950/50 rounded grid place-items-center">
                        <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-600">{d.file}</span>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-zinc-300">{d.name}</div>
                    <div className="text-xs text-zinc-500">Edited {d.ago}</div>
                  </div>
                ))}
              </div>
            </main>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
          {[
            { icon: Layers, title: "Logic-Driven Layouts", body: "Documents aren't static images. Our engine understands hierarchy, flow, and structural integrity." },
            { icon: ShieldCheck, title: "Enterprise Brand Kit", body: "Lock your typography, colors, and legal footers. Every generated page stays on-spec." },
            { icon: FileText, title: "Visual Canvas", body: "A precision editor for final tweaks. Drag, drop, and refine with pixel-perfect control." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex flex-col gap-4">
              <div className="size-9 bg-zinc-900 ring-1 ring-zinc-800 rounded-lg flex items-center justify-center">
                <Icon className="size-4 text-zinc-400" />
              </div>
              <h3 className="text-lg font-medium text-zinc-50">{title}</h3>
              <p className="text-sm leading-relaxed text-zinc-400 max-w-[40ch]">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Templates */}
      <section id="templates" className="py-24 px-6 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 mb-3">Template Library</div>
            <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-50 tracking-tight">Every document your business writes.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {DOC_TYPES.slice(0, 12).map((d) => (
              <div key={d.id} className="p-5 rounded-xl bg-zinc-900/40 ring-1 ring-zinc-800 hover:ring-zinc-700 hover:bg-zinc-900/70 transition">
                <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">{d.category}</div>
                <div className="text-sm font-medium text-zinc-100 mb-1">{d.name}</div>
                <div className="text-xs text-zinc-500">{d.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="enterprise" className="py-32 px-6 border-t border-zinc-900 text-center">
        <h2 className="text-4xl sm:text-5xl font-semibold text-zinc-50 tracking-tight mb-6">Ready to automate?</h2>
        <p className="text-zinc-400 max-w-md mx-auto mb-10">Start drafting enterprise-grade documents in seconds. No credit card required.</p>
        <Link to="/auth" className="inline-flex items-center gap-2 bg-zinc-50 text-neutral-950 px-6 py-3 rounded-full text-sm font-medium hover:bg-white transition">
          Start building for free <ArrowRight className="size-4" />
        </Link>
      </section>

      <footer className="py-12 px-6 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div>
            <div className="font-semibold text-zinc-50">DocuAI Studio</div>
            <div className="text-xs font-mono text-zinc-600 mt-1">© 2026 PRECISION SYSTEMS INC.</div>
          </div>
          <div className="flex gap-12">
            <div className="flex flex-col gap-2"><span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">System</span><a className="text-sm text-zinc-500" href="#">Documentation</a><a className="text-sm text-zinc-500" href="#">API</a></div>
            <div className="flex flex-col gap-2"><span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Legal</span><a className="text-sm text-zinc-500" href="#">Privacy</a><a className="text-sm text-zinc-500" href="#">Terms</a></div>
          </div>
        </div>
      </footer>
    </div>
  );
}
