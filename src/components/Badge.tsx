import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "expert" | "ai" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  let variantClasses = "bg-white text-black";
  if (variant === "expert") variantClasses = "bg-neo-yellow text-black";
  else if (variant === "ai") variantClasses = "bg-neo-accent text-black";
  else if (variant === "outline") variantClasses = "bg-transparent text-black shadow-none";

  return (
    <span
      className={`inline-flex items-center border-2 border-black font-black uppercase text-[10px] px-2 py-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] tracking-wider whitespace-nowrap ${variantClasses} ${className || ""}`}
      {...props}
    />
  );
}
