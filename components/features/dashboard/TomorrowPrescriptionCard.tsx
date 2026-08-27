"use client";

import React from "react";
import { Sparkles, Moon, Footprints, Dumbbell, Salad, Droplet } from "lucide-react";
import { HealthReceipt } from "@/types/health";
import { cn } from "@/lib/utils";

interface TomorrowPrescriptionCardProps {
  receipt: HealthReceipt;
  className?: string;
}

export function TomorrowPrescriptionCard({ receipt, className }: TomorrowPrescriptionCardProps) {
  // If score is pristine (>=95) with no penalties, no recovery is needed
  if (receipt.items.length === 0 || receipt.totalScore >= 95 || receipt.prescriptions.length === 0) {
    return null;
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
      </div>
    </div>
  );
}
