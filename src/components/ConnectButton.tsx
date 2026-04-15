"use client";

import { signIn, useSession } from "next-auth/react";
import Link from "next/link";

interface Props {
  className?: string;
  shortLabel?: string;
  longLabel?: string;
}

export default function ConnectButton({
  className = "btn-gold text-sm py-2 px-3 sm:px-5",
  shortLabel = "Try it",
  longLabel = "Connect your repo",
}: Props) {
  const { data: session, status } = useSession();
  const demo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  if (demo || (status === "authenticated" && session)) {
    return (
      <Link href="/dashboard" className={className}>
        <span className="hidden sm:inline">{demo ? "Open dashboard" : "Dashboard"}</span>
        <span className="sm:hidden">{shortLabel}</span>
      </Link>
    );
  }

  return (
    <button
      onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
      className={className}
    >
      <span className="hidden sm:inline">{longLabel}</span>
      <span className="sm:hidden">{shortLabel}</span>
    </button>
  );
}
