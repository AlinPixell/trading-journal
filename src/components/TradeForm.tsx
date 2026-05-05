"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Trade } from "@/types/trade";
import ConfidenceSlider from "./ConfidenceSlider";
import StarRating from "./StarRating";

const allTags = ["Momentum", "Swing", "Scalping", "Breakout", "Trend", "Risk Managed"];
const allChecklist = ["Entry Validated", "Risk < 1%", "Setup Reviewed", "News Checked", "Price Action Confirmed"];

interface TradeFormProps {
  trade: Trade;
  onSave: (trade: Trade) => void;
  onCancel: () => void;
}

export default function TradeForm({ trade, onSave, onCancel }: TradeFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(trade.title);
  const [notes, setNotes] = useState(trade.notes);
  const [personalInfo, setPersonalInfo] = useState(trade.personalInfo);
  const [confidence, setConfidence] = useState(trade.confidence);
  const [rating, setRating] = useState(trade.rating);
  const [tags, setTags] = useState<string[]>(trade.tags);
  const [checklist, setChecklist] = useState<string[]>(trade.checklist);
  const [screenshots, setScreenshots] = useState<string[]>(trade.screenshots);

  const hasChanges = useMemo(
    () =>
      title !== trade.title ||
      notes !== trade.notes ||
      personalInfo !== trade.personalInfo ||
      confidence !== trade.confidence ||
      rating !== trade.rating ||
      screenshots.length !== trade.screenshots.length ||
      screenshots.some((screenshot, index) => screenshot !== trade.screenshots[index]) ||
      tags.length !== trade.tags.length ||
      checklist.length !== trade.checklist.length ||
      tags.some((tag) => !trade.tags.includes(tag)) ||
      checklist.some((item) => !trade.checklist.includes(item)),
    [title, notes, personalInfo, confidence, rating, screenshots, tags, checklist, trade]
  );

  const handleToggleTag = (tag: string) => {
    setTags((current) => (current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]));
  };

  const handleToggleChecklist = (item: string) => {
    setChecklist((current) => (current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item]));
  };

  const handleScreenshotUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setScreenshots((current) => [reader.result as string, ...current].slice(0, 4));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveScreenshot = (index: number) => {
    setScreenshots((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleSubmit = () => {
    onSave({
      ...trade,
      title,
      notes,
      personalInfo,
      confidence,
      rating,
      tags,
      checklist,
      screenshots,
    });
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-black px-6 pb-24 pt-6 text-slate-200 sm:px-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="rounded-[2rem] border border-white/10 bg-black/90 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Edit trade</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">{trade.pair} • {trade.title}</h1>
            </div>
            <div className="text-sm text-slate-400">Created {new Date(trade.createdAt).toISOString().replace('T', ' ').slice(0, 19)}</div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-[2rem] border border-white/10 bg-black/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <div className="space-y-5">
              <label className="block text-sm font-medium text-slate-400">Title</label>
              <input
                className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/10"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />

              <div>
                <p className="mb-3 text-sm font-medium text-slate-400">Screenshots</p>
                {screenshots.length > 0 ? (
                  <div className="mb-4 grid gap-3 sm:grid-cols-2">
                    {screenshots.map((screenshot, index) => (
                      <div key={screenshot} className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900">
                        <img src={screenshot} alt={`Screenshot ${index + 1}`} className="h-40 w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveScreenshot(index)}
                          className="absolute right-3 top-3 rounded-full bg-black/70 p-2 text-white transition hover:bg-white/20"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mb-4 rounded-3xl border border-dashed border-white/10 bg-white/5 p-10 text-center text-slate-500">No screenshots uploaded.</div>
                )}
                <input type="file" accept="image/*" onChange={handleScreenshotUpload} className="w-full text-sm text-slate-300" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-3 text-sm font-medium text-slate-400">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className={`rounded-3xl border px-3 py-2 text-sm transition ${tags.includes(tag) ? "border-emerald-400 bg-emerald-400/10 text-emerald-300" : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20"}`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-3 text-sm font-medium text-slate-400">Checklist</p>
                  <div className="space-y-2">
                    {allChecklist.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleToggleChecklist(item)}
                        className={`flex w-full items-center justify-between rounded-3xl border px-4 py-3 text-left text-sm transition ${checklist.includes(item) ? "border-emerald-400 bg-emerald-400/10 text-emerald-300" : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20"}`}
                      >
                        <span>{item}</span>
                        <span>{checklist.includes(item) ? "✓" : ""}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-medium text-slate-400">Notes</p>
                <textarea
                  rows={6}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/10"
                />
              </div>

              <div>
                <p className="mb-3 text-sm font-medium text-slate-400">Personal info</p>
                <textarea
                  rows={5}
                  value={personalInfo}
                  onChange={(event) => setPersonalInfo(event.target.value)}
                  className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-black/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Confidence</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{confidence}%</p>
                </div>
              </div>
              <ConfidenceSlider value={confidence} onChange={setConfidence} />
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-black/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
              <p className="mb-4 text-sm uppercase tracking-[0.3em] text-slate-400">Rating</p>
              <StarRating value={rating} onChange={setRating} />
            </div>
          </div>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/95 px-6 py-4 backdrop-blur-xl sm:px-10">
        <div className="mx-auto flex max-w-5xl items-center justify-end gap-4">
          <button onClick={onCancel} className="rounded-3xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/10">
            Cancel
          </button>
          <button
            type="button"
            disabled={!hasChanges}
            onClick={handleSubmit}
            className="rounded-3xl bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition disabled:cursor-not-allowed disabled:opacity-50 hover:bg-emerald-300"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
