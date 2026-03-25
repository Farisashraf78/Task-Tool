"use client";

import { format } from "date-fns";
import { Calendar, User } from "lucide-react";
import { motion } from "framer-motion";
import { isOverdue } from "@/lib/taskUtils";

interface BentoTaskCardProps {
    task: any;
    onClick: () => void;
}

export function BentoTaskCard({ task, onClick }: BentoTaskCardProps) {
    const overdue = isOverdue(task);

    let priorityBg = "bg-talabat-text-muted"; // LOW
    if (task.priority === "URGENT") priorityBg = "bg-talabat-orange";
    else if (task.priority === "HIGH") priorityBg = "bg-[#F59E0B]";
    else if (task.priority === "MEDIUM") priorityBg = "bg-talabat-purple";

    let dotColor = "bg-talabat-text-muted"; // NEW
    if (task.status === "COMPLETED") dotColor = "bg-[#22C55E]";
    else if (task.status === "UNDER_REVIEW") dotColor = "bg-talabat-purple";
    else if (task.status === "IN_PROGRESS") dotColor = "bg-talabat-orange";

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -2 }}
            onClick={onClick}
            className="bg-white rounded-[10px] shadow-[0_1px_4px_rgba(0,0,0,0.08)] p-4 cursor-pointer relative flex flex-col h-full"
        >
            <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${priorityBg}`}>
                    {task.priority}
                </span>
                <div className={`h-2 w-2 rounded-full shrink-0 ${dotColor}`} />
            </div>
            
            <h4 className="text-sm font-semibold text-talabat-text-dark leading-snug mb-3 pr-2">
                {task.title}
            </h4>
            
            {overdue && (
                <div className="text-[11px] font-bold text-talabat-orange mb-3">
                    ⚠️ Overdue
                </div>
            )}

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-talabat-border/50">
                <div className="flex items-center gap-1.5 text-xs text-talabat-text-muted">
                    <Calendar className="w-3 h-3" />
                    {task.dueDate ? format(new Date(task.dueDate), "MMM d") : "No date"}
                </div>
                {task.assignee && (
                    <div className="flex items-center gap-1.5">
                        <div className="h-5 w-5 rounded-full bg-talabat-orange text-white flex items-center justify-center text-[9px] font-bold">
                            {task.assignee.name.charAt(0)}
                        </div>
                        <span className="text-[11px] font-medium text-talabat-text-dark">
                            {task.assignee.name.split(" ")[0]}
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
