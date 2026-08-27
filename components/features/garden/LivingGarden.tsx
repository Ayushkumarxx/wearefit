"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ReceiptText, Calendar, Filter } from "lucide-react";
import { useHealthStore } from "@/context/useHealthStore";
import { generateGardenFromLogs } from "@/lib/garden-generator";
import { GardenItem } from "@/types/health";
import { M3Button } from "@/components/ui/M3Button";
import { cn } from "@/lib/utils";

export function LivingGarden() {
  const { dailyLogs, setSelectedDate, setIsReceiptModalOpen } = useHealthStore();
  const [filter, setFilter] = useState<"all" | "healthy" | "unhealthy">("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [inspectedItem, setInspectedItem] = useState<GardenItem | null>(null);

  const items = useMemo(() => generateGardenFromLogs(dailyLogs), [dailyLogs]);
  const healthyCount = items.filter((i) => i.type === "healthy").length;
  const unhealthyCount = items.filter((i) => i.type === "unhealthy").length;
  const vitalityScore = Math.round((healthyCount / (items.length || 1)) * 100);

  const filteredItems = useMemo(() => {
    if (filter === "healthy") return items.filter((i) => i.type === "healthy");
    if (filter === "unhealthy") return items.filter((i) => i.type === "unhealthy");
    return items;
  }, [items, filter]);

  const handleOpenReceipt = () => {
    if (!inspectedItem) return;
    const targetDate =
      inspectedItem.sourceDate === "today"
        ? Object.keys(dailyLogs)[0] || "today"
        : inspectedItem.sourceDate;
    setSelectedDate(targetDate);
    setIsReceiptModalOpen(true, targetDate);
    setInspectedItem(null);
  };

  const getFilterLabel = () => {
    if (filter === "healthy") return "Blooms";
    if (filter === "unhealthy") return "Weeds";
    return "All Items";
  };

  return (
    <div className="space-y-3.5 select-none">
      {/* 1. TOP HEADER: Clean Mini Circular Vitality Gauge + Title + Right Filter Button */}
      <div className="relative bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-xs flex items-center justify-between gap-3">
        {/* Left: Mini Circular Gauge + Title */}
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
            <svg className="w-11 h-11 -rotate-90" viewBox="0 0 48 48">
              <circle
                cx="24"
                cy="24"
                r="19"
                fill="none"
                stroke="#E6EFE9"
                strokeWidth="4"
              />
              <circle
                cx="24"
                cy="24"
                r="19"
                fill="none"
                stroke="#1B6C43"
                strokeWidth="4"
                strokeDasharray={119.38}
                strokeDashoffset={119.38 - (vitalityScore / 100) * 119.38}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <span className="absolute font-display font-black text-xs text-[#0A3D22]">
              {vitalityScore}%
            </span>
          </div>

          <div>
            <h2 className="font-display font-black text-base text-[#191C1A]">
              Garden Vitality
            </h2>
          </div>
        </div>

        {/* Right: Interactive Filter Button */}
        <div className="relative">
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="px-3 py-1.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-[#191C1A] flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-200/60"
          >
            <Filter className="w-3 h-3 text-neutral-500" />
            <span>{getFilterLabel()}</span>
          </button>

          {/* Filter Popover Dropdown */}
          <AnimatePresence>
            {showFilterMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 5 }}
                className="absolute right-0 top-10 z-20 bg-white rounded-2xl p-1.5 shadow-xl border border-neutral-200 min-w-[130px] space-y-1"
              >
                <button
                  onClick={() => {
                    setFilter("all");
                    setShowFilterMenu(false);
                  }}
                  className={cn(
                    "w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer",
                    filter === "all" ? "bg-[#191C1A] text-white" : "hover:bg-neutral-100 text-neutral-700"
                  )}
                >
                  All Items ({items.length})
                </button>
                <button
                  onClick={() => {
                    setFilter("healthy");
                    setShowFilterMenu(false);
                  }}
                  className={cn(
                    "w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer",
                    filter === "healthy" ? "bg-[#1B6C43] text-white" : "hover:bg-neutral-100 text-neutral-700"
                  )}
                >
                  🥦 Living Blooms ({healthyCount})
                </button>
                <button
                  onClick={() => {
                    setFilter("unhealthy");
                    setShowFilterMenu(false);
                  }}
                  className={cn(
                    "w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer",
                    filter === "unhealthy" ? "bg-[#BA1A1A] text-white" : "hover:bg-neutral-100 text-neutral-700"
                  )}
                >
                  🍔 Weeds ({unhealthyCount})
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 2. LIVING MEADOW CANVAS */}
      <div className="relative w-full h-[320px] rounded-3xl bg-gradient-to-b from-[#E6F4EA] via-[#D8EFE0] to-[#BCD8C5] border border-[#A7CEB4] p-4 shadow-inner overflow-hidden">
        {/* Subtle grass pattern */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#1B6C43 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />

        {/* Scattered Flora & Weed Icons without blinking */}
        <div className="absolute inset-0">
          {filteredItems.slice(0, 18).map((item, idx) => {
            const xPos = 8 + ((idx * 23 + (idx % 3) * 11) % 78);
            const yPos = 10 + ((idx * 29 + (idx % 4) * 13) % 72);
            const rot = ((idx * 17) % 30) - 15;

            return (
              <div
                key={item.id}
                onClick={() => setInspectedItem(item)}
                style={{
                  left: `${xPos}%`,
                  top: `${yPos}%`,
                  transform: `rotate(${rot}deg) translateZ(0)`,
                }}
                className="absolute cursor-pointer text-3xl sm:text-4xl drop-shadow-md hover:scale-135 active:scale-90 transition-transform duration-200"
                title={`${item.name} (${item.sourceDate})`}
              >
                {item.emoji}
              </div>
            );
          })}
        </div>

        {/* Ground Indicator */}
        <div className="absolute bottom-3 inset-x-4 z-10 flex justify-between items-center bg-white/85 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/70 text-[11px] font-bold text-[#1A452D]">
          <span>🌱 My Garden</span>
          <span>Tap items to inspect</span>
        </div>
      </div>

      {/* 3. 4 Minimal Garden Evolution Cards */}
      <div className="space-y-2 pt-1">
        <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 px-1">
          Garden Evolution
        </span>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-2xs flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-lg flex items-center justify-center border border-emerald-100 shrink-0">
              🌸
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-[#191C1A]">Flora Blooms</h4>
              <p className="text-[10px] text-neutral-500 font-medium">Clean food & sleep</p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-2xs flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-green-50 text-lg flex items-center justify-center border border-green-100 shrink-0">
              🌲
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-[#191C1A]">Canopy Growth</h4>
              <p className="text-[10px] text-neutral-500 font-medium">Daily streaks</p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-2xs flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-lg flex items-center justify-center border border-rose-100 shrink-0">
              🥀
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-[#191C1A]">Weed Gremlins</h4>
              <p className="text-[10px] text-neutral-500 font-medium">Junk & late nights</p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-2xs flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-lg flex items-center justify-center border border-blue-100 shrink-0">
              ✨
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-[#191C1A]">Purification</h4>
              <p className="text-[10px] text-neutral-500 font-medium">Restores 100% purity</p>
            </div>
          </div>
        </div>
      </div>

      {/* Inspection Modal */}
      <AnimatePresence>
        {inspectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInspectedItem(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="relative w-full max-w-xs bg-white rounded-3xl p-5 shadow-2xl space-y-4 text-center select-none z-10"
            >
              <div className="flex justify-end">
                <button
                  onClick={() => setInspectedItem(null)}
                  className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-16 h-16 rounded-3xl bg-neutral-50 border border-neutral-200 flex items-center justify-center mx-auto text-4xl shadow-inner">
                {inspectedItem.emoji}
              </div>

              <div className="space-y-1">
                <span
                  className={cn(
                    "text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider",
                    inspectedItem.type === "healthy"
                      ? "bg-[#D8EDDE] text-[#0A3D22]"
                      : "bg-[#FFE8E6] text-[#90000A]"
                  )}
                >
                  {inspectedItem.type === "healthy" ? "Living Bloom" : "Weed Gremlin"}
                </span>

                <h3 className="font-display font-extrabold text-base text-[#191C1A] pt-1">
                  {inspectedItem.name}
                </h3>

                <p className="text-xs text-neutral-500 flex items-center justify-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Sprouted on {inspectedItem.sourceDate}</span>
                </p>
              </div>

              <M3Button
                size="md"
                variant="filled"
                onClick={handleOpenReceipt}
                className="w-full shadow-xs"
                icon={<ReceiptText className="w-4 h-4" />}
              >
                View Daily Statement
              </M3Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
