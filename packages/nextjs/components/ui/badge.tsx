import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "~~/lib/utils"

const badgeVariants = cva(
  "badge-pixel inline-flex items-center border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-yellow-400 text-black border-black",
        secondary: "bg-purple-600 text-white border-black",
        destructive: "bg-red-600 text-white border-black",
        outline: "bg-transparent text-foreground border-current",
        success: "bg-green-600 text-white border-black",
        info: "bg-blue-600 text-white border-black",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }