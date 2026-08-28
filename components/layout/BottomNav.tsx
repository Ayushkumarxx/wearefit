"use client";

import React from "react";
import { motion } from "framer-motion";
import { HeartPulse, Target, Trees, HelpCircle, User, Plus } from "lucide-react";
import { useHealthStore } from "@/context/useHealthStore";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const { activeTab, setActiveTab, setIsQuickActionOpen } = useHealthStore();

  const navItems = [
    { id: "today" as const, label: "Today", icon: HeartPulse },
    { id: "garden" as const, label: "Garden", icon: Trees },
    { id: "focus" as const, label: "Focus", icon: Target },
    { id: "advisor" as const, label: "Should I?", icon: HelpCircle },
    { id: "profile" as const, label: "Profile", icon: User },
  ];

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-3 z-50 pointer-events-none">
      {/* Floating Translucent Frosted Glass Pill Dock */}
      <div className="w-full bg-white/85 backdrop-blur-2xl border border-white/80 shadow-[0_12px_40px_rgba(0,0,0,0.14)] rounded-full p-1.5 flex items-center justify-around pointer-events-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "relative flex flex-col items-center justify-center py-1.5 px-2.5 rounded-full transition-all duration-200 outline-none select-none cursor-pointer",
                isActive
                  ? "text-[#1B6C43] font-bold"
                  : "text-neutral-500 font-medium hover:text-neutral-900"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activePill"
                  className="absolute inset-0 bg-[#D8EDDE]/95 rounded-full -z-10 shadow-xs border border-[#1B6C43]/20"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <Icon
                className={cn(
                  "w-4 h-4 mb-0.5 transition-transform duration-200",
                  isActive ? "scale-110 stroke-[2.5]" : "stroke-[2]"
                )}
              />
              <span className="text-[9px] tracking-tight font-medium">{item.label}</span>
            </button>
          );
        })}

        {/* Floating Quick Action Button */}
        <button
          onClick={() => setIsQuickActionOpen(true)}
          className="w-9 h-9 rounded-full bg-[#1B6C43] text-white shadow-md flex items-center justify-center hover:bg-[#155735] active:scale-90 transition-all ml-0.5 shrink-0 cursor-pointer"
          aria-label="Add health entry"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
