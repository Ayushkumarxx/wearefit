"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Clock, Sparkles, HeartPulse, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface CircularHealthGaugeProps {
  score: number;
  maxScore?: number;
  streakDays?: number;
  hasData?: boolean;
  className?: string;
  onTap?: () => void;
}

export function CircularHealthGauge({
  score,
  maxScore = 100,
  streakDays = 4,
  hasData = true,
  className,
  onTap,
}: CircularHealthGaugeProps) {
  const [displayedScore, setDisplayedScore] = useState(score);

  // Smooth number increment animation on score change
  useEffect(() => {
    let start = displayedScore;
    let end = score;
    if (start === end) return;

    let frame = 0;
    const totalFrames = 20;
    const interval = setInterval(() => {
      frame++;
      const current = Math.round(start + (end - start) * (frame / totalFrames));
      setDisplayedScore(current);
      if (frame >= totalFrames) clearInterval(interval);
    }, 16);

    return () => clearInterval(interval);
  }, [score, displayedScore]);

  // Radius, dimensions and stroke
  const size = 250;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const isZeroOrEmpty = !hasData || displayedScore === 0;
  const progress = isZeroOrEmpty ? 0 : Math.min(1, displayedScore / maxScore);
  const strokeDashoffset = circumference - progress * circumference;

  // Determine dynamic Lucide icon & gradients based on score
  let tier = {
    color: "#1B6C43",
    gradientStart: "#34D399",
    gradientEnd: "#059669",
    icon: <Sparkles className="w-4 h-4 text-[#1B6C43]" />,
  };

  if (displayedScore < 60) {
    tier = {
      color: "#BA1A1A",
      gradientStart: "#FB7185",
      gradientEnd: "#E11D48",
      icon: <ShieldAlert className="w-4 h-4 text-[#BA1A1A]" />,
    };
  } else if (displayedScore < 85) {
    tier = {
      color: "#D97706",
      gradientStart: "#FBBF24",
      gradientEnd: "#D97706",
      icon: <HeartPulse className="w-4 h-4 text-[#D97706]" />,
    };
  }

  // Calculate hours left until midnight reset
  const [hoursToMidnight, setHoursToMidnight] = useState<number>(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return Math.max(1, Math.ceil((midnight.getTime() - now.getTime()) / (1000 * 60 * 60)));
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = Math.max(1, Math.ceil((midnight.getTime() - now.getTime()) / (1000 * 60 * 60)));
      setHoursToMidnight(diff);
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      onClick={onTap}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "relative flex flex-col items-center justify-center select-none cursor-pointer group py-1",
        className
      )}
    >
      <div className="relative w-[250px] h-[250px] flex items-center justify-center">
        {/* Breathing Liquid Vitality Glow Aura */}
        {displayedScore >= 80 && (
          <motion.div
            initial={{ opacity: 0.3, scale: 0.95 }}
            animate={{ opacity: [0.35, 0.65, 0.35], scale: [0.96, 1.04, 0.96] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-6 rounded-full bg-gradient-to-tr from-emerald-300/30 to-green-400/20 blur-2xl pointer-events-none"
          />
        )}
        {displayedScore >= 60 && displayedScore < 80 && (
          <motion.div
            initial={{ opacity: 0.25, scale: 0.96 }}
            animate={{ opacity: [0.25, 0.5, 0.25], scale: [0.96, 1.02, 0.96] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-6 rounded-full bg-gradient-to-tr from-amber-300/25 to-yellow-400/15 blur-2xl pointer-events-none"
          />
        )}

        {/* SVG Progress Ring */}
        <svg className="w-full h-full -rotate-90 drop-shadow-xs relative z-10" viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id="m3ScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={tier.gradientStart} />
              <stop offset="100%" stopColor={tier.gradientEnd} />
            </linearGradient>

            <filter id="m3GlowShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.25" floodColor={tier.gradientEnd} />
            </filter>
          </defs>

          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5EAE5"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
          />

          {/* Active HP Score Arc (Only when score > 0) */}
          {hasData && displayedScore > 0 && (
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="url(#m3ScoreGradient)"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ type: "spring", stiffness: 50, damping: 14 }}
              filter="url(#m3GlowShadow)"
            />
          )}
        </svg>

        {/* Center Content Stack: Top Dynamic Icon -> Big Score -> Time Left */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-20">
          {/* Top Dynamic Status Icon */}
          <div className="flex items-center justify-center mb-1 text-[#1B6C43]">
            {tier.icon}
          </div>

          {/* Big Bold Score Numbers */}
          <div className="flex items-baseline justify-center font-display leading-none">
            <span className="text-7xl font-black tracking-tight text-[#191C1A]">
              {hasData ? displayedScore : "--"}
            </span>
            <span className="text-xl font-black text-[#1B6C43] ml-1 tracking-tight">
              HP
            </span>
          </div>

          {/* Clean Minimal Time Remaining / Tap to Log */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 mt-2">
            {hasData ? (
              <>
                <Clock className="w-3.5 h-3.5 text-[#1B6C43]" />
                <span>{hoursToMidnight}h left today</span>
              </>
            ) : (
              <span className="text-[#1B6C43] font-black bg-[#D8EDDE] px-2 py-0.5 rounded-full text-[10px]">
                Tap to Log Today
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
