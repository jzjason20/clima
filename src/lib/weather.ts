type OpenWeatherGeoLocation = {
  country: string;
  lat: number;
  lon: number;
  name: string;
  state?: string;
};

type OpenWeatherCurrentResponse = {
  clouds: {
    all: number;
  };
  dt: number;
  main: {
    feels_like: number;
    humidity: number;
    pressure: number;
    temp: number;
    temp_max: number;
    temp_min: number;
  };
  name: string;
  sys: {
    country: string;
  };
  timezone: number;
  visibility: number;
  weather: Array<{
    description: string;
    icon: string;
    id: number;
    main: string;
  }>;
  wind: {
    deg?: number;
    gust?: number;
    speed: number;
  };
};

export type WeatherUnits = "metric" | "imperial";

export type WeatherThemeStyle = Record<`--${string}`, string>;

export type WeatherSnapshot = {
  city: string;
  cloudCover: number;
  condition: string;
  conditionGroup: string;
  country: string;
  feelsLike: number;
  high: number;
  humidity: number;
  iconCode: string;
  low: number;
  pressure: number;
  region?: string;
  temperature: number;
  timezoneOffset: number;
  units: WeatherUnits;
  updatedAt: number;
  visibility: number;
  windDegrees?: number;
  windGust?: number;
  windSpeed: number;
};

export const DEFAULT_CITY = "London";
export const DEFAULT_UNITS: WeatherUnits = "metric";

export class WeatherLookupError extends Error {
  code: "city-not-found" | "missing-api-key" | "upstream";

  constructor(
    code: "city-not-found" | "missing-api-key" | "upstream",
    message: string,
  ) {
    super(message);
    this.code = code;
    this.name = "WeatherLookupError";
  }
}

export function parseCity(value?: string | string[]) {
  const firstValue = Array.isArray(value) ? value[0] : value;
  const cleaned = firstValue?.trim().replace(/\s+/g, " ");

  return cleaned ? cleaned.slice(0, 80) : DEFAULT_CITY;
}

export function parseUnits(value?: string | string[]): WeatherUnits {
  const firstValue = Array.isArray(value) ? value[0] : value;

  return firstValue === "imperial" ? "imperial" : DEFAULT_UNITS;
}

function getApiKey() {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;

  if (!apiKey) {
    throw new WeatherLookupError(
      "missing-api-key",
      "Missing OPENWEATHERMAP_API_KEY in .env.local.",
    );
  }

  return apiKey;
}

async function fetchJson<T>(url: string, revalidate: number) {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
    },
    next: {
      revalidate,
    },
  });

  if (!response.ok) {
    throw new WeatherLookupError(
      "upstream",
      `OpenWeather request failed with ${response.status}.`,
    );
  }

  return (await response.json()) as T;
}

function titleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

function normalizeWeather(
  location: OpenWeatherGeoLocation,
  weather: OpenWeatherCurrentResponse,
  units: WeatherUnits,
): WeatherSnapshot {
  const currentCondition = weather.weather[0];

  return {
    city: location.name || weather.name,
    cloudCover: weather.clouds.all,
    condition: titleCase(
      currentCondition?.description ?? currentCondition?.main ?? "Unknown",
    ),
    conditionGroup: currentCondition?.main ?? "Unknown",
    country: location.country || weather.sys.country,
    feelsLike: weather.main.feels_like,
    high: weather.main.temp_max,
    humidity: weather.main.humidity,
    iconCode: currentCondition?.icon ?? "01d",
    low: weather.main.temp_min,
    pressure: weather.main.pressure,
    region: location.state,
    temperature: weather.main.temp,
    timezoneOffset: weather.timezone,
    units,
    updatedAt: weather.dt,
    visibility: weather.visibility,
    windDegrees: weather.wind.deg,
    windGust: weather.wind.gust,
    windSpeed: weather.wind.speed,
  };
}

export async function getWeatherSnapshot(input: {
  city?: string | string[];
  units?: string | string[] | WeatherUnits;
}) {
  const city = parseCity(input.city);
  const units = parseUnits(input.units);
  const apiKey = getApiKey();
  const geocodeUrl =
    `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}` +
    `&limit=1&appid=${apiKey}`;
  const geocode = await fetchJson<OpenWeatherGeoLocation[]>(geocodeUrl, 1800);
  const location = geocode[0];

  if (!location) {
    throw new WeatherLookupError(
      "city-not-found",
      `No weather gossip found for ${city}.`,
    );
  }

  const weatherUrl =
    `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}` +
    `&appid=${apiKey}&units=${units}`;
  const weather = await fetchJson<OpenWeatherCurrentResponse>(weatherUrl, 600);

  return normalizeWeather(location, weather, units);
}

export function formatTemperature(value: number, units: WeatherUnits) {
  const rounded = Math.round(value);
  const suffix = units === "metric" ? "C" : "F";

  return `${rounded}\u00b0${suffix}`;
}

export function formatPressure(value: number) {
  return `${Math.round(value)} mb`;
}

export function formatVisibility(value: number, units: WeatherUnits) {
  if (units === "metric") {
    return `${Math.round(value / 100) / 10} km`;
  }

  return `${Math.round((value / 1609.344) * 10) / 10} mi`;
}

export function formatWindSpeed(value: number, units: WeatherUnits) {
  if (units === "metric") {
    return `${Math.round(value * 3.6)} km/h`;
  }

  return `${Math.round(value)} mph`;
}

export function formatWindDirection(degrees?: number) {
  if (degrees === undefined) {
    return "Calm-ish";
  }

  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % directions.length;

  return directions[index];
}

export function formatLocationTime(unixTime: number, timezoneOffset: number) {
  const localDate = new Date((unixTime + timezoneOffset) * 1000);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: true,
    minute: "2-digit",
    timeZone: "UTC",
  }).format(localDate);
}

export function formatUpdatedLabel(unixTime: number) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: true,
    minute: "2-digit",
  }).format(new Date(unixTime * 1000));
}

export function formatPlace(weather: WeatherSnapshot) {
  return weather.region
    ? `${weather.city}, ${weather.region}, ${weather.country}`
    : `${weather.city}, ${weather.country}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function mix(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

function toCelsius(value: number, units: WeatherUnits) {
  if (units === "metric") {
    return value;
  }

  return ((value - 32) * 5) / 9;
}

export function getTemperatureThemeStyle(
  temperature: number,
  units: WeatherUnits,
): WeatherThemeStyle {
  const celsius = toCelsius(temperature, units);
  const ratio = clamp((celsius + 8) / 46, 0, 1);
  const hueStart = Math.round(mix(218, 28, ratio));
  const hueMid = Math.round(mix(205, 24, ratio));
  const hueEnd = Math.round(mix(195, 18, ratio));
  const accentHue = Math.round(mix(205, 36, ratio));
  const startLight = Math.round(mix(18, 24, ratio));
  const midLight = Math.round(mix(30, 44, ratio));
  const endLight = Math.round(mix(42, 60, ratio));

  return {
    "--page-start": `hsl(${hueStart} 64% ${startLight}%)`,
    "--page-mid": `hsl(${hueMid} 72% ${midLight}%)`,
    "--page-end": `hsl(${hueEnd} 84% ${endLight}%)`,
    "--page-glow": `hsl(${accentHue} 95% 74% / 0.28)`,
    "--shell-bg": `hsl(${hueStart} 54% 10% / 0.54)`,
    "--panel-bg": `hsl(${hueStart} 44% 9% / 0.34)`,
    "--panel-soft": `hsl(${accentHue} 84% 94% / 0.12)`,
    "--panel-strong": `hsl(${hueStart} 42% 10% / 0.64)`,
    "--border-soft": `hsl(${accentHue} 88% 94% / 0.18)`,
    "--accent": `hsl(${accentHue} 90% 80%)`,
    "--accent-soft": `hsl(${accentHue} 96% 92% / 0.88)`,
    "--accent-strong": `hsl(${accentHue} 100% 97%)`,
    "--hero-temp": `hsl(${accentHue} 100% 97%)`,
    "--hero-temp-shadow": `hsl(${accentHue} 95% 72% / 0.32)`,
    "--text-primary": "#f8fbff",
    "--text-secondary": "rgba(240, 249, 255, 0.84)",
    "--text-muted": "rgba(226, 232, 240, 0.68)",
    "--cta-text": `hsl(${hueStart} 48% 12%)`,
    "--shadow-color": `hsl(${hueStart} 58% 8% / 0.42)`,
  };
}
