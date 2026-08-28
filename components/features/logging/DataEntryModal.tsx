"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sliders,
  Moon,
  Flame,
  Footprints,
  Dumbbell,
  Droplet,
  Utensils,
  Check,
  Calendar,
  Mic,
  Smile,
  Frown,
  Meh,
  Sparkles,
  Zap,
} from "lucide-react";
import { M3Slider } from "@/components/ui/M3Slider";
import { M3Switch } from "@/components/ui/M3Switch";
import { MacroDistributionBar } from "@/components/features/logging/MacroDistributionBar";
import { VoiceAILogger } from "@/components/features/logging/VoiceAILogger";
import { useHealthStore } from "@/context/useHealthStore";
import { DailyLog } from "@/types/health";
import { calculateHealthScore } from "@/lib/health-calculator";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function DataEntryModal() {
  const {
    isEntryModalOpen,
    entryMode,
    entryTargetDate,
    setIsEntryModalOpen,
    selectedDate,
    getLogForDate,
    saveDailyLog,
    userProfile,
  } = useHealthStore();

  const targetDate = entryTargetDate || selectedDate;

  const [activeTab, setActiveTab] = useState<"manual" | "voice">("manual");
  const [formData, setFormData] = useState<DailyLog>(() => {
    const existing = getLogForDate(targetDate);
    return {
      ...existing,
      mood: existing.mood || "neutral",
    };
  });

  // Sync state whenever modal opens or target date changes
  useEffect(() => {
    if (isEntryModalOpen) {
      const activeDate = entryTargetDate || selectedDate;
      const existing = getLogForDate(activeDate);
      setFormData({
        ...existing,
        mood: existing.mood || "neutral",
      });
      setActiveTab(entryMode === "voice" ? "voice" : "manual");
    }
  }, [isEntryModalOpen, entryTargetDate, selectedDate, entryMode]);

  // LIVE REAL-TIME ESTIMATED SCORE
  const currentEstimatedScore = useMemo(() => {
    return calculateHealthScore(formData, userProfile).score;
  }, [formData, userProfile]);

  if (!isEntryModalOpen) return null;

  const handleCaloriesChange = (newCalories: number) => {
    if (newCalories === 0) {
      setFormData((prev) => ({
        ...prev,
        calories: 0,
        macros: { carbs: 0, protein: 0, fat: 0 },
      }));
      return;
    }

    const currentTotalMacro =
      (formData.macros.carbs || 0) * 4 +
      (formData.macros.protein || 0) * 4 +
      (formData.macros.fat || 0) * 9;

    if (currentTotalMacro === 0 || formData.calories === 0) {
      // Default to Balanced 45% Carbs, 30% Protein, 25% Fat
      const newCarbs = Math.round((newCalories * 0.45) / 4);
      const newProtein = Math.round((newCalories * 0.30) / 4);
      const newFat = Math.round((newCalories * 0.25) / 9);

      setFormData((prev) => ({
        ...prev,
        calories: newCalories,
        macros: { carbs: newCarbs, protein: newProtein, fat: newFat },
      }));
    } else {
      const ratio = newCalories / currentTotalMacro;
      const newCarbs = Math.max(0, Math.round(formData.macros.carbs * ratio));
      const newProtein = Math.max(0, Math.round(formData.macros.protein * ratio));
      const newFat = Math.max(0, Math.round(formData.macros.fat * ratio));

      setFormData((prev) => ({
        ...prev,
        calories: newCalories,
        macros: { carbs: newCarbs, protein: newProtein, fat: newFat },
      }));
    }
  };

  const handleMacroChange = (newMacros: typeof formData.macros, newTotalCals?: number) => {
    setFormData((prev) => ({
      ...prev,
      macros: newMacros,
      calories: newTotalCals !== undefined ? newTotalCals : prev.calories,
    }));
  };

  const handleHealthyEatingScoreChange = (score: number) => {
    setFormData((prev) => ({
      ...prev,
      healthyEatingScore: score,
      ateOutside: score <= 4,
      ultraProcessed: score <= 3,
    }));
  };

  const handleOutsideMealToggle = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      ateOutside: checked,
      ultraProcessed: checked,
      healthyEatingScore: checked ? Math.min(prev.healthyEatingScore, 3) : Math.max(prev.healthyEatingScore, 8),
    }));
  };

  const handleMoodSelect = (mood: "fatigued" | "unmotivated" | "neutral" | "good" | "motivated") => {
    setFormData((prev) => ({ ...prev, mood }));
  };

  const handleSave = () => {
    saveDailyLog(targetDate, formData);
    toast.success("Daily Health Statement Saved! 🌿");
    setIsEntryModalOpen(false);
  };

  const formattedTargetDate = (() => {
    try {
      return format(parseISO(targetDate), "EEEE, MMM d");
    } catch {
      return targetDate;
    }
  })();

  const MOOD_OPTIONS: Array<{
    id: "fatigued" | "unmotivated" | "neutral" | "good" | "motivated";
    emoji: string;
    delta: string;
    color: string;
  }> = [
    {
      id: "fatigued",
      emoji: "😫",
      delta: "-5 HP",
      color: "border-rose-300 bg-rose-50 text-rose-900",
    },
    {
      id: "unmotivated",
      emoji: "😔",
      delta: "-2 HP",
      color: "border-orange-300 bg-orange-50 text-orange-900",
    },
    {
      id: "neutral",
      emoji: "😐",
      delta: "0 HP",
      color: "border-neutral-300 bg-neutral-100 text-neutral-800",
    },
    {
      id: "good",
      emoji: "😊",
      delta: "+2 HP",
      color: "border-emerald-300 bg-emerald-50 text-emerald-900",
    },
    {
      id: "motivated",
      emoji: "🔥",
      delta: "+4 HP",
      color: "border-amber-400 bg-amber-50 text-amber-900",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsEntryModalOpen(false)}
        className="fixed inset-0 bg-black/65 backdrop-blur-xs cursor-pointer"
      />

      {/* Full-Screen / Full-Sheet Modal Container */}
      <motion.div
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-lg h-full max-h-[94vh] sm:max-h-[90vh] bg-[#F7F9F6] rounded-t-[32px] sm:rounded-3xl shadow-2xl flex flex-col justify-between overflow-hidden z-10 text-[#191C1A] select-none border-t sm:border border-neutral-200"
      >
        {/* Sticky Top Header */}
        <div className="bg-white/95 backdrop-blur-md px-6 py-4 border-b border-neutral-200/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#D8EDDE] text-[#0A3D22] flex items-center justify-center font-black shadow-2xs">
              <Sliders className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="font-display font-black text-lg text-[#191C1A]">Log Daily Health</h2>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
                <Calendar className="w-3.5 h-3.5 text-[#1B6C43]" />
                <span>{formattedTargetDate}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Live HP Score Chip */}
            <div className="bg-[#D8EDDE] border border-[#1B6C43]/30 px-3 py-1 rounded-full text-xs font-black text-[#0A3D22] shadow-2xs">
              {currentEstimatedScore} HP
            </div>

            <button
              onClick={() => setIsEntryModalOpen(false)}
              className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Switcher: Detailed Form vs Voice AI Logger */}
        <div className="px-6 pt-3 pb-1 shrink-0">
          <div className="flex bg-neutral-200/70 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setActiveTab("manual")}
              className={cn(
                "flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer",
                activeTab === "manual" ? "bg-white text-[#191C1A] shadow-xs font-black" : "text-neutral-500 hover:text-neutral-800"
              )}
            >
              <Sliders className="w-3.5 h-3.5 text-[#1B6C43]" />
              <span>Detailed Sliders</span>
            </button>
            <button
              onClick={() => setActiveTab("voice")}
              className={cn(
                "flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer",
                activeTab === "voice" ? "bg-white text-[#191C1A] shadow-xs font-black" : "text-neutral-500 hover:text-neutral-800"
              )}
            >
              <Mic className="w-3.5 h-3.5 text-purple-600" />
              <span>Voice AI Logger</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body with Clean Category Dividers */}
        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-5">
          {activeTab === "manual" ? (
            <div className="space-y-5 pb-4">
              {/* SECTION 1: TODAY'S MOOD (ON TOP!) */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                    Today&apos;s Mood
                  </span>
                  <div className="h-[1px] bg-neutral-200 flex-1" />
                </div>

                <div className="bg-white p-3.5 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-2">
                  <div className="grid grid-cols-5 gap-1.5 pt-0.5">
                    {MOOD_OPTIONS.map((opt) => {
                      const isSelected = (formData.mood || "neutral") === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleMoodSelect(opt.id)}
                          className={cn(
                            "py-2.5 px-1 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer",
                            isSelected
                              ? cn(opt.color, "shadow-2xs font-black ring-2 ring-neutral-400/50 scale-[1.04]")
                              : "bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-600 font-medium"
                          )}
                        >
                          <span className="text-xl">{opt.emoji}</span>
                          <span className="text-[9px] font-bold font-mono text-neutral-500">{opt.delta}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* SECTION 2: FOOD & NUTRITION */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                    Food & Nutrition
                  </span>
                  <div className="h-[1px] bg-neutral-200 flex-1" />
                </div>

                {/* Unified Clean Nutrition Card */}
                <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-[#D8EDDE] text-[#0A3D22] flex items-center justify-center">
                        <Utensils className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-black text-[#191C1A]">Clean Eating Quality</span>
                    </div>
                    <span className="font-mono text-xs font-black text-[#1B6C43] bg-[#D8EDDE] px-2.5 py-0.5 rounded-lg border border-[#1B6C43]/20">
                      {formData.healthyEatingScore}/10
                    </span>
                  </div>

                  <M3Slider
                    value={formData.healthyEatingScore}
                    onChange={handleHealthyEatingScoreChange}
                    min={1}
                    max={10}
                    step={1}
                  />

                  {/* Sub-Toggle with generous spacing */}
                  <div className="pt-3.5 border-t border-neutral-100 flex items-center justify-between gap-3">
                    <div className="space-y-0.5 pr-2">
                      <span className="text-xs font-bold text-[#191C1A] block">Processed / Outside Meal</span>
                      <span className="text-[10px] text-neutral-400 font-medium block">Restaurant, seed oils, or packaged foods</span>
                    </div>
                    <M3Switch
                      checked={formData.ateOutside || formData.ultraProcessed}
                      onChange={handleOutsideMealToggle}
                    />
                  </div>
                </div>

                {/* Calories & Interactive Macros */}
                <div className="bg-white p-4.5 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-amber-100 text-[#D97706] flex items-center justify-center">
                        <Flame className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-black text-[#191C1A]">Total Daily Calories</span>
                    </div>
                    <span className="font-mono text-xs font-black text-neutral-900 bg-neutral-100 px-2.5 py-0.5 rounded-lg border border-neutral-200">
                      {formData.calories} kcal
                    </span>
                  </div>

                  <M3Slider
                    value={formData.calories}
                    onChange={handleCaloriesChange}
                    min={0}
                    max={5000}
                    step={50}
                  />

                  <MacroDistributionBar
                    macros={formData.macros}
                    totalCalories={formData.calories}
                    onChange={handleMacroChange}
                  />
                </div>
              </div>

              {/* SECTION 3: SLEEP & RECOVERY */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                    Sleep & Recovery
                  </span>
                  <div className="h-[1px] bg-neutral-200 flex-1" />
                </div>

                <div className="bg-white p-4.5 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                        <Moon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-black text-[#191C1A]">Sleep Duration</span>
                    </div>
                    <span className="font-mono text-xs font-black text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200">
                      {formData.sleepHours} hrs
                    </span>
                  </div>

                  <M3Slider
                    value={formData.sleepHours}
                    onChange={(val) => setFormData((prev) => ({ ...prev, sleepHours: val }))}
                    min={0}
                    max={16}
                    step={0.5}
                  />
                </div>
              </div>

              {/* SECTION 4: MOVEMENT & WORKOUT */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                    Movement & Workout
                  </span>
                  <div className="h-[1px] bg-neutral-200 flex-1" />
                </div>

                {/* Steps */}
                <div className="bg-white p-4.5 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                        <Footprints className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-black text-[#191C1A]">Daily Steps</span>
                    </div>
                    <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                      {formData.steps.toLocaleString()}
                    </span>
                  </div>

                  <M3Slider
                    value={formData.steps}
                    onChange={(val) => setFormData((prev) => ({ ...prev, steps: val }))}
                    min={0}
                    max={30000}
                    step={500}
                  />
                </div>

                {/* Workout */}
                <div className="bg-white p-4.5 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                        <Dumbbell className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-black text-[#191C1A]">Workout Duration</span>
                    </div>
                    <span className="font-mono text-xs font-black text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                      {formData.workoutMinutes} mins
                    </span>
                  </div>

                  <M3Slider
                    value={formData.workoutMinutes}
                    onChange={(val) => setFormData((prev) => ({ ...prev, workoutMinutes: val }))}
                    min={0}
                    max={240}
                    step={5}
                  />
                </div>
              </div>

              {/* SECTION 5: HYDRATION */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                    Hydration
                  </span>
                  <div className="h-[1px] bg-neutral-200 flex-1" />
                </div>

                <div className="bg-white p-4.5 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                        <Droplet className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-black text-[#191C1A]">Hydration Water</span>
                    </div>
                    <span className="font-mono text-xs font-black text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                      {formData.waterLiters} L
                    </span>
                  </div>

                  <M3Slider
                    value={formData.waterLiters}
                    onChange={(val) => setFormData((prev) => ({ ...prev, waterLiters: val }))}
                    min={0}
                    max={7.0}
                    step={0.1}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="py-2">
              <VoiceAILogger
                currentLog={formData}
                onApplyParsedLog={(updatedFields) => {
                  setFormData((prev) => ({
                    ...prev,
                    ...updatedFields,
                  }));
                  setActiveTab("manual");
                }}
              />
            </div>
          )}
        </div>

        {/* Sticky Bottom Dual Action Bar */}
        <div className="bg-white px-6 py-4 border-t border-neutral-200 shrink-0 flex items-center gap-3">
          <button
            onClick={() => setIsEntryModalOpen(false)}
            className="py-4 px-5 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-4 rounded-2xl bg-[#1B6C43] hover:bg-[#155735] text-white text-sm font-black shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
          >
            <Check className="w-4.5 h-4.5" />
            <span>Save & Calculate</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
