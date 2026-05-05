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
            className={`rounded-full p-2 transition ${ratingValue <= value ? "bg-amber-500/20 text-amber-300" : "bg-white/5 text-slate-500 hover:bg-white/10"}`}
          >
            <Star className="h-4 w-4" />
          </button>
        );
      })}
      <span className="text-sm text-slate-400">{value}/5</span>
    </div>
  );
}
