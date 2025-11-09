import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "font-bebas text-h5 uppercase px-8 py-4 min-h-[48px] border-3 transition-all duration-300 hover:scale-105 active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
  {
    variants: {
      variant: {
        outlined: "border-black bg-transparent text-black hover:bg-black hover:text-white",
        filled: "border-black bg-black text-white hover:bg-white hover:text-black hover:border-black",
        "outlined-white": "border-white bg-transparent text-white hover:bg-white hover:text-black",
        "filled-white": "border-white bg-white text-black hover:bg-black hover:text-white hover:border-white",
      },
      size: {
        default: "px-8 py-4 text-h5",
        sm: "px-6 py-3 text-h6",
        lg: "px-10 py-5 text-h4",
      },
    },
    defaultVariants: {
      variant: "outlined",
      size: "default",
    },
  }
)

export interface GhxstshipButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  showArrow?: boolean
}

const GhxstshipButton = React.forwardRef<HTMLButtonElement, GhxstshipButtonProps>(
  ({ className, variant, size, asChild = false, showArrow = true, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
        {showArrow && (
          <span className="inline-block transition-transform group-hover:translate-x-1">
            →
          </span>
        )}
      </Comp>
    )
  }
)
GhxstshipButton.displayName = "GhxstshipButton"

export { GhxstshipButton, buttonVariants }
