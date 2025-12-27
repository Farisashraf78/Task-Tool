import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transition-all active:scale-95 duration-200",
    {
        variants: {
            variant: {
                default:
                    "bg-talabat-orange text-white hover:bg-orange-600 shadow-sm hover:shadow-md",
                destructive:
                    "bg-red-500 text-white hover:bg-red-600 shadow-sm",
                outline:
                    "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                secondary:
                    "bg-talabat-offwhite text-talabat-brown border border-talabat-brown/20 hover:bg-white hover:border-talabat-brown/40 shadow-sm",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
                talabat: "bg-talabat-orange text-white hover:bg-orange-600 shadow-md hover:shadow-lg font-bold tracking-wide",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
