"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface M3ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: "filled" | "tonal" | "elevated" | "outlined" | "danger" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  children?: React.ReactNode;
  icon?: React.ReactNode;
}

export const M3Button = React.forwardRef<HTMLButtonElement, M3ButtonProps>(
  ({ className, variant = "filled", size = "md", children, icon, disabled, ...props }, ref) => {
    const baseStyles =
      "relative inline-flex items-center justify-center font-medium transition-colors outline-none select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97]";

    const variantStyles = {
      filled: "bg-[#1B6C43] text-white hover:bg-[#155735] shadow-sm active:bg-[#10472A]",
      tonal: "bg-[#D8EDDE] text-[#0A3D22] hover:bg-[#C8E4D0] active:bg-[#B7DBC1]",
      elevated: "bg-white text-[#191C1A] shadow-md hover:shadow-lg border border-black/5 active:bg-neutral-50",
      outlined: "border-2 border-[#C0C9C1] text-[#191C1A] hover:bg-[#1B6C43]/5 active:bg-[#1B6C43]/10",
      danger: "bg-[#BA1A1A] text-white hover:bg-[#9E1414] active:bg-[#830F0F]",
      ghost: "text-[#191C1A] hover:bg-black/5 active:bg-black/10",
    };

    const sizeStyles = {
      sm: "h-9 px-4 rounded-full text-xs font-semibold gap-1.5",
      md: "h-12 px-6 rounded-full text-sm font-semibold gap-2",
      lg: "h-14 px-8 rounded-full text-base font-bold gap-2.5",
      icon: "h-11 w-11 rounded-full p-0 flex items-center justify-center",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled ? 1 : 0.96 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        disabled={disabled}
        {...props}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {children}
      </motion.button>
    );
  }
);

M3Button.displayName = "M3Button";
