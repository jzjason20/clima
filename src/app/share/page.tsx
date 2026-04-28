import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";

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
  type WeatherSnapshot,
} from "@/lib/weather";

type SharePageProps = {
  searchParams?: Promise<{
    city?: string | string[];
    units?: string | string[];
  }>;
};

function buildShareQuery(weather: Pick<WeatherSnapshot, "city" | "units">) {
  return new URLSearchParams({
    city: weather.city,
    units: weather.units,
  }).toString();
}

function buildShareDescription(weather: WeatherSnapshot) {
  return `${weather.condition} and ${formatTemperature(weather.temperature, weather.units)} in ${formatPlace(weather)}. Feels like ${formatTemperature(weather.feelsLike, weather.units)} with a high/low of ${formatTemperature(weather.high, weather.units)} / ${formatTemperature(weather.low, weather.units)}.`;
}

function ShareErrorCard({ city, error }: { city: string; error: unknown }) {
  const message =
    error instanceof WeatherLookupError
      ? error.message
      : "The weather goblin lost the share receipt.";

  return (
    <div className="weather-shell flex min-h-screen items-center justify-center px-6 py-16 text-[var(--text-primary)] sm:px-8">
      <div className="w-full max-w-2xl rounded-4xl border border-[color:var(--border-soft)] bg-[var(--shell-bg)] p-8 shadow-[0_30px_80px_var(--shadow-color)] backdrop-blur">
        <p className="text-sm uppercase tracking-[0.35em] text-[var(--accent-soft)]">
          clima share
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">
          Share preview unavailable
        </h1>
        <p className="mt-4 text-lg leading-8 text-[var(--text-secondary)]">
          {message}
        </p>
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          Asked city:{" "}
          <span className="font-semibold text-[var(--text-primary)]">
            {city}
          </span>
        </p>
        <Link
          className="mt-6 inline-flex h-11 items-center rounded-full bg-[var(--accent)] px-5 text-sm font-semibold tracking-[0.2em] text-[var(--cta-text)] transition hover:bg-[var(--accent-strong)]"
          href="/"
        >
          BACK HOME
        </Link>
      </div>
    </div>
  );
}

export async function generateMetadata({
  searchParams,
}: SharePageProps): Promise<Metadata> {
  const resolvedParams = (await searchParams) ?? {};
  const city = parseCity(resolvedParams.city);
  const units = parseUnits(resolvedParams.units);

  try {
    const weather = await getWeatherSnapshot({ city, units });
    const query = buildShareQuery(weather);
    const description = buildShareDescription(weather);
    const imageUrl = `/api/share-card?${query}`;

    return {
      title: `${weather.city} weather share`,
      description,
      openGraph: {
        title: `Weather gossip`,
        description,
        images: [
          {
            alt: `Weather share card for ${weather.city}`,
            height: 630,
            url: imageUrl,
            width: 1200,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        description,
        images: [imageUrl],
        title: `Weather gossip for ${weather.city}`,
      },
    };
  } catch {
    return {
      title: `${city} weather share`,
      description: `Shareable weather preview for ${city}.`,
    };
  }
}

export default async function SharePage({ searchParams }: SharePageProps) {
  const resolvedParams = (await searchParams) ?? {};
  const city = parseCity(resolvedParams.city);
  const units = parseUnits(resolvedParams.units);
  let weather;

  try {
    weather = await getWeatherSnapshot({ city, units });
  } catch (error) {
    return <ShareErrorCard city={city} error={error} />;
  }

  const themeStyle = getTemperatureThemeStyle(
    weather.temperature,
    weather.units,
  );
  const shareQuery = buildShareQuery(weather);
  const imagePath = `/api/share-card?${shareQuery}`;
  const homePath = `/?${shareQuery}`;
  const detailStats = [
    {
      label: "Feels like",
      value: formatTemperature(weather.feelsLike, weather.units),
    },
    {
      label: "High / low",
      value: `${formatTemperature(weather.high, weather.units)} / ${formatTemperature(weather.low, weather.units)}`,
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
    {
      label: "Humidity",
      value: `${weather.humidity}%`,
    },
  ];

  return (
    <div
      className="weather-shell min-h-screen px-6 py-10 text-[var(--text-primary)] sm:px-8 lg:px-12"
      style={themeStyle as CSSProperties}
    >
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 rounded-4xl border border-[color:var(--border-soft)] bg-[var(--shell-bg)] p-6 shadow-[0_30px_80px_var(--shadow-color)] backdrop-blur xl:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-[var(--accent-soft)]">
              clima share
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Forecast card for {weather.city}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg">
              This is the link-friendly version for Discord, group chats, and
              general weather yapping.
            </p>
          </div>

          <div className="rounded-3xl border border-[color:var(--border-soft)] bg-[var(--panel-soft)] px-5 py-4 text-sm text-[var(--text-secondary)]">
            <p className="font-medium text-[var(--text-primary)]">
              {formatPlace(weather)}
            </p>
            <p className="mt-2">
              Local time{" "}
              {formatLocationTime(weather.updatedAt, weather.timezoneOffset)}
            </p>
            <p className="mt-1">
              Updated at {formatUpdatedLabel(weather.updatedAt)}
            </p>
          </div>
        </div>

        <section className="grid gap-6 rounded-[1.75rem] border border-[color:var(--border-soft)] bg-[var(--panel-bg)] p-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[1.5rem] border border-[color:var(--border-soft)] bg-[var(--panel-soft)] p-6 sm:p-8">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent-soft)]">
              Share card
            </p>
            <div className="mt-6 flex flex-wrap items-end gap-4">
              <p className="text-7xl font-semibold tracking-[-0.06em] text-[var(--hero-temp)] [text-shadow:0_8px_28px_var(--hero-temp-shadow)] sm:text-8xl">
                {formatTemperature(weather.temperature, weather.units)}
              </p>
              <div className="pb-3 text-[var(--text-secondary)]">
                <p className="text-2xl font-medium text-[var(--text-primary)]">
                  {weather.condition}
                </p>
                <p className="mt-2 text-base">{weather.conditionGroup}</p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.25rem] border border-[color:var(--border-soft)] bg-[var(--panel-strong)] p-5">
                <p className="text-sm uppercase tracking-[0.25em] text-[var(--text-muted)]">
                  Feels like
                </p>
                <p className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">
                  {formatTemperature(weather.feelsLike, weather.units)}
                </p>
              </div>
              <div className="rounded-[1.25rem] border border-[color:var(--border-soft)] bg-[var(--panel-strong)] p-5">
                <p className="text-sm uppercase tracking-[0.25em] text-[var(--text-muted)]">
                  High / low
                </p>
                <p className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">
                  {formatTemperature(weather.high, weather.units)} /{" "}
                  {formatTemperature(weather.low, weather.units)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-[color:var(--border-soft)] bg-[var(--panel-strong)] p-6 sm:p-8">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent-soft)]">
              Ready to post
            </p>
            <div className="mt-6 grid gap-4">
              {detailStats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center justify-between gap-4 border-b border-[color:var(--border-soft)] pb-4 last:border-b-0 last:pb-0"
                >
                  <p className="text-sm uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    {stat.label}
                  </p>
                  <p className="text-right text-lg font-medium text-[var(--text-primary)]">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            className="flex h-11 items-center rounded-full border border-[color:var(--border-soft)] bg-[var(--panel-soft)] px-4 text-sm font-medium text-[var(--text-primary)] transition hover:border-[color:var(--accent)] hover:bg-[var(--panel-strong)]"
            href={homePath}
          >
            Back to dashboard
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
      </main>
    </div>
  );
}
