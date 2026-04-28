"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { startTransition } from "react";

import type { WeatherUnits } from "@/lib/weather";

type UnitToggleProps = {
  units: WeatherUnits;
};

const OPTIONS: Array<{ label: string; value: WeatherUnits }> = [
  { label: "Metric", value: "metric" },
  { label: "Imperial", value: "imperial" },
];

export function UnitToggle({ units }: UnitToggleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setUnits(nextUnits: WeatherUnits) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("units", nextUnits);

    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  }

  return (
    <div className="inline-flex rounded-full border border-[color:var(--border-soft)] bg-[var(--panel-strong)] p-1">
      {OPTIONS.map((option) => {
        const isActive = option.value === units;

        return (
          <button
            key={option.value}
            aria-pressed={isActive}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-[var(--accent)] text-[var(--cta-text)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
            onClick={() => setUnits(option.value)}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
