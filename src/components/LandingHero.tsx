"use client";

import ConnectButton from "./ConnectButton";

export default function LandingHero() {
  return (
    <section className="px-4 sm:px-8 pt-20 sm:pt-32 pb-16 sm:pb-24 max-w-5xl mx-auto w-full">
      <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05]">
        Update your website copy in minutes
        <span className="block text-text-muted font-light mt-2">without engineers.</span>
      </h1>

      <p className="mt-8 max-w-2xl text-lg sm:text-xl text-text leading-relaxed">
        MarkIn lets founders and marketers change live site content using plain English.
        No Git. No code. No delays.
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <ConnectButton
          className="btn-gold text-base px-6 py-3"
          longLabel="Connect your site →"
          shortLabel="Connect site →"
        />
        <a href="#how" className="text-text-muted hover:text-text text-sm">
          See how it works ↓
        </a>
      </div>

      <p className="mt-6 text-sm text-text-dim">
        Works with your existing Next.js + Vercel setup.
      </p>
    </section>
  );
}
