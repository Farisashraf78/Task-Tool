"use client";

import { Card } from "@/components/ui/card";
import { ListTodo, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface GlassmorphicMetricsProps {
    total: number;
    inProgress: number;
    underReview: number;
    completed: number;
}

export function GlassmorphicMetrics({ total, inProgress, underReview, completed }: GlassmorphicMetricsProps) {
    const metrics = [
        {
            label: "Total Tasks",
            value: total,
            icon: ListTodo,
            borderColor: "border-l-talabat-orange",
            iconColor: "text-talabat-orange"
        },
        {
            label: "In Progress",
            value: inProgress,
            icon: Clock,
            borderColor: "border-l-talabat-purple",
            iconColor: "text-talabat-purple"
        },
        {
            label: "Needs Review",
            value: underReview,
            icon: AlertCircle,
            borderColor: "border-l-talabat-lime",
            iconColor: "text-talabat-text-dark" // "with dark text" for Needs Review
        },
        {
            label: "Completed",
            value: completed,
            icon: CheckCircle2,
            borderColor: "border-l-[#22C55E]",
            iconColor: "text-[#22C55E]"
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
                <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                >
                    <div className={`bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-talabat-border border-l-[4px] ${metric.borderColor} p-5 relative flex flex-col justify-between`}>
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-talabat-text-muted">
                                {metric.label}
                            </p>
                            <metric.icon className={`h-4 w-4 ${metric.iconColor}`} />
                        </div>
                        <span className="text-[32px] font-bold text-talabat-text-dark tracking-tight leading-none mt-1">
                            {metric.value}
                        </span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
