"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListTodo, Clock, AlertCircle, CheckCircle2 } from "lucide-react";

interface TaskMetricsProps {
    total: number;
    inProgress: number;
    underReview: number;
    completed: number;
    overdue: number;
}

export function TaskMetrics({ total, inProgress, underReview, completed, overdue }: TaskMetricsProps) {
    const metrics = [
        {
            title: "Total Tasks",
            value: total,
            icon: ListTodo,
            color: "text-talabat-brown",
            bgColor: "bg-talabat-brown/10",
        },
        {
            title: "In Progress",
            value: inProgress,
            icon: Clock,
            color: "text-blue-600",
            bgColor: "bg-blue-100",
        },
        {
            title: "Needs Review",
            value: underReview,
            icon: AlertCircle,
            color: "text-talabat-purple",
            bgColor: "bg-purple-100",
        },
        {
            title: "Completed",
            value: completed,
            icon: CheckCircle2,
            color: "text-green-600",
            bgColor: "bg-green-100",
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
                <Card key={metric.title} className="border-l-4 border-l-talabat-orange">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-talabat-brown">
                            {metric.title}
                        </CardTitle>
                        <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                            <metric.icon className={`h-4 w-4 ${metric.color}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-talabat-brown">{metric.value}</div>
                        {metric.title === "Needs Review" && metric.value > 0 && (
                            <p className="text-xs text-talabat-purple mt-1">
                                Requires attention
                            </p>
                        )}
                    </CardContent>
                </Card>
            ))}

            {overdue > 0 && (
                <Card className="border-l-4 border-l-red-500 bg-red-50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-700">
                            Overdue Tasks
                        </CardTitle>
                        <div className="p-2 rounded-lg bg-red-100">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-700">{overdue}</div>
                        <p className="text-xs text-red-600 mt-1 font-medium">
                            Immediate action needed
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
