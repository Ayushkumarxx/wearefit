"use client";

import React, { useState } from "react";
import {
  Scale,
  Flame,
  Moon,
  Footprints,
  Ruler,
  Trash2,
  Download,
  Check,
  ShieldAlert,
  Sliders,
  User,
  ShieldCheck,
  Sparkles,
  Database,
  Info,
} from "lucide-react";
import { DisclaimerModal } from "@/components/features/legal/DisclaimerModal";
import { useHealthStore } from "@/context/useHealthStore";
import { calculateConsecutiveStreak } from "@/lib/streak-calculator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ProfileSettings() {
  const { userProfile, updateProfile, seedDemoHistory, resetAllData, dailyLogs, getReceiptForDate } = useHealthStore();
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);

  const [name, setName] = useState(userProfile?.name || "Alex");
  const [weightKg, setWeightKg] = useState(userProfile?.weightKg || 70);
  const [heightCm, setHeightCm] = useState(userProfile?.heightCm || 175);
  const [calorieTarget, setCalorieTarget] = useState(userProfile?.dailyCalorieTarget || 2000);
  const [sleepTarget, setSleepTarget] = useState(userProfile?.dailySleepTargetHours || 8);
  const [stepTarget, setStepTarget] = useState(userProfile?.dailyStepsTarget || 8000);

  // Consecutive streak & quality days calculation
  const streakCount = calculateConsecutiveStreak(dailyLogs);
  const allLogs = Object.values(dailyLogs);
  const qualityDaysCount = allLogs.filter((l) => getReceiptForDate(l.date).totalScore >= 75).length;

  const heightMeters = heightCm / 100;
  const bmi = heightMeters > 0 ? (weightKg / (heightMeters * heightMeters)).toFixed(1) : "22.0";
  const bmiCategory = Number(bmi) < 18.5 ? "Lean" : Number(bmi) < 25 ? "Normal" : "Elevated";

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim() || "Alex",
      weightKg: Number(weightKg),
      heightCm: Number(heightCm),
      dailyCalorieTarget: Number(calorieTarget),
      dailySleepTargetHours: Number(sleepTarget),
      dailyStepsTarget: Number(stepTarget),
    });
    toast.success("Health baselines saved! 🌿");
  };

  const handleExportData = () => {
    const data = localStorage.getItem("wearefit_app_storage");
    if (!data) return;
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wearefit_health_data_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    toast.success("Health data exported to JSON! 📋");
  };

  return (
    <div className="p-5 space-y-4 select-none">
      {/* 1. Header Profile Identity & 3-Pill Banner (Streak, Quality Days, BMI) */}
      <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs space-y-3 text-center">
        <div className="relative inline-block">
          <div className="w-16 h-16 rounded-3xl bg-[#1B6C43] text-white flex items-center justify-center font-display font-black text-2xl shadow-md mx-auto">
            {name.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#D8EDDE] border-2 border-white flex items-center justify-center text-[#0A3D22] text-[10px] font-black">
            ✓
          </div>
        </div>

        <div>
          <h1 className="font-display font-black text-xl text-[#191C1A]">
            {userProfile?.name || "Alex"}
          </h1>
          <p className="text-xs font-semibold text-[#1B6C43] max-w-xs mx-auto pt-0.5 leading-snug">
            ✨ Small daily compounding creates unbreakable cellular vitality.
          </p>
        </div>

        {/* 2 Wide Metric Pills: Streak (50%) & Quality Days (50%) */}
        <div className="pt-2.5 grid grid-cols-2 gap-2.5 border-t border-neutral-100">
          {/* Pill 1: Streak */}
          <div className="p-3 rounded-2xl bg-[#F7F9F6] text-center border border-neutral-200/60">
            <span className="text-[10px] font-bold uppercase text-neutral-400 block">Active Streak</span>
            <span className="font-display font-black text-base text-[#78350F] flex items-center justify-center gap-1.5 mt-0.5">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              {streakCount} Days
            </span>
          </div>

          {/* Pill 2: Quality Days */}
          <div className="p-3 rounded-2xl bg-[#F7F9F6] text-center border border-neutral-200/60">
            <span className="text-[10px] font-bold uppercase text-neutral-400 block">Quality Days</span>
            <span className="font-display font-black text-base text-[#1B6C43] flex items-center justify-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-4 h-4 text-[#1B6C43]" />
              {qualityDaysCount} Days
            </span>
          </div>
        </div>
      </div>

      {/* 2. Categorized Health Baselines Form */}
      <form onSubmit={handleSave} className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-1 border-b border-neutral-100">
          <Sliders className="w-4 h-4 text-[#1B6C43]" />
          <h2 className="text-xs font-black uppercase tracking-wider text-[#191C1A]">
            Health Target Baselines
          </h2>
        </div>

        {/* Display Name */}
        <div className="space-y-1 bg-[#F7F9F6] p-3.5 rounded-2xl border border-neutral-200/60">
          <label className="text-[11px] font-bold text-neutral-600 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-neutral-400" />
            <span>Display Name</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-9 px-3 rounded-xl bg-white border border-neutral-300 text-xs font-semibold text-[#191C1A] outline-none focus:border-[#1B6C43]"
          />
        </div>

        {/* Category A: Physical Biometrics */}
        <div className="space-y-2 pt-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block px-1">
            Physical Biometrics
          </span>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Weight */}
            <div className="space-y-1.5 bg-[#F7F9F6] p-3.5 rounded-2xl border border-neutral-200/60">
              <div className="flex justify-between items-center text-[11px] font-bold">
                <span className="text-neutral-600 flex items-center gap-1">
                  <Scale className="w-3 h-3 text-neutral-400" />
                  <span>Weight</span>
                </span>
                <span className="text-[#1B6C43] font-black">{weightKg} kg</span>
              </div>
              <input
                type="range"
                min={40}
                max={140}
                step={0.5}
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full accent-[#1B6C43] cursor-pointer"
              />
            </div>

            {/* Height */}
            <div className="space-y-1.5 bg-[#F7F9F6] p-3.5 rounded-2xl border border-neutral-200/60">
              <div className="flex justify-between items-center text-[11px] font-bold">
                <span className="text-neutral-600 flex items-center gap-1">
                  <Ruler className="w-3 h-3 text-neutral-400" />
                  <span>Height</span>
                </span>
                <span className="text-blue-700 font-black">{heightCm} cm</span>
              </div>
              <input
                type="range"
                min={130}
                max={220}
                step={1}
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Category B: Circadian & Rest */}
        <div className="space-y-2 pt-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block px-1">
            Circadian & Sleep
          </span>

          <div className="space-y-1.5 bg-[#F7F9F6] p-3.5 rounded-2xl border border-neutral-200/60">
            <div className="flex justify-between items-center text-[11px] font-bold">
              <span className="text-neutral-600 flex items-center gap-1">
                <Moon className="w-3.5 h-3.5 text-purple-600" />
                <span>Daily Sleep Goal</span>
              </span>
              <span className="text-purple-700 font-black">{sleepTarget} hrs</span>
            </div>
            <input
              type="range"
              min={5.5}
              max={10.0}
              step={0.5}
              value={sleepTarget}
              onChange={(e) => setSleepTarget(Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Category C: Physical Movement */}
        <div className="space-y-2 pt-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block px-1">
            Physical Movement
          </span>

          <div className="space-y-1.5 bg-[#F7F9F6] p-3.5 rounded-2xl border border-neutral-200/60">
            <div className="flex justify-between items-center text-[11px] font-bold">
              <span className="text-neutral-600 flex items-center gap-1">
                <Footprints className="w-3.5 h-3.5 text-emerald-700" />
                <span>Daily Steps Target</span>
              </span>
              <span className="text-emerald-700 font-black">{stepTarget.toLocaleString()} steps</span>
            </div>
            <input
              type="range"
              min={4000}
              max={20000}
              step={500}
              value={stepTarget}
              onChange={(e) => setStepTarget(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Category D: Metabolic Fueling */}
        <div className="space-y-2 pt-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block px-1">
            Metabolic Fueling
          </span>

          <div className="space-y-1.5 bg-[#F7F9F6] p-3.5 rounded-2xl border border-neutral-200/60">
            <div className="flex justify-between items-center text-[11px] font-bold">
              <span className="text-neutral-600 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-600" />
                <span>Daily Calorie Baseline</span>
              </span>
              <span className="text-amber-700 font-black">{calorieTarget} kcal</span>
            </div>
            <input
              type="range"
              min={1200}
              max={4000}
              step={50}
              value={calorieTarget}
              onChange={(e) => setCalorieTarget(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-[#1B6C43] hover:bg-[#155735] text-white text-xs font-black shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
        >
          <Check className="w-4 h-4" />
          <span>Save Baselines</span>
        </button>
      </form>

      {/* 3. Data Actions */}
      <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-1 border-b border-neutral-100">
          <Database className="w-4 h-4 text-[#1B6C43]" />
          <h2 className="text-xs font-black uppercase tracking-wider text-[#191C1A]">
            Data Management
          </h2>
        </div>

        <div className="space-y-2">
          {/* Export JSON */}
          <button
            onClick={handleExportData}
            className="w-full py-3 px-4 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Download className="w-3.5 h-3.5 text-neutral-500" />
              <span>Export Health Data (JSON)</span>
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">Download</span>
          </button>

          {/* Use Demo Data */}
          <button
            onClick={() => {
              seedDemoHistory();
              toast.success("Loaded 7 days of demo health records! 🌱");
            }}
            className="w-full py-3 px-4 rounded-2xl bg-[#D8EDDE]/50 hover:bg-[#D8EDDE] text-[#0A3D22] text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#1B6C43]" />
              <span>Use Demo Data</span>
            </span>
            <span className="text-[10px] text-[#1B6C43] font-bold">Populate</span>
          </button>

          {/* Reset Records */}
          <button
            onClick={() => {
              if (confirm("Are you sure you want to reset all stored health logs? This action cannot be undone.")) {
                resetAllData();
                toast.error("All data has been reset to defaults.");
              }
            }}
            className="w-full py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Reset All Health Records</span>
            </span>
            <span className="text-[10px] text-rose-500 font-bold">Clear</span>
          </button>
        </div>
      </div>

      {/* 4. Outside Medical Disclaimer Text */}
      <div className="p-4 rounded-3xl bg-neutral-100/80 border border-neutral-200/80 space-y-1.5 text-center">
        <div className="flex items-center justify-center gap-1.5 text-neutral-600 text-xs font-bold">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
          <span>Medical & Health Notice</span>
        </div>
        <p className="text-[10px] text-neutral-500 leading-relaxed max-w-sm mx-auto">
          WeAreFit is an educational biological habit tracker and lifestyle optimizer. It does not provide medical diagnoses, treatment, or clinical prescriptions. Consult a licensed medical professional for personal clinical guidance.
        </p>
        <button
          onClick={() => setIsDisclaimerOpen(true)}
          className="text-[10px] font-bold text-[#1B6C43] hover:underline cursor-pointer pt-0.5 inline-block"
        >
          Read Full Health Disclaimer →
        </button>
      </div>

      <DisclaimerModal isOpen={isDisclaimerOpen} onClose={() => setIsDisclaimerOpen(false)} />
    </div>
  );
}
