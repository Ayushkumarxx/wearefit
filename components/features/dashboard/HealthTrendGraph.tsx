"use client";

import React from "react";
import { format, subDays } from "date-fns";
import { TrendingUp, Sparkles } from "lucide-react";
import { useHealthStore } from "@/context/useHealthStore";
import { cn } from "@/lib/utils";

export function HealthTrendGraph() {
  const { dailyLogs, selectedDate, setSelectedDate, getReceiptForDate } = useHealthStore();

  const today = new Date();
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(today, 6 - i);
    const dateStr = format(d, "yyyy-MM-dd");
    const receipt = getReceiptForDate(dateStr);
    const dayLabel = format(d, "EEE");
    const hasData = !!dailyLogs[dateStr];
    return {
      date: dateStr,
      label: dayLabel,
      score: receipt.totalScore,
      hasData,
    };
  });

  const scores = past7Days.map((d) => d.score);
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  // SVG Chart Dimensions
  const width = 320;
  const height = 120;
  const paddingX = 20;
  const paddingY = 20;

  const minScore = 30;
  const maxScore = 100;

  const points = past7Days.map((d, index) => {
    const x = paddingX + (index / (past7Days.length - 1)) * (width - 2 * paddingX);
    const y = height - paddingY - ((d.score - minScore) / (maxScore - minScore)) * (height - 2 * paddingY);
    return { x, y, ...d };
  });

  // Generate smooth cubic bezier SVG path
  const linePath = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const prev = arr[i - 1];
    const cpX = (prev.x + point.x) / 2;
    return `${acc} C ${cpX},${prev.y} ${cpX},${point.y} ${point.x},${point.y}`;
  }, "");

  // Area path for gradient fill
  const areaPath = `${linePath} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;

  return (
    <div className="px-5 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-[#1B6C43]" />
          7-Day Health Momentum Trend
        </span>
        <span className="text-xs font-extrabold text-[#1B6C43] bg-[#D8EDDE] px-2 py-0.5 rounded-full">
          Avg: {avgScore} HP
        </span>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-xs space-y-2">
        {/* SVG Continuous Curve */}
        <div className="w-full relative h-[120px] flex items-center justify-center">
          <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
            <defs>
              <linearGradient id="trendGradientFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="trendLineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>

            {/* Horizontal 80 HP Benchmark line */}
            <line
              x1={paddingX}
              y1={height - paddingY - ((80 - minScore) / (maxScore - minScore)) * (height - 2 * paddingY)}
              x2={width - paddingX}
              y2={height - paddingY - ((80 - minScore) / (maxScore - minScore)) * (height - 2 * paddingY)}
              stroke="#D1D5DB"
              strokeDasharray="4 4"
              strokeWidth="1"
            />

            {/* Area Fill */}
            <path d={areaPath} fill="url(#trendGradientFill)" />

            {/* Smooth Spline Line */}
            <path
              d={linePath}
              fill="none"
              stroke="url(#trendLineGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Interactive Day Points */}
            {points.map((pt) => {
              const isSelected = selectedDate === pt.date;

              return (
                <g
                  key={pt.date}
                  className="cursor-pointer"
                  onClick={() => setSelectedDate(pt.date)}
                >
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? 6 : 4}
                    className={cn(
                      "transition-all duration-200",
                      isSelected ? "fill-[#1B6C43] stroke-white stroke-2" : "fill-white stroke-[#10B981] stroke-2"
                    )}
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 8}
                    textAnchor="middle"
                    className="text-[9px] font-mono font-bold fill-[#191C1A]"
                  >
                    {pt.score}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Days of Week Labels Row */}
        <div className="flex justify-between items-center text-[10px] font-bold text-neutral-400 px-2 pt-1 border-t border-neutral-100">
          {past7Days.map((d) => (
            <button
              key={d.date}
              onClick={() => setSelectedDate(d.date)}
              className={cn(
                "px-2 py-0.5 rounded-lg transition-colors cursor-pointer",
                selectedDate === d.date ? "bg-[#D8EDDE] text-[#0A3D22] font-black" : "hover:text-neutral-700"
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
