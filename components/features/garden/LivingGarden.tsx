"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ReceiptText, Calendar, Filter, Sparkles } from "lucide-react";
import { useHealthStore } from "@/context/useHealthStore";
import { generateGardenFromLogs } from "@/lib/garden-generator";
import { GardenItem } from "@/types/health";
import { cn } from "@/lib/utils";

export function LivingGarden() {
  const { dailyLogs, setSelectedDate, setIsReceiptModalOpen, getReceiptForDate } = useHealthStore();
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
    <div className="space-y-4 select-none">
      {/* 1. SINGLE UNIFIED SEAMLESS LIVING GARDEN CONTAINER */}
      <div className="bg-white rounded-[32px] border border-neutral-200/80 shadow-xs overflow-hidden">
        {/* Top Header Section */}
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
              <svg className="w-10 h-10 -rotate-90" viewBox="0 0 48 48">
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
                Living Garden
              </h2>
            </div>
          </div>

          {/* Filter Popover Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="px-3 py-1.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-[#191C1A] flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-200/60"
            >
              <Filter className="w-3 h-3 text-neutral-500" />
              <span>{getFilterLabel()}</span>
            </button>

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
                    🌸 Blooms ({healthyCount})
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
                    🥀 Weeds ({unhealthyCount})
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Middle: Continuous Meadow Canvas with Static Grid Dots Pattern */}
        <div
          style={{
            backgroundImage: "radial-gradient(circle, rgba(0, 0, 0, 0.08) 1.5px, transparent 1.5px)",
            backgroundSize: "20px 20px",
          }}
          className={cn(
            "relative h-[380px] overflow-hidden flex flex-col justify-between p-4 transition-colors duration-1000",
            vitalityScore >= 75
              ? "bg-[#DCFCE7]"
              : vitalityScore >= 50
              ? "bg-[#F1F5F9]"
              : "bg-[#FEF3C7]"
          )}
        >
          {/* Empty Garden State when no logs exist */}
          {filteredItems.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-3 z-10">
              <div className="w-16 h-16 rounded-3xl bg-white/80 border border-neutral-200/80 shadow-xs flex items-center justify-center text-3xl">
                🌱
              </div>
              <div className="space-y-1 max-w-xs">
                <h3 className="font-display font-black text-sm text-[#191C1A]">Your Garden Awaits</h3>
                <p className="text-[11px] text-neutral-500 font-medium">
                  Log your daily nutrition and sleep to sprout your first blossoms.
                </p>
              </div>
              <button
                onClick={() => setIsEntryModalOpen(true, "manual")}
                className="px-4 py-2 rounded-2xl bg-[#1B6C43] text-white text-xs font-black shadow-xs hover:bg-[#155735] transition-all cursor-pointer"
              >
                + Log Today&apos;s Health
              </button>
            </div>
          )}

          {/* Flora / Weed interactive nodes */}
          <div className="absolute inset-0">
            {filteredItems.slice(0, 18).map((item, idx) => {
              const xPos = 8 + ((idx * 23 + (idx % 3) * 11) % 78);
              const yPos = 10 + ((idx * 29 + (idx % 4) * 13) % 72);
              const rot = ((idx * 17) % 30) - 15;

              return (
                <motion.div
                  key={item.id}
                  onClick={() => setInspectedItem(item)}
                  whileHover={{ scale: 1.35, rotate: 0 }}
                  whileTap={{ scale: 0.85 }}
                  style={{
                    left: `${xPos}%`,
                    top: `${yPos}%`,
                    transform: `rotate(${rot}deg) translateZ(0)`,
                  }}
                  className="absolute cursor-pointer text-3xl sm:text-4xl drop-shadow-md select-none"
                  title={`${item.name} (${item.sourceDate})`}
                >
                  {item.emoji}
                </motion.div>
              );
            })}
          </div>

          {/* Ground Indicator */}
          <div className="absolute bottom-3 inset-x-4 z-10 flex justify-between items-center bg-white/85 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/70 text-[11px] font-bold text-[#1A452D]">
            <span>🌱 Garden Canvas</span>
            <span className="text-[10px] text-neutral-500 font-semibold">Tap plant to inspect</span>
          </div>
        </div>

        {/* Bottom Section: Garden Quality Soil Bar */}
        <div className="p-4 border-t border-neutral-100 space-y-2">
          <div className="flex items-center justify-between text-xs font-black text-[#191C1A]">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#1B6C43]" />
              Garden Quality
            </span>
          </div>

          <div className="space-y-1">
            <div className="relative h-2.5 w-full rounded-full bg-gradient-to-r from-[#FDE68A] via-[#CBD5E1] to-[#86EFAC] p-0.5 shadow-inner border border-neutral-200/60">
              <div
                className="absolute top-1/2 -translate-y-1/2 -ml-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#191C1A] shadow-md transition-all duration-500"
                style={{ left: `${Math.max(4, Math.min(96, vitalityScore))}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-extrabold text-neutral-400">
              <span>Depleted</span>
              <span>Rebalancing</span>
              <span>Blooming</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FOUR GARDEN MECHANIC CARDS */}
      <div className="space-y-2 pt-1">
        <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 px-1">
          Garden Ecosystem
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
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="relative w-full max-w-xs bg-white rounded-3xl p-5 shadow-2xl space-y-3 z-10 text-center select-none"
            >
              <button
                onClick={() => setInspectedItem(null)}
                className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-16 h-16 rounded-3xl bg-neutral-100 flex items-center justify-center text-3xl mx-auto shadow-inner border border-neutral-200">
                {inspectedItem.emoji}
              </div>

              <div>
                <h3 className="font-display font-black text-base text-[#191C1A]">
                  {inspectedItem.name}
                </h3>
                <span
                  className={cn(
                    "text-[10px] font-black uppercase px-2 py-0.5 rounded-full inline-block mt-0.5",
                    inspectedItem.type === "healthy"
                      ? "bg-[#D8EDDE] text-[#0A3D22]"
                      : "bg-[#FFE8E6] text-[#90000A]"
                  )}
                >
                  {inspectedItem.type === "healthy" ? "+ Biological Bloom" : "- Weed Debt"}
                </span>
              </div>

              <div className="flex items-center justify-center text-xs font-bold text-neutral-500 bg-[#F7F9F6] py-2 rounded-2xl border border-neutral-200/60">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#1B6C43]" />
                  <span>Logged on {inspectedItem.sourceDate}</span>
                </span>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleOpenReceipt}
                  className="w-full py-2.5 rounded-2xl bg-[#1B6C43] hover:bg-[#155735] text-white text-xs font-black shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
                >
                  <ReceiptText className="w-4 h-4" />
                  <span>View Health Statement</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
