"use client";

import React, { useState, useEffect } from "react";
import { useHealthStore } from "@/context/useHealthStore";
import { MobileShell } from "@/components/layout/MobileShell";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { OnboardingFlow } from "@/components/features/onboarding/OnboardingFlow";
import { HealthScoreHero } from "@/components/features/dashboard/HealthScoreHero";
import { QuickMetricsGrid } from "@/components/features/dashboard/QuickMetricsGrid";
import { TodayCompensationTasks } from "@/components/features/dashboard/TodayCompensationTasks";
import { DailyReceiptCard } from "@/components/features/dashboard/DailyReceiptCard";
import { TomorrowPrescriptionCard } from "@/components/features/dashboard/TomorrowPrescriptionCard";
import { OneBestThingTab } from "@/components/features/focus/OneBestThingTab";
import { DataEntryModal } from "@/components/features/logging/DataEntryModal";
import { ReceiptModal } from "@/components/features/dashboard/ReceiptModal";
import { GardenCalendarTab } from "@/components/features/garden/GardenCalendarTab";
import { ShouldIAdvisor } from "@/components/features/should-i/ShouldIAdvisor";
import { ProfileSettings } from "@/components/features/profile/ProfileSettings";
import { Sparkles } from "lucide-react";

export default function HomePage() {
  const { isOnboarded, activeTab, selectedDate, getReceiptForDate } = useHealthStore();
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

  const receipt = getReceiptForDate(selectedDate);

  return (
    <MobileShell>
      {/* Top Header with Reset Countdown */}
      <AppHeader />

      {/* Main Tab Content - Scrollable Viewport */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative pb-32">
        {activeTab === "today" && (
          <div className="space-y-4">
            {/* 1. Center 100 HP Gauge with 7-Day HP Trend Toggle */}
            <HealthScoreHero />

            {/* 2. Today's Plan to Recover */}
            <TodayCompensationTasks />

            {/* Divider between Today's Plan and Tomorrow's Plan */}
            <div className="px-5">
              <div className="h-[1px] bg-neutral-200/80 w-full" />
            </div>

            {/* 3. Tomorrow's Recovery Plan Coupon (If debt exists) */}
            <div className="px-5">
              <TomorrowPrescriptionCard receipt={receipt} />
            </div>

            {/* Section Divider */}
            <div className="px-5">
              <div className="h-[1px] bg-neutral-200/60 w-full" />
            </div>

            {/* 4. Core Health Metrics (Horizontal Swipeable Snap Track) */}
            <QuickMetricsGrid />

            {/* Section Divider */}
            <div className="px-5">
              <div className="h-[1px] bg-neutral-200/60 w-full" />
            </div>

            {/* 5. Today's Itemized Health Statement with Barcode Ticket */}
            <div className="px-5 pt-1 space-y-2 pb-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#1B6C43]" />
                Today's Health Statement
              </span>
              <DailyReceiptCard receipt={receipt} />
            </div>
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
      <ReceiptModal />
    </MobileShell>
  );
}
