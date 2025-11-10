import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import styles from "./ghxstship-button.module.css"

const buttonVariants = cva(
  styles.button,
  {
    variants: {
      variant: {
        outlined: styles.outlined,
        filled: styles.filled,
        "outlined-white": styles.outlinedWhite,
        "filled-white": styles.filledWhite,
      },
      size: {
        sm: styles.sm,
        default: "",
        lg: styles.lg,
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
          <span className={styles.arrow}>
            →
          </span>
        )}
      </Comp>
    )
  }
)
GhxstshipButton.displayName = "GhxstshipButton"

export { GhxstshipButton, buttonVariants }
