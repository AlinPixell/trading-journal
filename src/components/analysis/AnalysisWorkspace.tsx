"use client";

import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import {
  loadAnalysisEntries,
  saveAnalysisEntries,
  XAUUSD_ANALYSIS_KEY,
} from "@/lib/xauusdTradeStorage";
import type { XauUsdAnalysisEntry } from "@/types/xauusd";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result ?? ""));
    r.onerror = () => reject(new Error("read failed"));
    r.readAsDataURL(file);
  });
}

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function AnalysisWorkspace() {
  const [entries, setEntries] = useState<XauUsdAnalysisEntry[]>(() => loadAnalysisEntries());
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string | null>(null);

  useEffect(() => {
    saveAnalysisEntries(entries);
  }, [entries]);

  const sorted = useMemo(
    () => [...entries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [entries],
  );

  const onPickScreenshot = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const url = await readFileAsDataUrl(file);
      setScreenshot(url);
      setScreenshotName(file.name);
    } catch {
      setScreenshot(null);
      setScreenshotName(null);
    }
  };

  const submit = () => {
    const t = title.trim();
    if (!t) return;
    const shot = screenshot ?? "";
    const row: XauUsdAnalysisEntry = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title: t,
      description: description.trim(),
      tags: parseTags(tagsRaw),
      screenshot: shot,
      createdAt: new Date().toISOString(),
    };
    setEntries((prev) => [row, ...prev]);
    setTitle("");
    setDescription("");
    setTagsRaw("");
    setScreenshot(null);
    setScreenshotName(null);
  };

  const remove = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <div className="rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/85 p-5 backdrop-blur-xl sm:p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
          Manual notes
        </p>
        <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Save an analysis</p>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Local only —{" "}
          <span className="font-mono text-[11px] text-[var(--text-muted)]">{XAUUSD_ANALYSIS_KEY}</span>
        </p>

        <div className="mt-5 space-y-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-[var(--text-secondary)]">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="min-h-11 w-full rounded-md border border-[var(--border-soft)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)]"
              placeholder="e.g. London sweep + FVG"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-[var(--text-secondary)]">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full resize-y rounded-md border border-[var(--border-soft)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)]"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-[var(--text-secondary)]">Tags</span>
            <input
              value={tagsRaw}
              onChange={(e) => setTagsRaw(e.target.value)}
              className="min-h-11 w-full rounded-md border border-[var(--border-soft)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)]"
              placeholder="Comma separated, e.g. XAUUSD, Asia, liquidity"
            />
          </label>

          <div className="space-y-2">
            <span className="text-xs font-medium text-[var(--text-secondary)]">Screenshot</span>
            <label className="flex cursor-pointer flex-col gap-2 rounded-md border border-dashed border-[var(--border-soft)] bg-[var(--bg-cell)] px-3 py-3 text-xs text-[var(--text-muted)] transition hover:bg-[var(--fx-05)]">
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => void onPickScreenshot(e.target.files)}
              />
              <span>
                {screenshotName ? (
                  <span className="font-medium text-[var(--text-secondary)]">{screenshotName}</span>
                ) : (
                  "Upload chart capture"
                )}
              </span>
              {screenshot ? (
                <img
                  src={screenshot}
                  alt=""
                  className="max-h-40 w-full rounded-md border border-[var(--border-soft)] object-contain"
                />
              ) : null}
            </label>
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={!title.trim()}
            className={cn(
              "inline-flex min-h-11 w-full items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold text-[var(--accent-on-accent)] transition sm:w-auto",
              "bg-[var(--accent)] shadow-[0_-1px_15px_var(--accent-glow)] hover:scale-[1.02] active:scale-[1.01]",
              !title.trim() && "cursor-not-allowed opacity-40 hover:scale-100",
            )}
          >
            Save analysis
          </button>
        </div>
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
          Gallery
        </p>
        <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Saved screenshots</p>

        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.length === 0 ? (
            <li className="col-span-full rounded-md border border-[var(--border-soft)] bg-[var(--bg-cell)] px-4 py-8 text-center text-sm text-[var(--text-muted)]">
              Nothing saved yet.
            </li>
          ) : (
            sorted.map((e) => (
              <li
                key={e.id}
                className="flex flex-col overflow-hidden rounded-md border border-[var(--border-soft)] bg-[var(--bg-cell)]"
              >
                {e.screenshot ? (
                  <div className="border-b border-[var(--border-soft)] bg-[var(--bg-base)] p-2">
                    <img
                      src={e.screenshot}
                      alt=""
                      className="mx-auto max-h-40 w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex min-h-[120px] items-center justify-center border-b border-[var(--border-soft)] bg-[var(--bg-base)] text-xs text-[var(--text-muted)]">
                    No image
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{e.title}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {format(new Date(e.createdAt), "yyyy-MM-dd HH:mm")}
                  </p>
                  {e.description.trim() ? (
                    <p className="line-clamp-4 text-sm text-[var(--text-secondary)]">{e.description}</p>
                  ) : null}
                  {e.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {e.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md border border-[var(--border-soft)] bg-[var(--fx-05)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => remove(e.id)}
                    className="mt-auto self-start text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
