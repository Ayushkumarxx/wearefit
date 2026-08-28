"use client";

import React from "react";
import { Sparkles, Moon, Footprints, Dumbbell, Salad, Droplet } from "lucide-react";
import { HealthReceipt } from "@/types/health";
import { useHealthStore } from "@/context/useHealthStore";
import { format, addDays, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface TomorrowPrescriptionCardProps {
  receipt: HealthReceipt;
  className?: string;
}

export function TomorrowPrescriptionCard({ receipt, className }: TomorrowPrescriptionCardProps) {
  const { getLogForDate } = useHealthStore();

  const tomorrowDate = (() => {
    try {
      return format(addDays(parseISO(receipt.date), 1), "yyyy-MM-dd");
    } catch {
      return receipt.date;
    }
  })();

  const tomorrowLog = getLogForDate(tomorrowDate);
  const customTomorrowTasks = tomorrowLog?.activeCustomTasks || [];
  const prescriptions = receipt?.prescriptions || [];
  const items = receipt?.items || [];
  // If no debts exist, render minimal clean card with signature dashed coupon border
  if (prescriptions.length === 0 && customTomorrowTasks.length === 0) {
    return (
      <div
        className={cn(
          "relative bg-white rounded-3xl p-5 border-2 border-dashed border-[#1B6C43]/30 shadow-xs text-[#191C1A] space-y-2.5 select-none",
          className
        )}
      >
        <div className="flex items-center justify-between pb-2 border-b border-dashed border-neutral-200">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#1B6C43]" />
            <h4 className="font-display font-black text-xs text-[#191C1A] uppercase tracking-wider">
              Tomorrow Plan
            </h4>
          </div>
          <span className="text-[10px] font-bold text-[#1B6C43]">Solid Balance</span>
        </div>

        <div className="py-1 space-y-0.5">
          <p className="text-xs font-black text-[#191C1A]">You are in solid balance.</p>
          <p className="text-[11px] text-neutral-500 font-medium">No specific plan for tomorrow.</p>
        </div>
      </div>
    );
  }

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Moon":
        return <Moon className="w-4 h-4 text-blue-600" />;
      case "Footprints":
        return <Footprints className="w-4 h-4 text-emerald-600" />;
      case "Dumbbell":
        return <Dumbbell className="w-4 h-4 text-amber-600" />;
      case "Salad":
        return <Salad className="w-4 h-4 text-green-600" />;
      case "Droplet":
        return <Droplet className="w-4 h-4 text-blue-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div
      className={cn(
        "relative bg-white rounded-3xl p-5 border-2 border-dashed border-[#1B6C43]/30 shadow-xs text-[#191C1A] space-y-3",
        className
      )}
    >
      {/* Clean Coupon Header without HP Recovery Pill Tag */}
      <div className="flex items-center justify-between pb-2.5 border-b border-dashed border-neutral-200">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#1B6C43]" />
          <h4 className="font-display font-black text-xs text-[#191C1A] tracking-wider uppercase">
            Tomorrow Plan
          </h4>
        </div>
        <span className="text-[10px] font-bold text-neutral-400">Targeted Fixes</span>
      </div>

      {/* Clean Single-Line Tasks: Icon + Title Only */}
      <div className="space-y-2 font-sans">
        {receipt.prescriptions.map((task) => (
          <div
            key={task.id}
            className="p-3 rounded-2xl bg-[#F7F9F6] border border-neutral-200/70 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-2xs border border-neutral-100">
              {getIcon(task.iconName)}
            </div>
            <span className="text-xs font-bold text-[#191C1A]">
              {task.title}
            </span>
          </div>
        ))}

        {customTomorrowTasks.map((task) => (
          <div
            key={task.id}
            className="p-3 rounded-2xl bg-[#F0F7F2] border border-[#1B6C43]/20 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-2xs border border-emerald-100">
              {getIcon(task.iconName)}
            </div>
            <span className="text-xs font-bold text-[#0A3D22]">
              {task.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
