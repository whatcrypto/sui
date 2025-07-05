import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  // Base classes for all buttons
  const baseClasses =
    "relative font-medium transition-all duration-200 rounded-lg focus-ring inline-flex items-center justify-center";

  // Size variants
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    xl: "px-10 py-5 text-xl",
  };

  // Style variants matching Sui's design
  const variantClasses = {
    primary:
      "bg-gradient-to-r from-blue-500 to-violet-500 text-white hover:from-blue-600 hover:to-violet-600 hover:translate-y-[-2px] hover:shadow-lg shadow-[0_4px_20px_0_rgba(99,102,241,0.3)]",
    secondary:
      "glass-card border border-white/10 text-white hover:bg-white/5 hover:border-white/20 hover:translate-y-[-1px]",
    danger:
      "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 hover:translate-y-[-2px] hover:shadow-lg shadow-[0_4px_20px_0_rgba(239,68,68,0.3)]",
    ghost: "text-gray-300 hover:text-white hover:bg-white/5",
  };

  // Disabled state
  const disabledClasses = "opacity-50 cursor-not-allowed hover:translate-y-0";

  return (
    <button
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabled || isLoading ? disabledClasses : ""}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
}
