"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  X,
  Sliders,
  Mic,
  Moon,
  Flame,
  Footprints,
  Dumbbell,
  Droplet,
  Utensils,
  Armchair,
  Check,
  Calendar,
} from "lucide-react";
import { M3Button } from "@/components/ui/M3Button";
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
  const [formData, setFormData] = useState<DailyLog>(getLogForDate(targetDate));
  const [isSedentary, setIsSedentary] = useState(false);

  // Sync state whenever modal opens or date changes
  useEffect(() => {
    if (isEntryModalOpen) {
      const activeDate = entryTargetDate || selectedDate;
      const existing = getLogForDate(activeDate);
      setFormData(existing);
      setIsSedentary(existing.steps <= 2000 && existing.workoutMinutes === 0);
      setActiveTab(entryMode);
    }
  }, [isEntryModalOpen, entryTargetDate, selectedDate, entryMode]);

  // LIVE REAL-TIME ESTIMATED SCORE
  const currentEstimatedScore = useMemo(() => {
    return calculateHealthScore(formData, userProfile).score;
  }, [formData, userProfile]);

  if (!isEntryModalOpen) return null;

  // Proportionally scale macros when total calories slider changes
  const handleCaloriesChange = (newCalories: number) => {
    const prevCals = formData.calories || 2000;
    const ratio = newCalories / prevCals;

    const newCarbs = Math.max(0, Math.round(formData.macros.carbs * ratio));
    const newProtein = Math.max(0, Math.round(formData.macros.protein * ratio));
    const newFat = Math.max(0, Math.round(formData.macros.fat * ratio));

    setFormData((prev) => ({
      ...prev,
      calories: newCalories,
      macros: {
        carbs: newCarbs,
        protein: newProtein,
        fat: newFat,
      },
    }));
  };

  const handleMacroChange = (newMacros: typeof formData.macros, newTotalCals?: number) => {
    setFormData((prev) => ({
      ...prev,
      macros: newMacros,
      calories: newTotalCals !== undefined ? newTotalCals : prev.calories,
    }));
  };

  // BI-DIRECTIONAL FOOD QUALITY & MEAL TOGGLE SYNC
  const handleHealthyEatingScoreChange = (score: number) => {
    setFormData((prev) => {
      // If user manually increases score to >= 8 (Clean/Whole food), automatically uncheck junk/outside meal
      if (score >= 8) {
        return {
          ...prev,
          healthyEatingScore: score,
          ateOutside: false,
          ultraProcessed: false,
        };
      }
      return {
        ...prev,
        healthyEatingScore: score,
      };
    });
  };

  const handleOutsideMealToggle = (checked: boolean) => {
    setFormData((prev) => {
      let newScore = prev.healthyEatingScore;
      if (checked && newScore > 5) {
        newScore = prev.ultraProcessed ? 3 : 5;
      }
      return {
        ...prev,
        ateOutside: checked,
        healthyEatingScore: newScore,
      };
    });
  };

  const handleUltraProcessedToggle = (checked: boolean) => {
    setFormData((prev) => {
      let newScore = prev.healthyEatingScore;
      if (checked) {
        newScore = Math.min(newScore, 3);
      }
      return {
        ...prev,
        ultraProcessed: checked,
        healthyEatingScore: newScore,
      };
    });
  };

  const handleSedentaryToggle = (checked: boolean) => {
    setIsSedentary(checked);
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        steps: 800,
        workoutMinutes: 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        steps: 8000,
        workoutMinutes: 30,
      }));
    }
  };

  const handleSave = () => {
    saveDailyLog(targetDate, {
      ...formData,
      date: targetDate,
    });
    toast.success(`Health Log saved for ${targetDate}! 🌿`, {
      description: `Estimated Biological Score: ${currentEstimatedScore}/100 HP`,
    });
    setIsEntryModalOpen(false);
  };

  const formattedDateTitle = (() => {
    try {
      return format(parseISO(targetDate), "EEE, MMMM d, yyyy");
    } catch {
      return targetDate;
    }
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsEntryModalOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs"
      />

      {/* Modal Sheet with Smooth Slide-Up Animation */}
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        className="relative w-full max-w-md max-h-[92vh] bg-white rounded-t-[32px] sm:rounded-3xl p-5 shadow-2xl flex flex-col justify-between overflow-hidden select-none border border-neutral-200 z-10"
      >
        {/* Header with Live Score Preview & Close */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3 shrink-0">
          <div>
            <h2 className="font-display font-extrabold text-lg text-[#191C1A]">
              Log Health Day
            </h2>
            <p className="text-[11px] font-semibold text-[#1B6C43] flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formattedDateTitle}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-[#D8EDDE] px-3 py-1 rounded-full text-xs font-mono font-bold text-[#0A3D22] border border-[#B9DEC3]">
              ~{currentEstimatedScore} HP
            </div>
            <button
              onClick={() => setIsEntryModalOpen(false)}
              className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher: Manual vs Voice */}
        <div className="flex bg-neutral-100 p-1 rounded-2xl my-2.5 shrink-0">
          <button
            onClick={() => setActiveTab("manual")}
            className={cn(
              "flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
              activeTab === "manual" ? "bg-white text-[#191C1A] shadow-xs" : "text-neutral-500"
            )}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Manual Adjust</span>
          </button>
          <button
            onClick={() => setActiveTab("voice")}
            className={cn(
              "flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
              activeTab === "voice" ? "bg-white text-[#00658F] shadow-xs" : "text-neutral-500"
            )}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>AI Voice Natural</span>
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3.5 pr-0.5 py-1">
          {activeTab === "voice" ? (
            <VoiceAILogger
              currentLog={formData}
              onApplyParsedLog={(extracted) => {
                setFormData((prev) => ({
                  ...prev,
                  ...extracted,
                  macros: {
                    ...prev.macros,
                    ...(extracted.macros || {}),
                  },
                }));
                setActiveTab("manual");
              }}
            />
          ) : (
            <div className="space-y-3.5">
              {/* 1. Sleep Duration Card */}
              <div className="bg-[#F7F9F6] p-3.5 rounded-2xl border border-neutral-200/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Moon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-[#191C1A]">Sleep Recovery</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                    {formData.sleepHours} hrs
                  </span>
                </div>
                <M3Slider
                  min={3}
                  max={12}
                  step={0.5}
                  value={formData.sleepHours}
                  colorVariant="blue"
                  onChange={(val) => setFormData((p) => ({ ...p, sleepHours: val }))}
                  valueDisplay={`${formData.sleepHours} hrs`}
                />
              </div>

              {/* 2. Nutrition & Macro Distribution Card */}
              <div className="bg-[#F7F9F6] p-3.5 rounded-2xl border border-neutral-200/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Flame className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-[#191C1A]">Total Energy Intake</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                    {formData.calories} kcal
                  </span>
                </div>
                <M3Slider
                  min={1000}
                  max={4500}
                  step={50}
                  value={formData.calories}
                  colorVariant="amber"
                  onChange={handleCaloriesChange}
                  valueDisplay={`${formData.calories} kcal`}
                />

                {/* Macro Breakdown Pie Chart & Gram Adjusters */}
                <MacroDistributionBar
                  macros={formData.macros}
                  totalCalories={formData.calories}
                  onChange={handleMacroChange}
                />
              </div>

              {/* 3. Food Quality & Meal Habit Toggles Card (Bi-directionally synced) */}
              <div className="bg-[#F7F9F6] p-3.5 rounded-2xl border border-neutral-200/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Utensils className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-[#191C1A]">Clean Eating Score</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-800 bg-[#D8EDDE] px-2 py-0.5 rounded-lg">
                    {formData.healthyEatingScore}/10
                  </span>
                </div>
                <M3Slider
                  min={1}
                  max={10}
                  step={1}
                  value={formData.healthyEatingScore}
                  colorVariant="primary"
                  onChange={handleHealthyEatingScoreChange}
                  valueDisplay={`${formData.healthyEatingScore}/10`}
                />

                {/* Processed / Outside Meal & Ultra-Processed Sugar Toggles */}
                <div className="pt-2 border-t border-neutral-200/80 space-y-2">
                  <M3Switch
                    checked={formData.ateOutside}
                    onChange={handleOutsideMealToggle}
                    label="Processed / Outside Meal"
                    sublabel="Hidden oils & refined sodium"
                  />

                  <M3Switch
                    checked={formData.ultraProcessed}
                    onChange={handleUltraProcessedToggle}
                    label="Ultra-Processed / Sugar"
                    sublabel="Packaged sweets, sodas, or fried snacks"
                  />
                </div>
              </div>

              {/* 4. Movement & Exercise Card */}
              <div className="bg-[#F7F9F6] p-3.5 rounded-2xl border border-neutral-200/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Footprints className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-[#191C1A]">Daily Steps</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-800 bg-[#D8EDDE] px-2 py-0.5 rounded-lg">
                    {formData.steps.toLocaleString()}
                  </span>
                </div>
                <M3Slider
                  min={500}
                  max={25000}
                  step={500}
                  value={formData.steps}
                  colorVariant="primary"
                  onChange={(val) => setFormData((p) => ({ ...p, steps: val }))}
                  valueDisplay={`${formData.steps.toLocaleString()} steps`}
                />

                {/* Workout Minutes */}
                <div className="pt-2 border-t border-neutral-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-bold text-[#191C1A]">Workout Duration</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg">
                      {formData.workoutMinutes} mins
                    </span>
                  </div>
                  <M3Slider
                    min={0}
                    max={180}
                    step={5}
                    value={formData.workoutMinutes}
                    colorVariant="coral"
                    onChange={(val) => setFormData((p) => ({ ...p, workoutMinutes: val }))}
                    valueDisplay={`${formData.workoutMinutes} mins`}
                  />
                </div>

                {/* Sedentary Quick Toggle */}
                <div className="pt-2 border-t border-neutral-200/80">
                  <M3Switch
                    checked={isSedentary}
                    onChange={handleSedentaryToggle}
                    label="Sedentary Day"
                    sublabel="Sat at desk with minimal movement"
                    icon={<Armchair className="w-4 h-4 text-neutral-500" />}
                  />
                </div>
              </div>

              {/* 5. Hydration Card */}
              <div className="bg-[#F7F9F6] p-3.5 rounded-2xl border border-neutral-200/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Droplet className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-[#191C1A]">Hydration</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                    {formData.waterLiters} L
                  </span>
                </div>
                <M3Slider
                  min={0.5}
                  max={6.0}
                  step={0.1}
                  value={formData.waterLiters}
                  colorVariant="blue"
                  onChange={(val) => setFormData((p) => ({ ...p, waterLiters: Number(val.toFixed(1)) }))}
                  valueDisplay={`${formData.waterLiters} L`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Save & Confirm Button */}
        <div className="pt-3 border-t border-neutral-100 shrink-0">
          <M3Button
            variant="filled"
            size="lg"
            onClick={handleSave}
            className="w-full shadow-md flex items-center justify-center gap-2 cursor-pointer"
            icon={<Check className="w-5 h-5" />}
          >
            <span>Save Health Log</span>
          </M3Button>
        </div>
      </motion.div>
    </div>
  );
}
