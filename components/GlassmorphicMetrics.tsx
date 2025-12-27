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
            color: "text-gray-600",
            bg: "bg-gray-100",
        },
        {
            label: "In Progress",
            value: inProgress,
            icon: Clock,
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            label: "Needs Review",
            value: underReview,
            icon: AlertCircle,
            color: "text-amber-600",
            bg: "bg-amber-50",
        },
        {
            label: "Completed",
            value: completed,
            icon: CheckCircle2,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
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
                    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white">
                        <div className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">{metric.label}</p>
                                <span className="text-2xl font-bold text-gray-900 tracking-tight">
                                    {metric.value}
                                </span>
                            </div>
                            <div className={`p-3 rounded-lg ${metric.bg}`}>
                                <metric.icon className={`h-5 w-5 ${metric.color}`} />
                            </div>
                        </div>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}
