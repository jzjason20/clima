import type { CSSProperties } from "react";

import { SearchForm } from "@/components/weather/SearchForm";
import { ShareActions } from "@/components/weather/ShareActions";
import { UnitToggle } from "@/components/weather/UnitToggle";
import {
  formatLocationTime,
  formatPlace,
  formatPressure,
  formatTemperature,
  formatUpdatedLabel,
  formatVisibility,
  formatWindDirection,
  formatWindSpeed,
  getTemperatureThemeStyle,
  getWeatherSnapshot,
  parseCity,
  parseUnits,
  WeatherLookupError,
} from "@/lib/weather";

type HomeProps = {
  searchParams?: Promise<{
    city?: string | string[];
    units?: string | string[];
  }>;
};

function ErrorCard({ city, error }: { city: string; error: unknown }) {
  const message =
    error instanceof WeatherLookupError
      ? error.message
      : "The weather goblin dropped the forecast. Try again in a sec.";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-slate-50">
      <div className="w-full max-w-xl rounded-4xl border border-white/10 bg-white/8 p-8 shadow-2xl shadow-slate-950/60 backdrop-blur">
        <p className="text-sm uppercase tracking-[0.35em] text-sky-200/80">
          clima
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">
          Forecast unavailable
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-300">{message}</p>
        <p className="mt-3 text-sm text-slate-400">
          Asked city:{" "}
          <span className="font-semibold text-slate-100">{city}</span>
        </p>
      </div>
    </div>
  );
}

export default async function Home({ searchParams }: HomeProps) {
  const resolvedParams = (await searchParams) ?? {};
  const city = parseCity(resolvedParams.city);
  const units = parseUnits(resolvedParams.units);
  let weather;

  try {
    weather = await getWeatherSnapshot({ city, units });
  } catch (error) {
    return <ErrorCard city={city} error={error} />;
  }

  const stats = [
    {
      label: "Feels like",
      value: formatTemperature(weather.feelsLike, weather.units),
    },
    {
      label: "High / low",
      value: `${formatTemperature(weather.high, weather.units)} / ${formatTemperature(weather.low, weather.units)}`,
    },
    {
      label: "Humidity",
      value: `${weather.humidity}%`,
    },
    {
      label: "Wind",
      value: `${formatWindDirection(weather.windDegrees)} ${formatWindSpeed(weather.windSpeed, weather.units)}`,
    },
    {
      label: "Visibility",
      value: formatVisibility(weather.visibility, weather.units),
    },
    {
      label: "Pressure",
      value: formatPressure(weather.pressure),
    },
  ];
  const shareQuery = new URLSearchParams({
    city: weather.city,
    units: weather.units,
  }).toString();
  const sharePath = `/share?${shareQuery}`;
  const imagePath = `/api/share-card?${shareQuery}`;
  const themeStyle = getTemperatureThemeStyle(
    weather.temperature,
    weather.units,
  );

  return (
    <div
      className="weather-shell min-h-screen px-6 py-10 text-[var(--text-primary)] sm:px-8 lg:px-12"
      style={themeStyle as CSSProperties}
    >
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 pt-8 xl:pt-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-[var(--accent-soft)] font-medium">
              clima
            </p>
            <h1 className="mt-4 max-w-2xl text-5xl font-medium tracking-tight text-balance sm:text-6xl lg:text-7xl">
              Weather gossip for {weather.city}
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-7 text-[var(--text-secondary)] sm:text-xl">
              Current weather, the dramatic feels-like number, and the rest of
              the atmospheric tea.
            </p>
          </div>

          <div className="rounded-3xl bg-[var(--panel-soft)] px-5 py-4 text-sm text-[var(--text-secondary)] shadow-sm backdrop-blur-md">
            <p className="font-medium text-[var(--text-primary)] text-base">
              {formatPlace(weather)}
            </p>
            <p className="mt-1">
              Local time{" "}
              {formatLocationTime(weather.updatedAt, weather.timezoneOffset)}
            </p>
            <p className="mt-0.5 text-[var(--text-muted)] text-xs">
              Updated at {formatUpdatedLabel(weather.updatedAt)}
            </p>
          </div>
        </div>

        <section className="grid gap-6 rounded-[2rem] border border-[color:var(--border-soft)] bg-[var(--shell-bg)] p-6 lg:grid-cols-[1fr_auto] lg:items-center shadow-lg backdrop-blur-xl">
          <div className="space-y-3 max-w-xl">
            <SearchForm city={city} />
            <p className="text-sm text-[var(--text-secondary)] pl-2">
              Search a city, flip the units, then grab a pretty card image for
              your group chat overreacting.
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <UnitToggle units={weather.units} />
            <ShareActions imagePath={imagePath} sharePath={sharePath} />
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-[2.5rem] bg-[var(--panel-soft)] p-8 sm:p-10 shadow-lg backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent-soft)] font-medium mb-8">
              Current Vibe
            </p>
            <div className="flex flex-col gap-6">
              <p className="text-[7rem] leading-none font-medium tracking-tighter text-[var(--hero-temp)] [text-shadow:0_8px_32px_var(--hero-temp-shadow)] sm:text-[9rem]">
                {formatTemperature(weather.temperature, weather.units)}
              </p>
              <div className="text-[var(--text-secondary)] mt-2">
                <p className="text-3xl font-medium text-[var(--text-primary)]">
                  {weather.condition}
                </p>
                <p className="mt-2 text-lg opacity-90">
                  {weather.conditionGroup}
                </p>
              </div>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-[var(--panel-strong)] p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.25em] text-[var(--text-muted)] font-medium">
                  The Drama (Feels Like)
                </p>
                <p className="mt-3 text-4xl font-medium text-[var(--text-primary)] tracking-tight">
                  {formatTemperature(weather.feelsLike, weather.units)}
                </p>
              </div>
              <div className="rounded-3xl bg-[var(--panel-strong)] p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.25em] text-[var(--text-muted)] font-medium">
                  The Range (High/Low)
                </p>
                <p className="mt-3 text-4xl font-medium text-[var(--text-primary)] tracking-tight">
                  {formatTemperature(weather.high, weather.units)} /{" "}
                  {formatTemperature(weather.low, weather.units)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2.5rem] bg-[var(--panel-soft)] p-8 sm:p-10 shadow-lg backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent-soft)] font-medium mb-8">
              Nerd Details
            </p>
            <div className="flex flex-col gap-6">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center justify-between gap-4 border-b border-[color:var(--border-soft)]/50 pb-5 last:border-b-0 last:pb-0"
                >
                  <p className="text-sm uppercase tracking-[0.15em] text-[var(--text-secondary)] font-medium">
                    {stat.label}
                  </p>
                  <p className="text-right text-xl font-medium text-[var(--text-primary)] tracking-tight">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
