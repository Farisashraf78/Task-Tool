"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { TaskDetailsDialog } from "@/components/TaskDetailsDialog";
import { Calendar, User, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { isOverdue } from "@/lib/taskUtils";

type Task = any;

export function TaskBoard({ tasks, currentUser, users }: { tasks: Task[], currentUser: any, users: any[] }) {
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const columns = [
        { id: "NEW", title: "To Do", borderColor: "border-talabat-text-muted", badgeColor: "bg-talabat-text-muted text-white", dotColor: "bg-talabat-text-muted" },
        { id: "IN_PROGRESS", title: "In Progress", borderColor: "border-talabat-orange", badgeColor: "bg-talabat-orange text-white", dotColor: "bg-talabat-orange" },
        { id: "UNDER_REVIEW", title: "Review", borderColor: "border-talabat-purple", badgeColor: "bg-talabat-purple text-white", dotColor: "bg-talabat-purple" },
        { id: "COMPLETED", title: "Done", borderColor: "border-[#22C55E]", badgeColor: "bg-[#22C55E] text-white", dotColor: "bg-[#22C55E]" },
    ];

    return (
        <>
            <div className="flex h-full gap-4 overflow-x-auto pb-4">
                {columns.map((col) => {
                    const colTasks = tasks.filter((t) => t.status === col.id);

                    return (
                        <div key={col.id} className="flex-1 min-w-[280px] flex flex-col bg-talabat-light-gray/30 rounded-xl">
                            {/* Column Header */}
                            <div className={`bg-white rounded-xl p-4 border-t-[3px] ${col.borderColor} shadow-[0_1px_2px_rgba(0,0,0,0.02)] mb-3`}>
                                <h3 className="font-bold text-talabat-text-dark flex items-center gap-2">
                                    {col.title}
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${col.badgeColor}`}>
                                        {colTasks.length}
                                    </span>
                                </h3>
                            </div>

                            {/* Column Content */}
                            <div className="flex-1 px-2 pb-2 space-y-3 overflow-y-auto min-h-[400px]">
                                {colTasks.map((task, index) => {
                                    const overdue = isOverdue(task);

                                    let priorityBg = "bg-talabat-text-muted"; // LOW
                                    if (task.priority === "URGENT") priorityBg = "bg-talabat-orange";
                                    else if (task.priority === "HIGH") priorityBg = "bg-[#F59E0B]";
                                    else if (task.priority === "MEDIUM") priorityBg = "bg-talabat-purple";

                                    return (
                                        <motion.div
                                            key={task.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            onClick={() => setSelectedTask(task)}
                                            className="bg-white rounded-[10px] shadow-[0_1px_4px_rgba(0,0,0,0.08)] p-4 cursor-pointer relative"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${priorityBg}`}>
                                                    {task.priority}
                                                </span>
                                                <div className={`h-2 w-2 rounded-full shrink-0 ${col.dotColor}`} />
                                            </div>
                                            
                                            <h4 className="text-sm font-semibold text-talabat-text-dark leading-snug mb-3 pr-2">
                                                {task.title}
                                            </h4>
                                            
                                            {overdue && (
                                                <div className="text-[11px] font-bold text-talabat-orange mb-3">
                                                    ⚠️ Overdue
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between mt-auto pt-2 border-t border-talabat-border/50">
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
                                })}

                                {colTasks.length === 0 && (
                                    <div className="h-24 border border-dashed border-talabat-border rounded-lg flex items-center justify-center text-talabat-text-muted text-xs mx-1">
                                        Drop tasks here
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Task Details Dialog */}
            {selectedTask && (
                <TaskDetailsDialog
                    task={selectedTask}
                    currentUser={currentUser}
                    open={!!selectedTask}
                    onOpenChange={(open: boolean) => !open && setSelectedTask(null)}
                    users={users}
                />
            )}
        </>
    );
}
