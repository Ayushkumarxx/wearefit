"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, X, Zap, Lock } from "lucide-react";
import { useHealthStore } from "@/context/useHealthStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SHIELD_TIERS = [
  { days: 6, hp: 10, name: "Bronze Shield" },
  { days: 10, hp: 20, name: "Silver Shield" },
  { days: 30, hp: 30, name: "Gold Shield" },
  { days: 45, hp: 40, name: "Platinum Shield" },
  { days: 90, hp: 50, name: "Diamond Aegis" },
];

export function HpShieldCard() {
  const {
    dailyLogs,
    selectedDate,
    activateHpShield,
    getLogForDate,
    getReceiptForDate,
    isShieldModalOpen,
    setIsShieldModalOpen,
    lastShieldDeployDate,
  } = useHealthStore();

  // Quality days count (HP >= 75) since last shield deployment
  const allLogs = Object.values(dailyLogs);
  const eligibleLogs = lastShieldDeployDate
    ? allLogs.filter((l) => l.date > lastShieldDeployDate)
    : allLogs;
  const qualityDaysCount = eligibleLogs.filter((l) => getReceiptForDate(l.date).totalScore >= 75).length;

  // Determine active tier and next upgrade tier
  const unlockedTiers = SHIELD_TIERS.filter((t) => qualityDaysCount >= t.days);
  const activeTier = unlockedTiers.length > 0 ? unlockedTiers[unlockedTiers.length - 1] : null;
  const isUnlocked = activeTier !== null;
  const recoveryPower = activeTier ? activeTier.hp : 10;

  const currentReceipt = getReceiptForDate(selectedDate);
  const currentScore = currentReceipt.totalScore;
  const log = getLogForDate(selectedDate);
  const isUsedToday = Boolean(log.hpShieldUsed);

  // Deploy only allowed when HP is strictly below 75
  const isHpEligible = currentScore < 75;
  const canDeploy = isUnlocked && isHpEligible && !isUsedToday;

  const handleActivateShield = () => {
    if (!isUnlocked) {
      toast.error("Shield Locked", {
        description: `Maintain ≥75 HP for ${6 - qualityDaysCount} more days to forge your first shield.`,
      });
      return;
    }

    if (!isHpEligible) {
      toast.info("HP in Good Standing", {
        description: "Shields can only be deployed when daily HP drops below 75.",
      });
      return;
    }

    if (isUsedToday) {
      toast.info("Shield Already Used Today", {
        description: "Your shield has already protected today's health statement.",
      });
      return;
    }

    activateHpShield(selectedDate, recoveryPower);
    toast.success(`Shield Deployed! 🛡️ (+${recoveryPower} HP)`, {
      description: `Restored +${recoveryPower} HP on today's statement.`,
    });
    setIsShieldModalOpen(false);
  };

  return (
    <AnimatePresence>
      {isShieldModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsShieldModalOpen(false)}
            className="fixed inset-0 bg-black/65 backdrop-blur-xs cursor-pointer"
          />

          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4 text-center select-none z-10 text-[#191C1A]"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                Shield Protection
              </span>
              <button
                onClick={() => setIsShieldModalOpen(false)}
                className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Clean Hero Shield Icon */}
            <div className="space-y-2 py-1">
              <div
                className={cn(
                  "w-16 h-16 rounded-3xl flex items-center justify-center text-2xl shadow-md mx-auto transition-all",
                  isUnlocked
                    ? "bg-[#1B6C43] text-white ring-4 ring-[#D8EDDE]"
                    : "bg-neutral-100 text-neutral-400 border border-neutral-200"
                )}
              >
                <Shield className="w-8 h-8 fill-current" />
              </div>

              <div>
                <h2 className="font-display font-black text-xl text-[#191C1A]">
                  {isUnlocked ? `You Have 1 Shield (+${recoveryPower} HP)` : "You Have 0 Shields"}
                </h2>
                <p className="text-xs text-neutral-500 font-medium">
                  {isUnlocked
                    ? "Ready to protect against fatigue or cheat days"
                    : `${Math.max(0, 6 - qualityDaysCount)} more days needed to unlock`}
                </p>
              </div>
            </div>

            {/* Clean Segmented Progress Bar (6 Segments) */}
            <div className="bg-[#F7F9F6] p-3.5 rounded-2xl border border-neutral-200/70 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-neutral-600">Forge Progress</span>
                <span className="text-[#1B6C43] font-black font-mono">
                  {Math.min(6, qualityDaysCount)}/6 Days
                </span>
              </div>

              <div className="grid grid-cols-6 gap-1.5 pt-0.5">
                {Array.from({ length: 6 }).map((_, idx) => {
                  const isFilled = idx < Math.min(6, qualityDaysCount);
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "h-2.5 rounded-full transition-all duration-500",
                        isFilled ? "bg-[#1B6C43] shadow-2xs" : "bg-neutral-200"
                      )}
                    />
                  );
                })}
              </div>
            </div>

            {/* 3 Visual How It Works Points */}
            <div className="bg-[#F7F9F6] p-3.5 rounded-2xl border border-neutral-200/70 text-left text-xs space-y-2.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block px-0.5">
                How Shield Works
              </span>

              <div className="space-y-2 text-[11px]">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-lg bg-[#D8EDDE] text-[#0A3D22] flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">
                    1
                  </div>
                  <p className="text-neutral-600 leading-snug">
                    <strong className="text-[#191C1A]">Forge in 6 Days:</strong> Maintain ≥75 HP for 6 days to unlock your first Bronze Shield (+10 HP).
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-lg bg-[#FFF4D9] text-[#78350F] flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">
                    2
                  </div>
                  <p className="text-neutral-600 leading-snug">
                    <strong className="text-[#191C1A]">Grows with Streak:</strong> 10d (+20 HP) • 30d (+30 HP) • 45d (+40 HP) • 90d (+50 HP).
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-lg bg-neutral-200 text-neutral-800 flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">
                    3
                  </div>
                  <p className="text-neutral-600 leading-snug">
                    <strong className="text-[#191C1A]">Deploy on Bad Days:</strong> Use when HP &lt; 75 to instantly restore HP. Resets to 0 once used.
                  </p>
                </div>
              </div>
            </div>

            {/* Status Alert if HP is too high to deploy */}
            {isUnlocked && !isHpEligible && (
              <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-2xl flex items-center gap-2 text-xs text-amber-900 text-left">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-[11px] leading-tight">
                  HP is currently {currentScore}. Shields are only deployable when HP is below 75.
                </span>
              </div>
            )}

            {/* Single Clean Action Button */}
            {canDeploy ? (
              <button
                onClick={handleActivateShield}
                className="w-full py-3.5 rounded-2xl bg-[#1B6C43] hover:bg-[#155735] text-white text-xs font-black shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                <span>Deploy Shield (+{recoveryPower} HP)</span>
              </button>
            ) : (
              <button
                onClick={() => setIsShieldModalOpen(false)}
                className="w-full py-3 rounded-2xl bg-[#191C1A] text-white text-xs font-bold hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Done
              </button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
