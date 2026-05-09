import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border-2 border-black bg-clip-padding text-sm font-bold whitespace-nowrap outline-none select-none focus-visible:border-black focus-visible:ring-0 active:not-aria-[haspopup]:translate-y-[2px] active:not-aria-[haspopup]:translate-x-[2px] active:not-aria-[haspopup]:shadow-none disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-red-500 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]",
  {
    variants: {
      variant: {
        default: "bg-neo-accent text-black",
        outline:
          "bg-white hover:bg-neo-yellow",
        secondary:
          "bg-neo-pink text-black hover:bg-neo-yellow",
        ghost:
          "shadow-none border-transparent hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-transparent hover:bg-neo-yellow",
        destructive:
          "bg-red-400 text-black hover:bg-red-500",
        link: "shadow-none border-transparent underline underline-offset-4 bg-transparent text-black hover:bg-transparent hover:text-blue-600 active:translate-y-0 active:translate-x-0",
      },
      size: {
        default:
          "h-10 gap-2 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-7 gap-1 px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-3 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2 text-lg px-6 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-10",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
