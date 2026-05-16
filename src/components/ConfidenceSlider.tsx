"use client";

import * as Slider from "@radix-ui/react-slider";

interface ConfidenceSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export default function ConfidenceSlider({
  value,
  onChange,
}: ConfidenceSliderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
        <span>Confidence</span>
        <span className="font-semibold text-[var(--text-primary)]">
          {value}%
        </span>
      </div>
      <Slider.Root
        className="relative flex h-8 w-full touch-none items-center sm:h-5"
        value={[value]}
        max={100}
        min={0}
        step={1}
        onValueChange={(val) => onChange(val[0])}
      >
        <Slider.Track className="relative h-2 w-full grow overflow-hidden rounded-sm bg-[var(--fx-08)]">
          <Slider.Range className="absolute h-full rounded-sm bg-profit" />
        </Slider.Track>
        <Slider.Thumb className="block h-7 w-7 rounded-sm border border-[var(--border-soft)] bg-[var(--bg-raised)] shadow-[0_2px_10px_rgba(0,0,0,0.12)] sm:h-5 sm:w-5" />
      </Slider.Root>
    </div>
  );
}
