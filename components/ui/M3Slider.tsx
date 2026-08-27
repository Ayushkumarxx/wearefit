"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface M3SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  label?: string;
  unit?: string;
  icon?: React.ReactNode;
  colorVariant?: "primary" | "amber" | "blue" | "coral";
  valueDisplay?: string;
  className?: string;
}

export function M3Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
  unit = "",
  icon,
  colorVariant = "primary",
  valueDisplay,
  className,
}: M3SliderProps) {
  const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  const colors = {
    primary: {
      track: "bg-[#1B6C43]",
      thumb: "border-[#1B6C43] text-[#1B6C43]",
      bg: "bg-[#D8EDDE]",
    },
    amber: {
      track: "bg-[#D97706]",
      thumb: "border-[#D97706] text-[#D97706]",
      bg: "bg-[#FEF3C7]",
    },
    blue: {
      track: "bg-[#0284C7]",
      thumb: "border-[#0284C7] text-[#0284C7]",
      bg: "bg-[#E0F2FE]",
    },
    coral: {
      track: "bg-[#E11D48]",
      thumb: "border-[#E11D48] text-[#E11D48]",
      bg: "bg-[#FFE4E6]",
    },
  };

  const activeColor = colors[colorVariant];

  return (
    <div className={cn("space-y-1.5 select-none w-full", className)}>
      {(label || icon) && (
        <div className="flex items-center justify-between text-xs font-bold text-neutral-700">
          <div className="flex items-center gap-1.5">
            {icon && <span className="text-[#1B6C43]">{icon}</span>}
            <span>{label}</span>
          </div>
          <span className="font-mono text-xs font-black text-[#191C1A]">
            {valueDisplay || `${value} ${unit}`}
          </span>
        </div>
      )}

      <div className="relative h-8 flex items-center group touch-none">
        {/* Track container */}
        <div className={cn("h-3.5 w-full rounded-full overflow-hidden relative", activeColor.bg)}>
          {/* Active fill */}
          <div
            className={cn("h-full transition-all duration-75 rounded-full", activeColor.track)}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Range Slider Input with full touch coverage */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
        />

        {/* Thumb bubble indicator */}
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-6 w-6 rounded-full bg-white shadow-md border-[3px] pointer-events-none transition-transform group-active:scale-125 flex items-center justify-center z-10",
            activeColor.thumb
          )}
          style={{
            left: `${percentage}%`,
          }}
        >
          <div className="h-1.5 w-1.5 rounded-full bg-current" />
        </div>
      </div>
    </div>
  );
}
