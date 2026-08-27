"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface M3CardProps extends HTMLMotionProps<"div"> {
  variant?: "elevated" | "filled" | "outlined" | "tonal" | "sage" | "coral" | "amber";
  interactive?: boolean;
}

export const M3Card = React.forwardRef<HTMLDivElement, M3CardProps>(
  ({ className, variant = "filled", interactive = false, children, ...props }, ref) => {
    const variantStyles = {
      filled: "bg-[#FFFFFF] text-[#191C1A] border border-black/5 shadow-xs",
      elevated: "bg-[#FFFFFF] text-[#191C1A] shadow-md border border-black/5",
      outlined: "bg-[#FFFFFF] border-2 border-[#E1E5E0] text-[#191C1A]",
      tonal: "bg-[#EAEFE8] text-[#191C1A]",
      sage: "bg-[#D8EDDE] text-[#0A3D22] border border-[#B9DEC3]",
      coral: "bg-[#FFE8E6] text-[#690005] border border-[#FFDAD6]",
      amber: "bg-[#FFF4D9] text-[#544300] border border-[#FFE7A3]",
    };

    return (
      <motion.div
        ref={ref}
        whileHover={interactive ? { y: -2, transition: { duration: 0.15 } } : undefined}
        whileTap={interactive ? { scale: 0.985 } : undefined}
        className={cn(
          "rounded-3xl p-5 relative overflow-hidden transition-all duration-200",
          variantStyles[variant],
          interactive && "cursor-pointer select-none",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

M3Card.displayName = "M3Card";
