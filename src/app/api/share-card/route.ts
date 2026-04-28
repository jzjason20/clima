import { ImageResponse } from "next/og";

import {
  ShareCardErrorImage,
  ShareCardImage,
} from "@/components/weather/ShareCardImage";
import {
  getWeatherSnapshot,
  parseCity,
  parseUnits,
  WeatherLookupError,
} from "@/lib/weather";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = parseCity(searchParams.get("city") ?? undefined);
  const units = parseUnits(searchParams.get("units") ?? undefined);

  try {
    const weather = await getWeatherSnapshot({ city, units });

    return new ImageResponse(ShareCardImage({ weather }), {
      width: 1200,
      height: 630,
    });
  } catch (error) {
    const message =
      error instanceof WeatherLookupError
        ? error.message
        : "The weather goblin fumbled the share card.";
    const status =
      error instanceof WeatherLookupError && error.code === "city-not-found"
        ? 404
        : 500;

    return new ImageResponse(ShareCardErrorImage({ city, message }), {
      width: 1200,
      height: 630,
      status,
    });
  }
}
