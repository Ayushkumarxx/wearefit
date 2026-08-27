"use client";

import React, { useState } from "react";
import { Sparkles, Scale, Flame, Moon, Footprints, Ruler, Trash2, Download, Check, ShieldAlert, Sliders, User } from "lucide-react";
import { M3Button } from "@/components/ui/M3Button";
import { DisclaimerModal } from "@/components/features/legal/DisclaimerModal";
import { useHealthStore } from "@/context/useHealthStore";
import { calculateConsecutiveStreak } from "@/lib/streak-calculator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ProfileSettings() {
  const { userProfile, updateProfile, seedDemoHistory, resetAllData, dailyLogs } = useHealthStore();
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);

  const [name, setName] = useState(userProfile?.name || "Alex");
  const [weightKg, setWeightKg] = useState(userProfile?.weightKg || 70);
  const [heightCm, setHeightCm] = useState(userProfile?.heightCm || 175);
  const [calorieTarget, setCalorieTarget] = useState(userProfile?.dailyCalorieTarget || 2000);
  const [sleepTarget, setSleepTarget] = useState(userProfile?.dailySleepTargetHours || 8);
  const [stepTarget, setStepTarget] = useState(userProfile?.dailyStepsTarget || 8000);

  // Consecutive streak calculated accurately
  const streakCount = calculateConsecutiveStreak(dailyLogs);

  const heightMeters = heightCm / 100;
  const bmi = heightMeters > 0 ? (weightKg / (heightMeters * heightMeters)).toFixed(1) : "22.0";

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
    toast.success("Profile updated successfully! 🌿");
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
    toast.success("Health Data exported to JSON file!");
  };

  return (
    <div className="p-5 space-y-4 select-none">
      {/* Profile Header */}
      <div className="text-center space-y-1">
        <div className="w-16 h-16 rounded-3xl bg-[#1B6C43] text-white flex items-center justify-center font-display font-extrabold text-2xl mx-auto shadow-md">
          {name.charAt(0).toUpperCase() || "A"}
        </div>
        <h1 className="font-display font-black text-2xl text-[#191C1A] pt-1">
          {userProfile?.name || "Alex"}
        </h1>
        <p className="text-xs text-neutral-500 font-medium">
          Focus: {userProfile?.focusGoal?.replace(/_/g, " ").toUpperCase() || "ENERGY & VITALITY"}
        </p>
      </div>

      {/* 7 Days Streak & BMI Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* 7 Days Streak Card */}
        <div className="bg-[#FFF4D9] p-4 rounded-3xl border border-[#FFE7A3] shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#78350F]">
              Active Streak
            </span>
            <Flame className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-display font-black text-3xl text-[#78350F]">{streakCount}</span>
              <span className="text-xs font-bold text-[#78350F]">Days Streak</span>
            </div>
          </div>
        </div>

        {/* BMI Card */}
        <div className="bg-[#D8EDDE] p-4 rounded-3xl border border-[#B9DEC3] shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0A3D22]">
              Body Mass Index
            </span>
            <Scale className="w-4 h-4 text-[#1B6C43]" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-display font-black text-3xl text-[#0A3D22]">{bmi}</span>
              <span className="text-xs font-bold text-[#0A3D22]">BMI</span>
            </div>
          </div>
        </div>
      </div>

      {/* Target Settings Form with Visualized Icon Sliders */}
      <form onSubmit={handleSave} className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs space-y-4">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-[#1B6C43]" />
          Personal Targets & Metrics
        </h2>

        {/* Display Name */}
        <div className="space-y-1.5 bg-[#F7F9F6] p-3 rounded-2xl border border-neutral-200/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center shadow-2xs text-[#1B6C43]">
              <User className="w-4 h-4" />
            </div>
            <label className="text-xs font-bold text-neutral-700">Display Name</label>
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-10 px-3.5 rounded-xl bg-white border border-neutral-300 text-xs font-semibold text-[#191C1A] outline-none focus:border-[#1B6C43]"
          />
        </div>

        {/* Weight Slider Card */}
        <div className="space-y-2 bg-[#F7F9F6] p-3 rounded-2xl border border-neutral-200/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center shadow-2xs text-[#1B6C43]">
                <Scale className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-neutral-700">Body Weight</span>
            </div>
            <span className="font-mono text-xs font-black text-[#1B6C43] bg-[#D8EDDE] px-2.5 py-0.5 rounded-lg">
              {weightKg} kg
            </span>
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

        {/* Height Slider Card */}
        <div className="space-y-2 bg-[#F7F9F6] p-3 rounded-2xl border border-neutral-200/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center shadow-2xs text-blue-600">
                <Ruler className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-neutral-700">Height</span>
            </div>
            <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
              {heightCm} cm
            </span>
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

        {/* Daily Calories Slider Card */}
        <div className="space-y-2 bg-[#F7F9F6] p-3 rounded-2xl border border-neutral-200/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center shadow-2xs text-amber-600">
                <Flame className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-neutral-700">Daily Calorie Target</span>
            </div>
            <span className="font-mono text-xs font-black text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
              {calorieTarget} kcal
            </span>
          </div>
          <input
            type="range"
            min={1400}
            max={3500}
            step={50}
            value={calorieTarget}
            onChange={(e) => setCalorieTarget(Number(e.target.value))}
            className="w-full accent-amber-600 cursor-pointer"
          />
        </div>

        {/* Sleep Target Slider Card */}
        <div className="space-y-2 bg-[#F7F9F6] p-3 rounded-2xl border border-neutral-200/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center shadow-2xs text-purple-600">
                <Moon className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-neutral-700">Daily Sleep Target</span>
            </div>
            <span className="font-mono text-xs font-black text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200">
              {sleepTarget} hrs
            </span>
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

        {/* Step Target Slider Card */}
        <div className="space-y-2 bg-[#F7F9F6] p-3 rounded-2xl border border-neutral-200/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center shadow-2xs text-emerald-600">
                <Footprints className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-neutral-700">Daily Steps Target</span>
            </div>
            <span className="font-mono text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
              {stepTarget.toLocaleString()} steps
            </span>
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

        <M3Button type="submit" size="md" className="w-full shadow-sm cursor-pointer" icon={<Check className="w-4 h-4" />}>
          Update Profile
        </M3Button>
      </form>

      {/* Developer & Demo Data Tools */}
      <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs space-y-3">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-neutral-500">
          Data Management & Demo Tools
        </h2>

        <div className="space-y-2">
          {/* Seed Sample Demo Data */}
          <button
            onClick={() => {
              seedDemoHistory();
              toast.success("Loaded 7 days of sample health logs & garden flora!");
            }}
            className="w-full p-3 rounded-2xl bg-[#D8EDDE] hover:bg-[#C5E5CD] text-[#0A3D22] text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#1B6C43]" />
              <span>Load 7-Day Demo Health History</span>
            </div>
            <span className="text-[10px] bg-white/70 px-2 py-0.5 rounded-full">Preview</span>
          </button>

          {/* Export JSON */}
          <button
            onClick={handleExportData}
            className="w-full p-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-[#191C1A] text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-neutral-600" />
              <span>Export Health Backup (JSON)</span>
            </div>
          </button>

          {/* Medical Disclaimer Link */}
          <button
            onClick={() => setIsDisclaimerOpen(true)}
            className="w-full p-3 rounded-2xl bg-neutral-50 hover:bg-neutral-100 text-neutral-600 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer border border-neutral-200"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-neutral-500" />
              <span>Medical Disclaimer & Safe Use Notice</span>
            </div>
          </button>

          {/* Reset All */}
          <button
            onClick={() => {
              if (confirm("Are you sure you want to reset all health data and onboarding?")) {
                resetAllData();
                toast.info("All data has been reset.");
              }
            }}
            className="w-full p-3 rounded-2xl bg-[#FFE8E6] hover:bg-[#FFD6D3] text-[#90000A] text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              <span>Reset All Local Storage Data</span>
            </div>
          </button>
        </div>
      </div>

      <DisclaimerModal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
      />
    </div>
  );
}
