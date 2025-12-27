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
        <Card className="border border-gray-200 shadow-sm bg-white h-full">
            <CardHeader className="pb-3 border-b border-gray-50">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                        <Calendar className="h-5 w-5 text-talabat-orange" />
                        Upcoming Deadlines
                    </CardTitle>
                    <span className="text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-full">
                        Next 7 Days
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <Calendar className="h-10 w-10 mb-2 opacity-20" />
                        <p className="text-sm">No upcoming deadlines this week</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {tasks.slice(0, 5).map((task, index) => {
                            const urgent = isUrgent(new Date(task.dueDate));

                            return (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => onTaskClick(task)}
                                    className="group flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <div className="min-w-0 flex-1 pr-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="block font-medium text-gray-800 truncate group-hover:text-talabat-orange transition-colors duration-200">
                                                {task.title}
                                            </span>
                                            {task.priority === "URGENT" && (
                                                <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">URGENT</Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {format(new Date(task.dueDate), "MMM d")}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                                            <span>{task.assignee?.name}</span>
                                        </div>
                                    </div>

                                    <div className={`
                                        flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                                        ${urgent
                                            ? "bg-red-50 text-red-700 border-red-100"
                                            : "bg-gray-50 text-gray-600 border-gray-100"}
                                    `}>
                                        {urgent && <AlertCircle className="h-3 w-3" />}
                                        {getTimeRemaining(new Date(task.dueDate))}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
