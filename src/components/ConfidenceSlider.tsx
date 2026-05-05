"use client";

import * as Slider from "@radix-ui/react-slider";

interface ConfidenceSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export default function ConfidenceSlider({ value, onChange }: ConfidenceSliderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>Confidence</span>
        <span className="font-semibold text-white">{value}%</span>
      </div>
      <Slider.Root
        className="relative flex h-5 w-full touch-none items-center"
        value={[value]}
        max={100}
        min={0}
        step={1}
        onValueChange={(val) => onChange(val[0])}
      >
        <Slider.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-white/10">
          <Slider.Range className="absolute h-full rounded-full bg-emerald-400" />
        </Slider.Track>
        <Slider.Thumb className="block h-5 w-5 rounded-full border border-white/10 bg-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.15)]" />
      </Slider.Root>
    </div>
  );
}
