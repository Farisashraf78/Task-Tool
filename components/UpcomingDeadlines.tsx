"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertCircle } from "lucide-react";
import { format, differenceInDays, differenceInHours } from "date-fns";
import { motion } from "framer-motion";

interface UpcomingDeadlinesProps {
    tasks: any[];
    onTaskClick: (task: any) => void;
}

export function UpcomingDeadlines({ tasks, onTaskClick }: UpcomingDeadlinesProps) {
    const getTimeRemaining = (dueDate: Date) => {
        const now = new Date();
        const days = differenceInDays(dueDate, now);
        const hours = differenceInHours(dueDate, now);

        if (days > 0) return `${days}d left`;
        if (hours > 0) return `${hours}h left`;
        return "Due soon";
    };

    const isUrgent = (dueDate: Date) => {
        return differenceInHours(dueDate, new Date()) < 48;
    };

    return (
        <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] h-full flex flex-col pt-5">
            <div className="px-5 flex items-center justify-between pb-3 border-b border-talabat-border">
                <h3 className="text-base font-semibold text-talabat-text-dark">
                    Upcoming Deadlines
                </h3>
            </div>
            <div className="flex-1 mt-2">
                {tasks.length === 0 ? (
                    <div className="flex items-center gap-2 px-5 py-3 text-talabat-text-muted bg-talabat-light-gray/50 rounded-lg mx-5 mb-5">
                        <Calendar className="h-4 w-4" />
                        <p className="text-sm">No deadlines in the next 7 days</p>
                    </div>
                ) : (
                    <div className="divide-y divide-talabat-border">
                        {tasks.slice(0, 5).map((task, index) => {
                            const dueDate = new Date(task.dueDate);
                            const now = new Date();
                            const isOverdue = dueDate < now;
                            const isToday = dueDate.toDateString() === now.toDateString();

                            let dateColor = "text-talabat-text-muted";
                            if (isOverdue) dateColor = "text-talabat-orange";
                            else if (isToday) dateColor = "text-[#F59E0B]"; // amber

                            return (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => onTaskClick(task)}
                                    className="group flex items-center justify-between px-5 py-3 hover:bg-talabat-light-gray cursor-pointer transition-colors"
                                >
                                    <div className="min-w-0 flex-1 pr-4">
                                        <span className="block font-bold text-talabat-text-dark truncate group-hover:text-talabat-orange transition-colors duration-200">
                                            {task.title}
                                        </span>
                                    </div>

                                    <div className="flex flex-col items-end shrink-0 gap-1.5">
                                        <div className="flex items-center gap-2">
                                            <div className="h-5 w-5 rounded-full bg-talabat-light-gray flex items-center justify-center text-[10px] font-bold text-talabat-text-dark">
                                                {task.assignee?.name?.charAt(0) || "?"}
                                            </div>
                                            <span className="text-xs text-talabat-text-muted">{task.assignee?.name || "Unassigned"}</span>
                                        </div>
                                        <div className={`text-[11px] font-bold uppercase flex items-center gap-1 ${dateColor}`}>
                                            <Clock className="w-3 h-3" />
                                            {format(dueDate, "MMM d")}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
