import type { CandlestickData, UTCTimestamp } from "lightweight-charts";

export type TwelveIntervalParam =
  | "1min"
  | "5min"
  | "15min"
  | "1h"
  | "4h"
  | "1day";

export const XAUUSD_TIMEFRAMES: {
  label: string;
  interval: TwelveIntervalParam;
}[] = [
  { label: "M1", interval: "1min" },
  { label: "M5", interval: "5min" },
  { label: "M15", interval: "15min" },
  { label: "H1", interval: "1h" },
  { label: "H4", interval: "4h" },
  { label: "D1", interval: "1day" },
];

type TwelveTsRow = {
  datetime: string;
  open: string;
  high: string;
  low: string;
  close: string;
};

export function parseTwelveDatetimeUtcSec(datetime: string): UTCTimestamp {
  const normalized =
    datetime.includes("T") || datetime.endsWith("Z")
      ? datetime
      : `${datetime.replace(" ", "T")}Z`;
  const ms = Date.parse(normalized);
  const sec = Math.floor(ms / 1000);
  return sec as UTCTimestamp;
}

export async function fetchXauUsdTimeSeries(
  interval: TwelveIntervalParam,
  outputsize: number,
): Promise<CandlestickData[]> {
  const params = new URLSearchParams({
    interval,
    outputsize: String(Math.min(5000, Math.max(1, outputsize))),
  });

  let res: Response;
  try {
    res = await fetch(`/api/twelvedata/time-series?${params}`, {
      cache: "no-store",
    });
  } catch {
    throw new Error("Failed to fetch candle data");
  }
  const json = (await res.json()) as {
    values?: TwelveTsRow[];
    status?: string;
    code?: number;
    message?: string;
    debug?: string;
  };

  if (!res.ok || json.status === "error") {
    const parts = [json.message ?? `Request failed (${res.status})`];
    if (json.debug) parts.push(json.debug);
    throw new Error(parts.join(" — "));
  }

  const values = json.values;
  if (!values?.length) {
    throw new Error(json.message ?? "No historical candles returned");
  }

  const mapped = values
    .map((row): CandlestickData | null => {
      const time = parseTwelveDatetimeUtcSec(row.datetime);
      const open = Number(row.open);
      const high = Number(row.high);
      const low = Number(row.low);
      const close = Number(row.close);
      if (![open, high, low, close].every(Number.isFinite)) return null;
      return { time, open, high, low, close };
    })
    .filter((x): x is CandlestickData => x != null)
    .sort((a, b) => (a.time as number) - (b.time as number));

  return mapped;
}

export type TwelvePriceHandler = (price: number, timestampMs: number) => void;

export function subscribeTwelveDataPrice(
  apiKey: string,
  symbol: string,
  onPrice: TwelvePriceHandler,
): () => void {
  let cleaned = false;
  let ws: WebSocket | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;

  const teardown = () => {
    if (cleaned) return;
    cleaned = true;
    if (heartbeat != null) {
      clearInterval(heartbeat);
      heartbeat = null;
    }
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
    ws = null;
  };

  try {
    ws = new WebSocket(
      `wss://ws.twelvedata.com/v1/quotes/price?apikey=${encodeURIComponent(apiKey)}`,
    );
  } catch {
    teardown();
    return teardown;
  }

  ws.onopen = () => {
    ws?.send(
      JSON.stringify({
        action: "subscribe",
        params: { symbols: symbol },
      }),
    );
    heartbeat = setInterval(() => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ action: "heartbeat" }));
      }
    }, 10_000);
  };

  ws.onmessage = (ev) => {
    try {
      const msg = JSON.parse(String(ev.data)) as {
        event?: string;
        price?: number | string;
        timestamp?: number;
      };
      if (msg.event === "price" || typeof msg.price === "number" || typeof msg.price === "string") {
        const raw = msg.price;
        const price =
          typeof raw === "number" ? raw : Number.parseFloat(String(raw ?? ""));
        const ts =
          typeof msg.timestamp === "number" ? msg.timestamp : Date.now();
        if (Number.isFinite(price)) {
          onPrice(price, ts);
        }
      }
    } catch {
      /* ignore malformed frames */
    }
  };

  ws.onerror = () => teardown();
  ws.onclose = () => teardown();

  return teardown;
}
