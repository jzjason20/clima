"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ShareActionsProps = {
  imagePath: string;
  sharePath: string;
};

export function ShareActions({ imagePath, sharePath }: ShareActionsProps) {
  const [copyLabel, setCopyLabel] = useState("Copy share link");

  useEffect(() => {
    if (copyLabel === "Copy share link") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCopyLabel("Copy share link");
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [copyLabel]);

  async function handleCopy() {
    try {
      const url = new URL(sharePath, window.location.origin);
      await navigator.clipboard.writeText(url.toString());
      setCopyLabel("Link copied");
    } catch {
      setCopyLabel("Copy failed");
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        className="h-11 rounded-full border border-[color:var(--border-soft)] bg-[var(--panel-soft)] px-4 text-sm font-medium text-[var(--text-primary)] transition hover:border-[color:var(--accent)] hover:bg-[var(--panel-strong)]"
        onClick={handleCopy}
        type="button"
      >
        {copyLabel}
      </button>
      <Link
        className="flex h-11 items-center rounded-full border border-[color:var(--border-soft)] bg-[var(--panel-soft)] px-4 text-sm font-medium text-[var(--text-primary)] transition hover:border-[color:var(--accent)] hover:bg-[var(--panel-strong)]"
        href={sharePath}
      >
        Open share page
      </Link>
      <Link
        className="flex h-11 items-center rounded-full bg-[var(--accent)] px-4 text-sm font-medium text-[var(--cta-text)] transition hover:bg-[var(--accent-strong)]"
        href={imagePath}
        rel="noreferrer"
        target="_blank"
      >
        Open PNG card
      </Link>
    </div>
  );
}
