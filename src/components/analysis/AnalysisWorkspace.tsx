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
import { AnalysisDetailModal } from "@/components/analysis/AnalysisDetailModal";
import { ScreenshotThumb, useScreenshotLightbox } from "@/components/ui/ScreenshotGallery";

const MAX_SCREENSHOTS = 3;

type ScreenshotDraft = {
  url: string;
  name: string;
};

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

function emptyScreenshotSlots(): (ScreenshotDraft | null)[] {
  return Array.from({ length: MAX_SCREENSHOTS }, () => null);
}

export function AnalysisWorkspace() {
  const [entries, setEntries] = useState<XauUsdAnalysisEntry[]>(() => loadAnalysisEntries());
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");
  const [screenshots, setScreenshots] = useState<(ScreenshotDraft | null)[]>(emptyScreenshotSlots);
  const [detailId, setDetailId] = useState<string | null>(null);
  const { open: openLightbox, lightbox } = useScreenshotLightbox();

  useEffect(() => {
    saveAnalysisEntries(entries);
  }, [entries]);

  const sorted = useMemo(
    () => [...entries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [entries],
  );

  const detailEntry = useMemo(
    () => (detailId ? (entries.find((e) => e.id === detailId) ?? null) : null),
    [detailId, entries],
  );

  const draftImages = useMemo(
    () => screenshots.filter((s): s is ScreenshotDraft => s != null).map((s) => s.url),
    [screenshots],
  );

  const onPickScreenshot = async (index: number, fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const url = await readFileAsDataUrl(file);
      setScreenshots((prev) => {
        const next = [...prev];
        next[index] = { url, name: file.name };
        return next;
      });
    } catch {
      setScreenshots((prev) => {
        const next = [...prev];
        next[index] = null;
        return next;
      });
    }
  };

  const clearScreenshot = (index: number) => {
    setScreenshots((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  const submit = () => {
    const t = title.trim();
    if (!t) return;
    const row: XauUsdAnalysisEntry = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title: t,
      description: description.trim(),
      tags: parseTags(tagsRaw),
      screenshots: screenshots.filter((s): s is ScreenshotDraft => s != null).map((s) => s.url),
      createdAt: new Date().toISOString(),
    };
    setEntries((prev) => [row, ...prev]);
    setTitle("");
    setDescription("");
    setTagsRaw("");
    setScreenshots(emptyScreenshotSlots());
  };

  const remove = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    if (detailId === id) setDetailId(null);
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
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              Screenshots <span className="text-[var(--text-muted)]">(up to 3)</span>
            </span>
            <div className="grid gap-3 sm:grid-cols-3">
              {screenshots.map((shot, index) => (
                <div key={index} className="space-y-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Screenshot {index + 1}
                  </span>
                  <label className="flex cursor-pointer flex-col gap-2 rounded-md border border-dashed border-[var(--border-soft)] bg-[var(--bg-cell)] px-3 py-3 text-xs text-[var(--text-muted)] transition hover:bg-[var(--fx-05)]">
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => void onPickScreenshot(index, e.target.files)}
                    />
                    <span>
                      {shot ? (
                        <span className="font-medium text-[var(--text-secondary)]">{shot.name}</span>
                      ) : (
                        "Upload chart capture"
                      )}
                    </span>
                    {shot ? (
                      <>
                        <ScreenshotThumb
                          src={shot.url}
                          onClick={() => openLightbox(draftImages, draftImages.indexOf(shot.url), title.trim() || "Draft analysis")}
                          className="border-0 bg-transparent hover:border-0"
                          imgClassName="max-h-32 rounded-md border border-[var(--border-soft)]"
                        />
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              openLightbox(draftImages, draftImages.indexOf(shot.url), title.trim() || "Draft analysis");
                            }}
                            className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)] hover:underline"
                          >
                            View full size
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              clearScreenshot(index);
                            }}
                            className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)] hover:text-red-300"
                          >
                            Remove
                          </button>
                        </div>
                      </>
                    ) : null}
                  </label>
                </div>
              ))}
            </div>
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
        <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Saved analyses</p>

        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.length === 0 ? (
            <li className="col-span-full rounded-md border border-[var(--border-soft)] bg-[var(--bg-cell)] px-4 py-8 text-center text-sm text-[var(--text-muted)]">
              Nothing saved yet.
            </li>
          ) : (
            sorted.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => setDetailId(e.id)}
                  className="flex w-full flex-col overflow-hidden rounded-md border border-[var(--border-soft)] bg-[var(--bg-cell)] text-left transition hover:border-[var(--border)] hover:bg-[var(--fx-05)]"
                >
                  {e.screenshots[0] ? (
                    <div className="border-b border-[var(--border-soft)] bg-[var(--bg-base)] p-2">
                      <ScreenshotThumb
                        src={e.screenshots[0]}
                        onClick={() => openLightbox(e.screenshots, 0, e.title)}
                        className="border-0 bg-transparent hover:border-0"
                        imgClassName="mx-auto max-h-40 object-contain"
                      />
                      {e.screenshots.length > 1 ? (
                        <p className="mt-1 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                          +{e.screenshots.length - 1} more
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <div className="flex min-h-[120px] items-center justify-center border-b border-[var(--border-soft)] bg-[var(--bg-base)] text-xs text-[var(--text-muted)]">
                      No images
                    </div>
                  )}
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{e.title}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {format(new Date(e.createdAt), "yyyy-MM-dd HH:mm")}
                    </p>
                    {e.description.trim() ? (
                      <p className="line-clamp-3 text-sm text-[var(--text-secondary)]">{e.description}</p>
                    ) : null}
                    {e.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {e.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md border border-[var(--border-soft)] bg-[var(--fx-05)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]"
                          >
                            {tag}
                          </span>
                        ))}
                        {e.tags.length > 4 ? (
                          <span className="text-[10px] text-[var(--text-muted)]">+{e.tags.length - 4}</span>
                        ) : null}
                      </div>
                    ) : null}
                    <span className="mt-auto text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
                      View details
                    </span>
                  </div>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>

      <AnalysisDetailModal
        entry={detailEntry}
        open={detailId != null && detailEntry != null}
        onClose={() => setDetailId(null)}
        onDelete={remove}
      />
      {lightbox}
    </div>
  );
}
