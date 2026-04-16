"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar({ activeRepo }: { activeRepo?: string }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const demo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  return (
    <header className="px-4 sm:px-6 py-4 border-b border-border-subtle">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-md bg-gold/10 border border-gold/30 flex items-center justify-center">
              <span className="text-gold font-bold text-sm">M</span>
            </div>
            <span className="font-semibold tracking-tight">
              <span className="text-text">Mark</span><span className="text-gold">In</span>
            </span>
          </Link>
          {activeRepo && (
            <div className="hidden sm:flex items-center gap-2 text-sm min-w-0">
              <span className="text-text-dim">·</span>
              <span className="text-text-muted truncate">{activeRepo.split("/").pop()}</span>
            </div>
          )}
        </div>

        <nav className="hidden md:flex items-center gap-5 text-sm">
          <Link href="/dashboard" className="text-text-muted hover:text-text">Editor</Link>
          <Link href="/dashboard/drafts" className="text-text-muted hover:text-text">Drafts</Link>
          <Link href="/dashboard/scheduled" className="text-text-muted hover:text-text">Scheduled</Link>
          <Link href="/dashboard/history" className="text-text-muted hover:text-text">History</Link>
          <ThemeToggle />
          {session?.user ? (
            <div className="flex items-center gap-3 pl-4 border-l border-border-subtle">
              {session.user.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={session.user.image} alt={session.user.name ?? ""} className="w-7 h-7 rounded-full" />
              )}
              <button onClick={() => signOut({ callbackUrl: "/" })} className="text-text-dim hover:text-text text-xs">
                Sign out
              </button>
            </div>
          ) : demo ? (
            <span className="text-xs text-gold font-mono px-2 py-1 border border-gold/30 rounded">DEMO</span>
          ) : null}
        </nav>

        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            className="w-8 h-8 rounded-md border border-border text-text-muted hover:text-gold hover:border-gold transition flex items-center justify-center"
          >
            {open ? "✕" : "≡"}
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden mt-4 flex flex-col gap-2 text-sm border-t border-border-subtle pt-4">
          <Link onClick={() => setOpen(false)} href="/dashboard" className="text-text-muted hover:text-text py-1">Editor</Link>
          <Link onClick={() => setOpen(false)} href="/dashboard/drafts" className="text-text-muted hover:text-text py-1">Drafts</Link>
          <Link onClick={() => setOpen(false)} href="/dashboard/scheduled" className="text-text-muted hover:text-text py-1">Scheduled</Link>
          <Link onClick={() => setOpen(false)} href="/dashboard/history" className="text-text-muted hover:text-text py-1">History</Link>
          {activeRepo && (
            <div className="text-xs text-text-dim pt-2 border-t border-border-subtle">{activeRepo.split("/").pop()}</div>
          )}
          {session?.user && (
            <button onClick={() => signOut({ callbackUrl: "/" })} className="text-left text-text-dim hover:text-text text-xs pt-2">
              Sign out
            </button>
          )}
          {demo && !session?.user && (
            <span className="text-xs text-gold font-mono">DEMO MODE</span>
          )}
        </nav>
      )}
    </header>
  );
}
