"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, User, Flame, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { isOverdue } from "@/lib/taskUtils";

interface BentoTaskCardProps {
    task: any;
    onClick: () => void;
}

export function BentoTaskCard({ task, onClick }: BentoTaskCardProps) {
    const overdue = isOverdue(task);
    const isUrgent = task.priority === "URGENT";
    const isCompleted = task.status === "COMPLETED";

    const getPriorityBadge = () => {
        if (isUrgent) {
            return (
                <div className="absolute top-3 right-3 bg-red-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                    <Flame className="h-3 w-3" />
                    URGENT
                </div>
            );
        }
        if (task.priority === "HIGH") {
            return (
                <div className="absolute top-3 right-3 bg-orange-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    HIGH
                </div>
            );
        }
        return null;
    };

    const getStatusColor = () => {
        switch (task.status) {
            case "COMPLETED":
                return "bg-green-500/10 text-green-700 ring-green-500/30";
            case "UNDER_REVIEW":
                return "bg-purple-500/10 text-purple-700 ring-purple-500/30";
            case "IN_PROGRESS":
                return "bg-blue-500/10 text-blue-700 ring-blue-500/30";
            default:
                return "bg-gray-500/10 text-gray-700 ring-gray-500/30";
        }
    };

    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="group"
        >
            <Card
                onClick={onClick}
                className={`
          relative overflow-hidden cursor-pointer
          backdrop-blur-sm bg-white/90 border-0
          rounded-3xl shadow-md
          transition-all duration-300
          hover:shadow-2xl hover:ring-2 hover:ring-talabat-orange/50
          ${overdue ? "ring-2 ring-red-500/50" : ""}
          ${isCompleted ? "opacity-80" : ""}
        `}
            >
                {/* Urgent glow effect */}
                {isUrgent && (
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-orange-500/5 to-transparent animate-pulse" />
                )}

                {/* Completed checkmark overlay */}
                {isCompleted && (
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent">
                        <Sparkles className="absolute top-4 right-4 h-6 w-6 text-green-500 opacity-50" />
                    </div>
                )}

                {/* Priority badge */}
                {getPriorityBadge()}

                <div className="p-6 space-y-4 relative z-10">
                    {/* Title */}
                    <h3 className={`
            font-semibold text-lg leading-snug
            ${isUrgent ? "text-red-700" : "text-talabat-brown"}
            group-hover:text-talabat-orange transition-colors
          `}>
                        {task.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-talabat-brown/60 line-clamp-2 leading-relaxed">
                        {task.description || "No description provided."}
                    </p>

                    {/* Status pill */}
                    <div className="flex items-center gap-2">
                        <span className={`
              px-3 py-1 rounded-full text-xs font-semibold
              ring-1 ${getStatusColor()}
              transition-all duration-300
            `}>
                            {task.status.replace("_", " ")}
                        </span>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-talabat-brown/10">
                        <div className="flex items-center gap-2 text-xs text-talabat-brown/50">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className={overdue ? "text-red-600 font-semibold" : ""}>
                                {task.dueDate ? format(task.dueDate, "MMM d") : "No date"}
                            </span>
                        </div>

                        {task.assignee && (
                            <div className="flex items-center gap-2 bg-talabat-offwhite/50 px-3 py-1.5 rounded-full">
                                <User className="w-3 h-3 text-talabat-orange" />
                                <span className="text-xs font-medium text-talabat-brown">{task.assignee.name.split(" ")[0]}</span>
                            </div>
                        )}
                    </div>

                    {/* Overdue warning */}
                    {overdue && !isCompleted && (
                        <motion.div
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-center py-2 text-xs font-bold"
                        >
                            ⚠️ OVERDUE - ACTION REQUIRED
                        </motion.div>
                    )}
                </div>
            </Card>
        </motion.div>
    );
}
