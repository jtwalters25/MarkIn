"use client";

import { signIn, useSession } from "next-auth/react";
import Link from "next/link";

export default function LandingHero() {
  const { data: session } = useSession();
  const demo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  return (
    <section className="px-4 sm:px-8 pt-16 sm:pt-24 pb-20 sm:pb-32 max-w-5xl mx-auto w-full">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/30 bg-gold/5 text-gold text-xs font-mono mb-6 sm:mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
        {demo ? "Demo mode — no signup needed" : "Now in private beta"}
      </div>
      <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight">
              Mark<span className="text-gold">In</span>.
      </h1>
      <p className="mt-3 sm:mt-4 text-2xl sm:text-3xl md:text-4xl text-text-muted font-light tracking-tight">
        GitOut.
      </p>
      <p className="mt-6 sm:mt-8 max-w-2xl text-base sm:text-lg text-text leading-relaxed">
        Plain English editing for your marketing site. Marketers describe changes,
        engineers approve PRs, no one touches a terminal.
      </p>
      <div className="mt-8 sm:mt-10 flex flex-wrap gap-3">
        {demo ? (
          <Link href="/dashboard" className="btn-gold">Try the demo &rarr;</Link>
        ) : session ? (
          <Link href="/dashboard" className="btn-gold">Go to dashboard &rarr;</Link>
        ) : (
          <button onClick={() => signIn("github", { callbackUrl: "/dashboard" })} className="btn-gold">
            Connect your repo
          </button>
        )}
        <a href="#how" className="btn-ghost">See how it works</a>
      </div>
    </section>
  );
}
