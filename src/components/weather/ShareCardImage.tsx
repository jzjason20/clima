import type { ReactElement } from "react";

import {
  formatLocationTime,
  formatPressure,
  formatTemperature,
  formatVisibility,
  formatWindDirection,
  formatWindSpeed,
  getTemperatureThemeStyle,
  type WeatherSnapshot,
} from "@/lib/weather";

type ShareCardImageProps = {
  weather: WeatherSnapshot;
};

type ShareCardErrorImageProps = {
  city: string;
  message: string;
};

function StatPill({
  label,
  theme,
  value,
}: {
  label: string;
  theme: ReturnType<typeof getTemperatureThemeStyle>;
  value: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        minWidth: 0,
        padding: "22px 24px",
        borderRadius: 28,
        border: `1px solid ${theme["--border-soft"]}`,
        background: theme["--panel-strong"],
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 16,
          letterSpacing: "0.28em",
          opacity: 0.74,
          textTransform: "uppercase",
          color: theme["--text-muted"],
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 32,
          fontWeight: 700,
          color: theme["--text-primary"],
        }}
      >
        {value}
      </div>
    </div>
  );
}

export function ShareCardImage({ weather }: ShareCardImageProps): ReactElement {
  const theme = getTemperatureThemeStyle(weather.temperature, weather.units);
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
      label: "Wind",
      value: `${formatWindDirection(weather.windDegrees)} ${formatWindSpeed(weather.windSpeed, weather.units)}`,
    },
    {
      label: "Visibility",
      value: formatVisibility(weather.visibility, weather.units),
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        padding: 42,
        backgroundColor: theme["--page-end"],
        backgroundImage: `radial-gradient(circle at top left, ${theme["--page-glow"]}, transparent 38%), linear-gradient(160deg, ${theme["--page-start"]} 0%, ${theme["--page-mid"]} 52%, ${theme["--page-end"]} 100%)`,
        color: theme["--text-primary"],
        fontFamily:
          'var(--font-geist-sans), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "space-between",
          borderRadius: 36,
          border: `1px solid ${theme["--border-soft"]}`,
          background: theme["--shell-bg"],
          boxShadow: `0 30px 80px ${theme["--shadow-color"]}`,
          padding: 38,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 24,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                display: "flex",
                fontSize: 16,
                letterSpacing: "0.38em",
                textTransform: "uppercase",
                color: theme["--accent-soft"],
              }}
            >
              clima share
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 54,
                fontWeight: 700,
                lineHeight: 1.02,
                maxWidth: 580,
              }}
            >
              Weather gossip
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 24,
                color: theme["--text-secondary"],
              }}
            >
              {weather.condition} with the dramatic feels-like stat included.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              padding: "18px 20px",
              borderRadius: 24,
              border: `1px solid ${theme["--border-soft"]}`,
              background: theme["--panel-soft"],
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 18,
                color: theme["--text-secondary"],
              }}
            >
              Local time{" "}
              {formatLocationTime(weather.updatedAt, weather.timezoneOffset)}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "stretch",
            gap: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              flex: 1.1,
              gap: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 18,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 132,
                  lineHeight: 0.88,
                  fontWeight: 800,
                  color: theme["--hero-temp"],
                }}
              >
                {formatTemperature(weather.temperature, weather.units)}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  paddingBottom: 18,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: 34,
                    fontWeight: 700,
                  }}
                >
                  {weather.conditionGroup}
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: 24,
                    color: theme["--text-secondary"],
                  }}
                >
                  Pressure {formatPressure(weather.pressure)}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 22,
                color: theme["--text-secondary"],
              }}
            >
              Feels like {formatTemperature(weather.feelsLike, weather.units)}{" "}
              and visibility at{" "}
              {formatVisibility(weather.visibility, weather.units)}.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flex: 0.95,
              flexWrap: "wrap",
              gap: 18,
            }}
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                style={{ display: "flex", width: "calc(50% - 9px)" }}
              >
                <StatPill label={stat.label} theme={theme} value={stat.value} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ShareCardErrorImage({
  city,
  message,
}: ShareCardErrorImageProps): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        padding: 42,
        backgroundColor: "#09111f",
        backgroundImage:
          "radial-gradient(circle at top left, rgba(125, 211, 252, 0.2), transparent 38%), linear-gradient(160deg, #09111f 0%, #13263f 52%, #24486b 100%)",
        color: "#f8fbff",
        fontFamily:
          'var(--font-geist-sans), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
          gap: 18,
          borderRadius: 36,
          border: "1px solid rgba(255,255,255,0.14)",
          background: "rgba(7, 18, 39, 0.58)",
          padding: 42,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 16,
            letterSpacing: "0.36em",
            textTransform: "uppercase",
            color: "rgba(219, 234, 254, 0.84)",
          }}
        >
          clima share
        </div>
        <div style={{ display: "flex", fontSize: 72, fontWeight: 700 }}>
          Forecast unavailable
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 26,
            color: "rgba(235, 245, 255, 0.82)",
            maxWidth: 860,
          }}
        >
          {message}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: "rgba(191, 219, 254, 0.72)",
          }}
        >
          Requested city: {city}
        </div>
      </div>
    </div>
  );
}
