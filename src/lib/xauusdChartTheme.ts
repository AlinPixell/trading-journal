import {
  ColorType,
  CrosshairMode,
  createChart,
} from "lightweight-charts";
import type {
  CandlestickSeriesPartialOptions,
  DeepPartial,
  ChartOptions,
  IChartApi,
  ISeriesApi,
} from "lightweight-charts";

/** Trades workspace: black session, white/grey candles, grey crosshair (XAUUSD chart pane). */
export function createTradesSessionChart(container: HTMLElement): {
  chart: IChartApi;
  series: ISeriesApi<"Candlestick">;
  dispose: () => void;
} {
  const grid = "rgba(255,255,255,0.06)";
  const axisBorder = "rgba(255,255,255,0.08)";
  const cross = "rgba(180,180,180,0.45)";
  const labelBg = "#141414";

  const chartOptions: DeepPartial<ChartOptions> = {
    layout: {
      attributionLogo: false,
      background: { type: ColorType.Solid, color: "#000000" },
      textColor: "rgba(255,255,255,0.62)",
      fontSize: 11,
    },
    grid: {
      vertLines: { color: grid },
      horzLines: { color: grid },
    },
    crosshair: {
      mode: CrosshairMode.Normal,
      vertLine: {
        color: cross,
        labelBackgroundColor: labelBg,
      },
      horzLine: {
        color: cross,
        labelBackgroundColor: labelBg,
      },
    },
    rightPriceScale: {
      borderColor: axisBorder,
      scaleMargins: { top: 0.08, bottom: 0.12 },
    },
    timeScale: {
      borderColor: axisBorder,
      timeVisible: true,
      secondsVisible: false,
    },
    localization: {
      locale:
        typeof navigator !== "undefined" && navigator.language && !navigator.language.startsWith("en-US")
          ? navigator.language
          : "en",
    },
  };

  const chart = createChart(container, chartOptions);

  const candleOpts: CandlestickSeriesPartialOptions = {
    upColor: "#ffffff",
    downColor: "#000000",
    borderUpColor: "#ffffff",
    borderDownColor: "#ffffff",
    wickUpColor: "rgba(255,255,255,0.72)",
    wickDownColor: "rgba(255,255,255,0.72)",
    borderVisible: true,
    priceLineVisible: true,
    lastValueVisible: true,
    priceFormat: {
      type: "price",
      precision: 0,
      minMove: 1,
    },
  };

  const series = chart.addCandlestickSeries(candleOpts);

  const ro =
    typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(() => {
          const { clientWidth, clientHeight } = container;
          chart.applyOptions({ width: clientWidth, height: clientHeight });
        })
      : null;
  ro?.observe(container);

  const dispose = () => {
    ro?.disconnect();
    chart.remove();
  };

  chart.applyOptions({
    width: container.clientWidth,
    height: container.clientHeight,
  });

  return { chart, series, dispose };
}
