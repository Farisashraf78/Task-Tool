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
        { id: "NEW", title: "To Do", color: "bg-gray-100" },
        { id: "IN_PROGRESS", title: "In Progress", color: "bg-blue-100" },
        { id: "UNDER_REVIEW", title: "Review", color: "bg-purple-100" },
        { id: "COMPLETED", title: "Done", color: "bg-green-100" },
    ];

    return (
        <>
            <div className="flex h-full gap-4 overflow-x-auto pb-4">
                {columns.map((col) => {
                    const colTasks = tasks.filter((t) => t.status === col.id);

                    return (
                        <div key={col.id} className="flex-1 min-w-[280px] flex flex-col">
                            {/* Column Header */}
                            <div className={`${col.color} rounded-t-2xl p-4 border-b-2 border-talabat-orange/30`}>
                                <h3 className="font-bold text-talabat-brown flex items-center justify-between">
                                    {col.title}
                                    <Badge variant="secondary" className="bg-white/80">
                                        {colTasks.length}
                                    </Badge>
                                </h3>
                            </div>

                            {/* Column Content */}
                            <div className="flex-1 bg-white/50 rounded-b-2xl p-3 space-y-3 overflow-y-auto min-h-[400px] border border-talabat-brown/10">
                                {colTasks.map((task, index) => {
                                    const overdue = isOverdue(task);
                                    const isUrgent = task.priority === "URGENT";

                                    return (
                                        <motion.div
                                            key={task.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ scale: 1.02, y: -2 }}
                                        >
                                            <Card
                                                className={`
                                                    cursor-pointer transition-all 
                                                    hover:shadow-lg hover:ring-2 hover:ring-talabat-orange/50
                                                    rounded-2xl border-0 bg-white
                                                    ${overdue ? "ring-2 ring-red-500/50" : ""}
                                                    ${isUrgent ? "bg-red-50" : ""}
                                                `}
                                                onClick={() => setSelectedTask(task)}
                                            >
                                                <CardHeader className="p-4 pb-2">
                                                    <div className="flex justify-between items-start mb-2">
                                                        {/* Priority Badge */}
                                                        <Badge
                                                            variant={
                                                                task.priority === "URGENT" ? "destructive" :
                                                                    task.priority === "HIGH" ? "default" :
                                                                        "secondary"
                                                            }
                                                            className={`
                                                                text-xs px-2 py-0.5 rounded-full
                                                                ${task.priority === "HIGH" ? "bg-talabat-orange text-white" : ""}
                                                                ${isUrgent ? "flex items-center gap-1" : ""}
                                                            `}
                                                        >
                                                            {isUrgent && <Flame className="h-3 w-3" />}
                                                            {task.priority}
                                                        </Badge>

                                                        {/* Status indicator dot */}
                                                        <div className={`
                                                            h-2 w-2 rounded-full
                                                            ${col.id === "COMPLETED" ? "bg-green-500" : ""}
                                                            ${col.id === "UNDER_REVIEW" ? "bg-purple-500" : ""}
                                                            ${col.id === "IN_PROGRESS" ? "bg-blue-500" : ""}
                                                            ${col.id === "NEW" ? "bg-gray-400" : ""}
                                                        `} />
                                                    </div>
                                                    <CardTitle className="text-sm font-semibold text-talabat-brown leading-snug">
                                                        {task.title}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-4 pt-0">
                                                    {task.description && (
                                                        <p className="text-xs text-talabat-brown/60 line-clamp-2 mb-3">
                                                            {task.description}
                                                        </p>
                                                    )}

                                                    <div className="flex items-center justify-between text-xs">
                                                        <div className={`flex items-center gap-1 ${overdue ? "text-red-600 font-semibold" : "text-talabat-brown/60"}`}>
                                                            <Calendar className="w-3 h-3" />
                                                            {task.dueDate ? format(new Date(task.dueDate), "MMM d") : "No date"}
                                                        </div>
                                                        {task.assignee && (
                                                            <div className="flex items-center gap-1 bg-talabat-offwhite/50 px-2 py-1 rounded-full">
                                                                <User className="w-3 h-3 text-talabat-orange" />
                                                                <span className="text-talabat-brown font-medium">
                                                                    {task.assignee.name.split(" ")[0]}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {overdue && (
                                                        <div className="mt-2 text-xs text-red-600 font-semibold flex items-center gap-1">
                                                            ⚠️ Overdue
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    );
                                })}

                                {colTasks.length === 0 && (
                                    <div className="h-32 border-2 border-dashed border-talabat-brown/10 rounded-2xl flex items-center justify-center text-talabat-brown/30 text-sm">
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
