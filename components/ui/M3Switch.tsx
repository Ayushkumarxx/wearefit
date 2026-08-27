"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface M3SwitchProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  sublabel?: string;
  icon?: React.ReactNode;
  variant?: "danger" | "primary";
  className?: string;
}

export function M3Switch({
  checked,
  onChange,
  onCheckedChange,
  label,
  sublabel,
  icon,
  variant = "primary",
  className,
}: M3SwitchProps) {
  const activeBg = variant === "danger" ? "bg-[#BA1A1A]" : "bg-[#1B6C43]";

  const handleToggle = () => {
    const nextVal = !checked;
    if (onChange) onChange(nextVal);
    if (onCheckedChange) onCheckedChange(nextVal);
  };

  // If label or sublabel is provided, render full card row
  if (label || sublabel || icon) {
    return (
      <div
        onClick={handleToggle}
        className={cn(
          "flex items-center justify-between p-3 rounded-2xl cursor-pointer select-none transition-colors border",
          checked ? "bg-white border-neutral-300 shadow-2xs" : "bg-neutral-50/80 border-neutral-200/60 hover:bg-neutral-100",
          className
        )}
      >
        <div className="flex items-center gap-2.5 pr-2">
          {icon && <div className="text-base shrink-0">{icon}</div>}
          <div>
            {label && <p className="text-xs font-bold text-[#191C1A] leading-tight">{label}</p>}
            {sublabel && <p className="text-[10px] text-neutral-500 mt-0.5 leading-tight">{sublabel}</p>}
          </div>
        </div>

        <div
          className={cn(
            "w-11 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 shrink-0",
            checked ? activeBg : "bg-[#DDE3DD]"
          )}
        >
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 600, damping: 30 }}
            className={cn(
              "h-5 w-5 rounded-full bg-white shadow-xs flex items-center justify-center text-[9px] font-bold",
              checked ? "ml-auto text-[#1B6C43]" : "ml-0 text-transparent"
            )}
          >
            {checked ? "✓" : ""}
          </motion.div>
        </div>
      </div>
    );
  }

  // Standalone pill toggle switch
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={handleToggle}
      className={cn(
        "w-11 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 shrink-0 cursor-pointer",
        checked ? activeBg : "bg-[#DDE3DD]",
        className
      )}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 600, damping: 30 }}
        className={cn(
          "h-5 w-5 rounded-full bg-white shadow-xs flex items-center justify-center text-[9px] font-bold",
          checked ? "ml-auto text-[#1B6C43]" : "ml-0 text-transparent"
        )}
      >
        {checked ? "✓" : ""}
      </motion.div>
    </button>
  );
}
