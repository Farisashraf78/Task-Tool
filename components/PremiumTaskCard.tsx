"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, Clock, AlertTriangle, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { isOverdue } from "@/lib/taskUtils";

interface PremiumTaskCardProps {
    task: any;
    onClick: () => void;
}

export function PremiumTaskCard({ task, onClick }: PremiumTaskCardProps) {
    const overdue = isOverdue(task);
    const isUrgent = task.priority === "URGENT";
    const isCompleted = task.status === "COMPLETED";

    // Priority-based styling
    const getPriorityStyle = () => {
        if (isUrgent) {
            return "border-l-4 border-l-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]";
        }
        if (task.priority === "HIGH") {
            return "border-l-4 border-l-talabat-orange";
        }
        return "border-l-4 border-l-talabat-purple/30";
    };

    const getPriorityBadge = () => {
        if (isUrgent) {
            return (
                <Badge className="bg-red-500 text-white flex items-center gap-1">
                    <Flame className="h-3 w-3" />
                    URGENT
                </Badge>
            );
        }
        if (task.priority === "HIGH") {
            return <Badge className="bg-talabat-orange text-white">HIGH</Badge>;
        }
        if (task.priority === "MEDIUM") {
            return <Badge variant="secondary">MEDIUM</Badge>;
        }
        return <Badge variant="outline" className="border-talabat-brown/20">LOW</Badge>;
    };

    const getStatusBadge = () => {
        if (isCompleted) {
            return (
                <Badge className="bg-talabat-green text-talabat-brown font-bold">
                    ✓ COMPLETED
                </Badge>
            );
        }
        if (overdue) {
            return (
                <Badge className="bg-red-100 text-red-700 border border-red-300">
                    OVERDUE
                </Badge>
            );
        }
        return (
            <Badge variant="outline" className="text-talabat-brown/60">
                {task.status.replace("_", " ")}
            </Badge>
        );
    };

    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
        >
            <Card
                className={`cursor-pointer relative group overflow-hidden ${getPriorityStyle()} ${overdue ? "bg-red-50" : isCompleted ? "bg-green-50/50" : "bg-white"
                    } hover:shadow-xl transition-all duration-200`}
                onClick={onClick}
            >
                {/* Urgent glow effect */}
                {isUrgent && (
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5 animate-pulse" />
                )}

                <CardHeader className="pb-3 relative z-10">
                    <div className="flex justify-between items-start">
                        {getPriorityBadge()}
                        {getStatusBadge()}
                    </div>
                    <CardTitle className={`text-lg leading-snug mt-2 ${isUrgent ? "text-red-700 font-bold" : "text-talabat-brown"
                        }`}>
                        {isUrgent && <Flame className="inline h-5 w-5 mr-1 text-red-500" />}
                        {task.title}
                    </CardTitle>
                </CardHeader>

                <CardContent className="pb-3 relative z-10">
                    <p className="text-sm text-talabat-brown/70 line-clamp-2">
                        {task.description || "No description provided."}
                    </p>
                </CardContent>

                <CardFooter className="pt-0 flex flex-col items-start gap-2 text-xs text-talabat-brown/50 relative z-10">
                    <div className="flex items-center w-full justify-between">
                        <div className={`flex items-center gap-1 ${overdue ? "text-red-600 font-bold" : ""}`}>
                            {overdue && <AlertTriangle className="h-3 w-3" />}
                            <Calendar className="w-3 h-3" />
                            {task.dueDate ? format(task.dueDate, "MMM d, yyyy") : "No date"}
                        </div>
                        {task.assignee && (
                            <div className="flex items-center gap-1 bg-talabat-offwhite px-2 py-1 rounded-full">
                                <div className="h-2 w-2 rounded-full bg-talabat-orange" />
                                <span className="text-talabat-brown font-medium">{task.assignee.name}</span>
                            </div>
                        )}
                    </div>

                    {overdue && (
                        <motion.div
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="text-red-600 font-semibold text-xs flex items-center gap-1"
                        >
                            <Clock className="h-3 w-3" />
                            Action needed now!
                        </motion.div>
                    )}
                </CardFooter>
            </Card>
        </motion.div>
    );
}
