"use client";

import React from "react";
import { MacroDistribution } from "@/types/health";

interface MacroDistributionBarProps {
  macros: MacroDistribution;
  totalCalories?: number;
  onChange: (macros: MacroDistribution, newTotalCalories?: number) => void;
}

export function MacroDistributionBar({ macros, onChange }: MacroDistributionBarProps) {
  const carbGrams = Math.max(0, macros.carbs || 0);
  const proteinGrams = Math.max(0, macros.protein || 0);
  const fatGrams = Math.max(0, macros.fat || 0);

  const carbCals = carbGrams * 4;
  const proteinCals = proteinGrams * 4;
  const fatCals = fatGrams * 9;
  const totalMacroCals = carbCals + proteinCals + fatCals || 1;

  const carbPct = Math.round((carbCals / totalMacroCals) * 100);
  const proteinPct = Math.round((proteinCals / totalMacroCals) * 100);
  const fatPct = Math.max(0, 100 - carbPct - proteinPct);

  // SVG Pie Chart calculations (Radius 36, Circumference 226.19)
  const radius = 36;
  const circumference = 2 * Math.PI * radius;

  const carbStroke = (carbPct / 100) * circumference;
  const proteinStroke = (proteinPct / 100) * circumference;
  const fatStroke = (fatPct / 100) * circumference;

  const handleGramChange = (type: "carbs" | "protein" | "fat", value: number) => {
    const safeVal = Math.max(0, isNaN(value) ? 0 : value);
    const updatedMacros = {
      ...macros,
      [type]: safeVal,
    };
    const newTotalCals =
      (type === "carbs" ? safeVal : carbGrams) * 4 +
      (type === "protein" ? safeVal : proteinGrams) * 4 +
      (type === "fat" ? safeVal : fatGrams) * 9;

    onChange(updatedMacros, newTotalCals);
  };

  return (
    <div className="space-y-3 bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-2xs">
      {/* Clean Header without duplicate percentage clutter */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
          Macro Breakdown
        </span>
      </div>

      {/* Pie Chart & Stats Row */}
      <div className="flex items-center gap-3.5 py-1">
        {/* SVG Donut / Pie Chart */}
        <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 96 96">
            {/* Background base */}
            <circle cx="48" cy="48" r={radius} stroke="#E5EAE5" strokeWidth="12" fill="transparent" />

            {/* Carbs Segment (Amber) */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="#F59E0B"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={`${carbStroke} ${circumference}`}
              strokeDashoffset="0"
              className="transition-all duration-300"
            />

            {/* Protein Segment (Emerald) */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="#10B981"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={`${proteinStroke} ${circumference}`}
              strokeDashoffset={`-${carbStroke}`}
              className="transition-all duration-300"
            />

            {/* Fat Segment (Rose) */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="#F43F5E"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={`${fatStroke} ${circumference}`}
              strokeDashoffset={`-${carbStroke + proteinStroke}`}
              className="transition-all duration-300"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-black text-[#191C1A] leading-none">Macros</span>
            <span className="text-[8px] text-neutral-400 font-semibold mt-0.5">Ratio</span>
          </div>
        </div>

        {/* Legend Summary */}
        <div className="flex-1 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
              <span className="font-semibold text-neutral-700">Carbs</span>
            </div>
            <span className="font-bold font-mono">{carbPct}% ({carbGrams}g)</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span className="font-semibold text-neutral-700">Protein</span>
            </div>
            <span className="font-bold font-mono text-[#0A3D22]">{proteinPct}% ({proteinGrams}g)</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#F43F5E]" />
              <span className="font-semibold text-neutral-700">Fats</span>
            </div>
            <span className="font-bold font-mono">{fatPct}% ({fatGrams}g)</span>
          </div>
        </div>
      </div>

      {/* Gram Inputs Row */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-neutral-100">
        {/* Carbs Input */}
        <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-200/80 text-center">
          <span className="text-[10px] font-bold text-amber-800">Carbs</span>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            <input
              type="number"
              min={0}
              max={600}
              value={carbGrams}
              onChange={(e) => handleGramChange("carbs", parseInt(e.target.value))}
              className="w-12 text-center font-bold text-xs bg-white rounded py-0.5 outline-none border border-amber-300"
            />
            <span className="text-[10px] text-amber-700 font-medium">g</span>
          </div>
        </div>

        {/* Protein Input */}
        <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-center">
          <span className="text-[10px] font-bold text-emerald-800">Protein</span>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            <input
              type="number"
              min={0}
              max={400}
              value={proteinGrams}
              onChange={(e) => handleGramChange("protein", parseInt(e.target.value))}
              className="w-12 text-center font-bold text-xs bg-white rounded py-0.5 outline-none border border-emerald-300"
            />
            <span className="text-[10px] text-emerald-700 font-medium">g</span>
          </div>
        </div>

        {/* Fat Input */}
        <div className="p-2 rounded-xl bg-rose-50/70 border border-rose-200/80 text-center">
          <span className="text-[10px] font-bold text-rose-800">Fat</span>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            <input
              type="number"
              min={0}
              max={250}
              value={fatGrams}
              onChange={(e) => handleGramChange("fat", parseInt(e.target.value))}
              className="w-12 text-center font-bold text-xs bg-white rounded py-0.5 outline-none border border-rose-300"
            />
            <span className="text-[10px] text-rose-700 font-medium">g</span>
          </div>
        </div>
      </div>
    </div>
  );
}
