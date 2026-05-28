import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "expert" | "ai" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  let variantClasses = "bg-white text-gray-900";
  if (variant === "expert") variantClasses = "bg-amber-50 text-gray-900";
  else if (variant === "ai") variantClasses = "bg-agri-green-light text-gray-900";
  else if (variant === "outline") variantClasses = "bg-transparent text-gray-900 shadow-none";

  return (
    <span
      className={`inline-flex items-center border border-gray-200 rounded-xl font-semibold text-[10px] px-2 py-0.5 shadow-sm tracking-wider whitespace-nowrap ${variantClasses} ${className || ""}`}
      {...props}
    />
  );
}
