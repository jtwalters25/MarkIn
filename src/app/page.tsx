import LandingHero from "@/components/LandingHero";
import ThemeToggle from "@/components/ThemeToggle";
import ConnectButton from "@/components/ConnectButton";
import FadeIn from "@/components/FadeIn";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="px-4 sm:px-8 py-5 flex items-center justify-between border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-gold/10 border border-gold/30 flex items-center justify-center">
            <span className="text-gold font-bold">M</span>
          </div>
          <span className="font-semibold tracking-tight">
            <span className="text-text">Mark</span><span className="text-gold">In</span>
          </span>
        </div>
        <nav className="flex items-center gap-3 sm:gap-6 text-sm text-text-muted">
          <a href="#how" className="hidden sm:inline hover:text-text">How it works</a>
          <a href="#why" className="hidden sm:inline hover:text-text">Why MarkIn</a>
          <ThemeToggle />
          <ConnectButton longLabel="Connect your site →" shortLabel="Try it" />
        </nav>
      </header>

      <LandingHero />

      {/* Problem */}
      <section className="px-4 sm:px-8 py-20 sm:py-28 border-t border-border-subtle">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Every copy change is slower than it should be
            </h2>
          </FadeIn>

          <div className="mt-14 grid sm:grid-cols-3 gap-10">
            {[
              { step: "①", text: "You message your engineer to change one line of text." },
              { step: "②", text: "They dig through the codebase, make the change, and publish." },
              { step: "③", text: "You wait hours, or days, for something that should take minutes." },
            ].map((p, i) => (
              <FadeIn key={p.step} delay={i * 120}>
                <div>
                  <div className="text-gold text-2xl font-light mb-3">{p.step}</div>
                  <p className="text-text leading-relaxed">{p.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={400}>
            <p className="mt-14 text-lg text-text-muted max-w-2xl">
              That delay kills iteration, and iteration drives growth.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="px-4 sm:px-8 py-20 sm:py-28 border-t border-border-subtle">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Just describe the change. MarkIn handles the rest.
            </h2>
          </FadeIn>

          <div className="mt-14 space-y-12 sm:space-y-16">
            <FadeIn>
              <Step n="1" title="Describe" body="Type it in plain English. No code, no jargon.">
                <div className="card p-4 font-sans text-text-muted">
                  <span className="text-text-dim text-xs mr-2">›</span>
                  Change pricing from $29 to $49
                </div>
              </Step>
            </FadeIn>

            <FadeIn delay={120}>
              <Step n="2" title="Preview" body="See exactly what will change before anything goes live.">
                <div className="card p-4 space-y-3">
                  <div className="text-xs text-gold">📍 Homepage → Hero Section</div>
                  <div className="rounded-md bg-bg-subtle px-3 py-2 text-sm text-text-muted">
                    <span className="line-through decoration-diff-remove/70">Starting at $29/mo per seat</span>
                  </div>
                  <div className="rounded-md border border-diff-add/30 border-l-4 border-l-diff-add bg-diff-addBg px-3 py-2 text-sm">
                    Starting at <span className="font-semibold text-diff-add">$49/mo</span> per seat
                  </div>
                </div>
              </Step>
            </FadeIn>

            <FadeIn delay={240}>
              <Step n="3" title="Publish" body="Go live instantly or send for review. Undo built in.">
                <div className="card p-4 flex flex-wrap items-center gap-3 text-sm">
                  <span className="btn-gold text-sm py-1.5 cursor-default">Send for review</span>
                  <span className="btn-ghost text-sm py-1.5 cursor-default">Schedule for later</span>
                  <span className="text-text-dim">every change is reversible.</span>
                </div>
              </Step>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section id="why" className="px-4 sm:px-8 py-20 sm:py-28 border-t border-border-subtle">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { t: "Move faster", b: "Ship copy changes in minutes, not days." },
              { t: "No technical knowledge required", b: "No Git, no branches, no codebase digging." },
              { t: "Safe by default", b: "Preview every change, track history, and undo instantly." },
            ].map((v, i) => (
              <FadeIn key={v.t} delay={i * 120}>
                <div className="card p-6 h-full">
                  <h3 className="text-lg font-semibold">{v.t}</h3>
                  <p className="text-text-muted text-sm mt-2 leading-relaxed">{v.b}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="px-4 sm:px-8 py-20 sm:py-28 border-t border-border-subtle">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              What teams use MarkIn for
            </h2>
          </FadeIn>

          <div className="mt-10 grid sm:grid-cols-2 gap-4">
            {[
              "Update headlines and CTAs",
              "Change pricing or promo messaging",
              "Fix typos instantly",
              "Run rapid messaging experiments",
            ].map((u, i) => (
              <FadeIn key={u} delay={i * 80}>
                <div className="flex items-start gap-3 card p-5">
                  <span className="text-gold mt-0.5">→</span>
                  <span className="text-text">{u}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 sm:px-8 py-20 sm:py-28 border-t border-border-subtle">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Frequently asked questions
            </h2>
          </FadeIn>

          <div className="mt-10 space-y-6">
            <FadeIn>
              <div className="card p-6">
                <h3 className="text-lg font-semibold">What is your refund policy?</h3>
                <p className="text-text-muted text-sm mt-2 leading-relaxed">
                  We offer a 30-day money-back guarantee. If you're not satisfied for any reason, contact us within 30 days of your purchase and we'll issue a full refund — no questions asked.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 sm:px-8 py-24 sm:py-32 text-center border-t border-border-subtle">
        <FadeIn>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight">
            Stop waiting to ship simple changes
          </h2>
          <p className="mt-4 text-text-muted max-w-xl mx-auto text-lg">
            Connect your site and make your first change in under 2 minutes.
          </p>
          <div className="mt-10">
            <ConnectButton className="btn-gold text-base px-6 py-3" longLabel="Get started free →" shortLabel="Get started →" />
          </div>
        </FadeIn>
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

function Step({
  n, title, body, children,
}: { n: string; title: string; body: string; children: React.ReactNode }) {
  return (
    <div className="grid sm:grid-cols-[auto,1fr] gap-4 sm:gap-8 items-start">
      <div className="flex items-center gap-3 sm:block">
        <div className="text-gold font-mono text-sm">0{n}</div>
        <div className="sm:mt-2 h-px sm:w-16 sm:h-px bg-border-subtle flex-1 sm:flex-none" />
      </div>
      <div>
        <h3 className="text-xl sm:text-2xl font-semibold">{title}</h3>
        <p className="text-text-muted mt-2">{body}</p>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
