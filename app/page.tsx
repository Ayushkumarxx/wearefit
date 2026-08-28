"use client";

import React, { useState, useEffect } from "react";
import { useHealthStore } from "@/context/useHealthStore";
import { MobileShell } from "@/components/layout/MobileShell";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { OnboardingFlow } from "@/components/features/onboarding/OnboardingFlow";
import { HealthScoreHero } from "@/components/features/dashboard/HealthScoreHero";
import { HpShieldCard } from "@/components/features/dashboard/HpShieldCard";
import { QuickMetricsGrid } from "@/components/features/dashboard/QuickMetricsGrid";
import { TodayCompensationTasks } from "@/components/features/dashboard/TodayCompensationTasks";
import { DailyReceiptCard } from "@/components/features/dashboard/DailyReceiptCard";
import { TomorrowPrescriptionCard } from "@/components/features/dashboard/TomorrowPrescriptionCard";
import { OneBestThingTab } from "@/components/features/focus/OneBestThingTab";
import { DataEntryModal } from "@/components/features/logging/DataEntryModal";
import { QuickActionModal } from "@/components/features/logging/QuickActionModal";
import { ReceiptModal } from "@/components/features/dashboard/ReceiptModal";
import { ShareReceiptModal } from "@/components/features/dashboard/ShareReceiptModal";
import { GardenCalendarTab } from "@/components/features/garden/GardenCalendarTab";
import { ShouldIAdvisor } from "@/components/features/should-i/ShouldIAdvisor";
import { ProfileSettings } from "@/components/features/profile/ProfileSettings";
import { Sparkles, Sliders } from "lucide-react";

export default function HomePage() {
  const {
    isOnboarded,
    activeTab,
    selectedDate,
    getReceiptForDate,
    getLogForDate,
    dailyLogs,
    setIsEntryModalOpen,
  } = useHealthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle client-side Zustand hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#F7F9F6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#1B6C43] text-white flex items-center justify-center font-display font-extrabold text-2xl animate-pulse">
            w
          </div>
          <span className="font-display font-black text-lg text-[#191C1A]">wearefit</span>
        </div>
      </div>
    );
  }

  // First time onboarding check
  if (!isOnboarded) {
    return <OnboardingFlow />;
  }

  const currentLog = getLogForDate(selectedDate);
  const hasLoggedCore = Boolean(
    currentLog && currentLog.sleepHours > 0 && currentLog.calories > 0 && currentLog.waterLiters > 0
  );
  const hasLoggedToday = hasLoggedCore;
  const receipt = getReceiptForDate(selectedDate);

  return (
    <MobileShell>
      {/* Top Header with Reset Countdown */}
      <AppHeader />

      {/* Main Tab Content - Scrollable Viewport */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative pb-32">
        {activeTab === "today" && (
          <div className="space-y-4">
            {/* 1. Center 100 HP Gauge with 7-Day Trend Toggle */}
            <HealthScoreHero />

            {/* If Core Metrics NOT logged yet, show Core Checklist Card */}
            {!hasLoggedCore ? (
              <div className="px-5">
                <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#D8EDDE] text-[#0A3D22] flex items-center justify-center text-xl shadow-2xs">
                      🌱
                    </div>
                    <div>
                      <h3 className="font-display font-black text-sm text-[#191C1A]">Log Core Health Metrics</h3>
                      <p className="text-[11px] text-neutral-500 font-medium">
                        Log basic sleep, nutrition &amp; water to reveal your plan
                      </p>
                    </div>
                  </div>

                  {/* 3-Core Checklist */}
                  <div className="space-y-2 pt-1 border-t border-neutral-100">
                    <div
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-xl border transition-all",
                        currentLog.sleepHours > 0
                          ? "bg-[#D8EDDE]/50 border-[#1B6C43]/30"
                          : "bg-neutral-50 border-neutral-100"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🌙</span>
                        <span className="text-xs font-bold text-[#191C1A]">Sleep Duration</span>
                      </div>
                      <span
                        className={cn(
                          "text-[10px] font-black px-2 py-0.5 rounded-md border",
                          currentLog.sleepHours > 0
                            ? "bg-[#1B6C43] text-white border-[#1B6C43]"
                            : "text-neutral-500 bg-white border-neutral-200"
                        )}
                      >
                        {currentLog.sleepHours > 0 ? `${currentLog.sleepHours}h ✓` : "Required"}
                      </span>
                    </div>

                    <div
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-xl border transition-all",
                        currentLog.calories > 0
                          ? "bg-[#D8EDDE]/50 border-[#1B6C43]/30"
                          : "bg-neutral-50 border-neutral-100"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🥗</span>
                        <span className="text-xs font-bold text-[#191C1A]">Food &amp; Nutrition</span>
                      </div>
                      <span
                        className={cn(
                          "text-[10px] font-black px-2 py-0.5 rounded-md border",
                          currentLog.calories > 0
                            ? "bg-[#1B6C43] text-white border-[#1B6C43]"
                            : "text-neutral-500 bg-white border-neutral-200"
                        )}
                      >
                        {currentLog.calories > 0 ? `${currentLog.calories} kcal ✓` : "Required"}
                      </span>
                    </div>

                    <div
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-xl border transition-all",
                        currentLog.waterLiters > 0
                          ? "bg-[#D8EDDE]/50 border-[#1B6C43]/30"
                          : "bg-neutral-50 border-neutral-100"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">💧</span>
                        <span className="text-xs font-bold text-[#191C1A]">Hydration Water</span>
                      </div>
                      <span
                        className={cn(
                          "text-[10px] font-black px-2 py-0.5 rounded-md border",
                          currentLog.waterLiters > 0
                            ? "bg-[#1B6C43] text-white border-[#1B6C43]"
                            : "text-neutral-500 bg-white border-neutral-200"
                        )}
                      >
                        {currentLog.waterLiters > 0 ? `${currentLog.waterLiters}L ✓` : "Required"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsEntryModalOpen(true, "manual", selectedDate)}
                    className="w-full h-11 rounded-2xl bg-[#1B6C43] text-white text-xs font-black shadow-md hover:bg-[#155735] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sliders className="w-4 h-4" />
                    <span>+ Log Core Health Data</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* 2. Today's Plan to Recover */}
                <div className="px-5">
                  <TodayCompensationTasks />
                </div>

                {/* Divider between Today's Plan and Tomorrow's Plan */}
                <div className="px-5">
                  <div className="h-[1px] bg-neutral-200/80 w-full" />
                </div>

                {/* 3. Tomorrow's Recovery Plan Coupon */}
                <div className="px-5">
                  <TomorrowPrescriptionCard receipt={receipt} />
                </div>
              </>
            )}

            {/* Section Divider */}
            <div className="px-5">
              <div className="h-[1px] bg-neutral-200/60 w-full" />
            </div>

            {/* 4. Core Health Metrics (Horizontal Swipeable Snap Track) */}
            <QuickMetricsGrid />

            {/* 5. Today's Itemized Health Statement with Barcode Ticket (When logged) */}
            {hasLoggedToday && (
              <>
                <div className="px-5">
                  <div className="h-[1px] bg-neutral-200/60 w-full" />
                </div>
                <div className="px-5 pt-1 space-y-2 pb-4">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#1B6C43]" />
                    Today&apos;s Health Statement
                  </span>
                  <DailyReceiptCard receipt={receipt} />
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "garden" && <GardenCalendarTab />}

        {activeTab === "focus" && <OneBestThingTab />}

        {activeTab === "advisor" && <ShouldIAdvisor />}

        {activeTab === "profile" && <ProfileSettings />}
      </div>

      {/* Floating Bottom Navigation Bar */}
      <BottomNav />

      {/* Global Modals & Drawers */}
      <DataEntryModal />
      <QuickActionModal />
      <ReceiptModal />
      <ShareReceiptModal />
      <HpShieldCard />
    </MobileShell>
  );
}
