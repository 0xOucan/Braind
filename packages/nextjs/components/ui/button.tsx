import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '~~/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 outline-none pixel-font retro-shadow hover:retro-shadow-accent active:translate-x-1 active:translate-y-1",
  {
    variants: {
      variant: {
        default: 'btn-pixel-primary text-white',
        destructive: 'bg-red-600 text-white border-2 border-black hover:bg-red-700',
        outline: 'bg-transparent border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black',
        secondary: 'btn-pixel-secondary text-white',
        ghost: 'bg-transparent border-2 border-transparent hover:border-yellow-400 hover:bg-yellow-400 hover:text-black',
        link: 'text-yellow-400 underline-offset-4 hover:underline bg-transparent border-none shadow-none',
        accent: 'btn-pixel-accent text-black',
        success: 'btn-pixel-success text-white',
      },
      size: {
        default: 'h-10 px-6 py-2',
        sm: 'h-8 px-4 py-1 text-xs',
        lg: 'h-12 px-8 py-3 text-base',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }