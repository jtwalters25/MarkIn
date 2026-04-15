import LandingHero from "@/components/LandingHero";
import ThemeToggle from "@/components/ThemeToggle";
import ConnectButton from "@/components/ConnectButton";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="px-4 sm:px-8 py-5 flex items-center justify-between border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-gold/10 border border-gold/30 flex items-center justify-center">
            <span className="text-gold font-bold">M</span>
          </div>
          <span className="font-semibold tracking-tight">MarkIn</span>
        </div>
        <nav className="flex items-center gap-3 sm:gap-6 text-sm text-text-muted">
          <a href="#how" className="hidden sm:inline hover:text-text">How it works</a>
          <a href="#why" className="hidden sm:inline hover:text-text">Why MarkIn</a>
          <ThemeToggle />
          <ConnectButton />
        </nav>
      </header>

      <LandingHero />

      <section id="how" className="px-4 sm:px-8 py-16 sm:py-24 max-w-5xl mx-auto w-full">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-2">How it works</h2>
        <p className="text-text-muted mb-10 sm:mb-12">Three steps. No terminal. No merge conflicts.</p>
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          {[
            { n: "01", title: "Describe", body: "Type the change you want in plain English. \u201CChange the homepage pricing from $29 to $49.\u201D" },
            { n: "02", title: "Preview", body: "See exactly what will change before anything ships. Green for added, red for removed." },
            { n: "03", title: "Ship", body: "We open a pull request. Your engineers review and merge. You stay shipping." },
          ].map((s) => (
            <div key={s.n} className="card p-5 sm:p-6">
              <div className="text-gold text-sm font-mono mb-3">{s.n}</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">{s.title}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="why" className="px-4 sm:px-8 py-16 sm:py-24 max-w-5xl mx-auto w-full border-t border-border-subtle">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-2">Marketing teams move. Engineers stay in control.</h2>
        <p className="text-text-muted mb-10 sm:mb-12 max-w-2xl">
          Every change is a pull request. Every PR has a reviewer. Marketers get speed. Engineers keep the keys.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="card p-5 sm:p-6">
            <div className="text-text-muted text-sm mb-2">Used by teams at</div>
            <div className="text-text-dim text-xs uppercase tracking-widest">
              Logo placeholder &middot; Logo placeholder &middot; Logo placeholder
            </div>
          </div>
          <div className="card p-5 sm:p-6">
            <blockquote className="text-text italic">
              \u201CMarkIn turned a one-day engineering ticket into a five-minute marketing edit.\u201D
            </blockquote>
            <div className="text-text-dim text-xs mt-3">— Placeholder testimonial</div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-8 py-16 sm:py-24 text-center border-t border-border-subtle">
        <h2 className="text-3xl sm:text-4xl font-semibold mb-4">Stop waiting on Git.</h2>
        <p className="text-text-muted mb-8 max-w-xl mx-auto">
          Connect your GitHub repo in 30 seconds. Ship your first edit before lunch.
        </p>
        <ConnectButton className="btn-gold" longLabel="Connect your repo →" shortLabel="Connect repo →" />
      </section>

      <footer className="px-4 sm:px-8 py-8 border-t border-border-subtle flex flex-wrap gap-4 items-center justify-between text-sm text-text-dim">
        <div>&copy; {new Date().getFullYear()} MarkIn. GitOut.</div>
        <div className="flex gap-4 sm:gap-6">
          <a href="#" className="hover:text-text">Privacy</a>
          <a href="#" className="hover:text-text">Terms</a>
          <a href="#" className="hover:text-text">Contact</a>
        </div>
      </footer>
    </main>
  );
}
