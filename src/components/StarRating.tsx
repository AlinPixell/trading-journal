"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
}

export default function StarRating({ value, onChange }: StarRatingProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: 5 }, (_, index) => {
        const ratingValue = index + 1;
        return (
          <button
            key={ratingValue}
            type="button"
            onClick={() => onChange(ratingValue)}
            className={`flex min-h-11 min-w-11 items-center justify-center rounded-sm p-2 transition sm:min-h-0 sm:min-w-0 ${ratingValue <= value ? "bg-amber-500/18 text-amber-600" : "bg-[var(--fx-05)] text-[var(--text-muted)] hover:bg-[var(--fx-08)]"}`}
          >
            <Star className="h-4 w-4" />
          </button>
        );
      })}
      <span className="text-sm text-[var(--text-muted)]">{value}/5</span>
    </div>
  );
}
