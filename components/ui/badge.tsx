import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-talabat-brown text-white hover:bg-talabat-brown/80",
                secondary:
                    "border-transparent bg-talabat-offwhite text-talabat-brown hover:bg-talabat-offwhite/80",
                destructive:
                    "border-transparent bg-red-500 text-white hover:bg-red-600",
                outline: "text-foreground",
                success: "border-transparent bg-talabat-green text-talabat-brown hover:bg-talabat-green/80",
                warning: "border-transparent bg-yellow-400 text-talabat-brown hover:bg-yellow-500",
                purple: "border-transparent bg-talabat-purple text-white hover:bg-talabat-purple/80",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
