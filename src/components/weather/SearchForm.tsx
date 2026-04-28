"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, startTransition, useState } from "react";

type SearchFormProps = {
  city: string;
};

export function SearchForm({ city }: SearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [draftCity, setDraftCity] = useState(city);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams(searchParams.toString());
    const nextCity = draftCity.trim();

    if (nextCity) {
      params.set("city", nextCity);
    } else {
      params.delete("city");
    }

    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  }

  return (
    <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="city-search">
        Search city weather
      </label>
      <input
        id="city-search"
        name="city"
        autoComplete="off"
        className="h-12 min-w-0 flex-1 rounded-full border border-[color:var(--border-soft)] bg-[var(--panel-strong)] px-5 text-base text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[color:var(--accent)]"
        onChange={(event) => setDraftCity(event.target.value)}
        placeholder="Search a city. London? Karachi? Sao Paulo?"
        value={draftCity}
      />
      <button
        className="h-12 rounded-full bg-[var(--accent)] px-5 text-sm font-semibold tracking-[0.2em] text-[var(--cta-text)] transition hover:bg-[var(--accent-strong)]"
        type="submit"
      >
        CHECK IT
      </button>
    </form>
  );
}
