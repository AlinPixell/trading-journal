import { execFile } from "node:child_process";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_INTERVALS = new Set([
  "1min",
  "5min",
  "15min",
  "1h",
  "4h",
  "1day",
]);

function curlGet(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      "curl",
      [
        "--silent",
        "--show-error",
        "--max-time", "20",
        "--retry", "2",
        "--retry-delay", "1",
        "--retry-connrefused",
        "--compressed",
        "--header", "Accept: application/json",
        "--header", "User-Agent: TradeJournal/1.0",
        url,
      ],
      { maxBuffer: 8 * 1024 * 1024, timeout: 25_000 },
      (err, stdout, stderr) => {
        if (err) {
          reject(new Error(`curl failed: ${stderr || err.message}`));
        } else {
          resolve(stdout);
        }
      },
    );
  });
}

export async function GET(req: NextRequest) {
  const apiKey =
    process.env.TWELVE_DATA_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_TWELVE_DATA_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json(
      { status: "error", message: "Missing Twelve Data API key on server" },
      { status: 500 },
    );
  }

  const interval = req.nextUrl.searchParams.get("interval") ?? "1h";
  const outputsizeRaw = req.nextUrl.searchParams.get("outputsize") ?? "500";

  if (!ALLOWED_INTERVALS.has(interval)) {
    return NextResponse.json(
      { status: "error", message: "Invalid interval" },
      { status: 400 },
    );
  }

  const parsedSize = Number.parseInt(outputsizeRaw, 10);
  const outputsize = Number.isFinite(parsedSize)
    ? Math.min(5000, Math.max(1, parsedSize))
    : 500;

  const url = new URL("https://api.twelvedata.com/time_series");
  url.searchParams.set("symbol", "XAU/USD");
  url.searchParams.set("interval", interval);
  url.searchParams.set("outputsize", String(outputsize));
  url.searchParams.set("apikey", apiKey);

  try {
    const body = await curlGet(url.toString());

    let payload: unknown;
    try {
      payload = JSON.parse(body);
    } catch {
      console.error("[twelvedata] non-JSON body:", body.slice(0, 300));
      return NextResponse.json(
        { status: "error", message: "Twelve Data returned unexpected response" },
        { status: 502 },
      );
    }

    return NextResponse.json(payload);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("[twelvedata/time-series]", detail);
    return NextResponse.json(
      { status: "error", message: detail },
      { status: 502 },
    );
  }
}
