"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ShieldAlert, HeartPulse, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface CircularHealthGaugeProps {
  score: number;
  maxScore?: number;
  streakDays?: number;
  className?: string;
  onTap?: () => void;
}

export function CircularHealthGauge({
  score,
  maxScore = 100,
  streakDays = 4,
  className,
  onTap,
}: CircularHealthGaugeProps) {
  const [displayedScore, setDisplayedScore] = useState(score);

  useEffect(() => {
    const start = displayedScore;
    const end = Math.max(0, Math.min(100, score));
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
  const size = 260;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, displayedScore / maxScore));
  const strokeDashoffset = circumference - progress * circumference;

  // Determine theme based on score tier
  let tier = {
    color: "#1B6C43",
    gradientStart: "#34D399",
    gradientEnd: "#059669",
    label: "Peak Vitality",
    badgeBg: "bg-[#D8EDDE] text-[#0A3D22] border-[#B9DEC3]",
    icon: <Sparkles className="w-3 h-3 text-[#1B6C43]" />,
  };

  if (displayedScore < 60) {
    tier = {
      color: "#BA1A1A",
      gradientStart: "#FB7185",
      gradientEnd: "#E11D48",
      label: "Recovery Debt",
      badgeBg: "bg-[#FFE8E6] text-[#690005] border-[#FFDAD6]",
      icon: <ShieldAlert className="w-3 h-3 text-[#BA1A1A]" />,
    };
  } else if (displayedScore < 85) {
    tier = {
      color: "#D97706",
      gradientStart: "#FBBF24",
      gradientEnd: "#D97706",
      label: "Balanced",
      badgeBg: "bg-[#FFF4D9] text-[#78350F] border-[#FFE7A3]",
      icon: <HeartPulse className="w-3 h-3 text-[#D97706]" />,
    };
  }

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
      {/* Streak Badge Placed Cleanly Above the Circle */}
      <div className="flex items-center gap-1.5 bg-[#FFF4D9] text-[#78350F] px-3 py-1 rounded-full text-xs font-black border border-[#FFE7A3] shadow-2xs mb-2">
        <Flame className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
        <span>{streakDays}d Active Streak</span>
      </div>

      <div className="relative w-[250px] h-[250px] flex items-center justify-center">
        {/* SVG Progress Ring */}
        <svg className="w-full h-full -rotate-90 drop-shadow-xs" viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id="m3ScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={tier.gradientStart} />
              <stop offset="100%" stopColor={tier.gradientEnd} />
            </linearGradient>

            <filter id="m3GlowShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15" floodColor={tier.gradientEnd} />
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

          {/* Active Arc */}
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
        </svg>

        {/* Center Content Stack */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          {/* Big Bold Score Numbers */}
          <div className="flex items-baseline justify-center font-display my-0.5">
            <span className="text-7xl font-black tracking-tight text-[#191C1A] leading-none">
              {displayedScore}
            </span>
            <span className="text-xl font-black text-[#1B6C43] ml-1 tracking-tight">
              HP
            </span>
          </div>

          {/* Status Tier Badge */}
          <div
            className={cn(
              "px-3 py-0.5 rounded-full text-[11px] font-extrabold tracking-wide flex items-center gap-1 shadow-2xs border mt-1.5",
              tier.badgeBg
            )}
          >
            {tier.icon}
            <span>{tier.label}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
