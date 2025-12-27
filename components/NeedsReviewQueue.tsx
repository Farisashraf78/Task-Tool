"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, MessageSquare, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { updateTaskStatus } from "@/app/actions/task";
import { useState } from "react";

interface NeedsReviewQueueProps {
    tasks: any[];
    onTaskClick: (task: any) => void;
}

export function NeedsReviewQueue({ tasks, onTaskClick }: NeedsReviewQueueProps) {
    const [processing, setProcessing] = useState<string | null>(null);

    const handleQuickApprove = async (taskId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setProcessing(taskId);
        await updateTaskStatus(taskId, "COMPLETED");
        setProcessing(null);
    };

    if (tasks.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-talabat-purple text-xl flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-talabat-purple animate-pulse" />
                    Needs Review ({tasks.length})
                </h3>
                <Badge className="bg-talabat-purple text-white">Priority Action</Badge>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
                {tasks.map((task, index) => (
                    <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card
                            className="border-l-4 border-l-talabat-purple cursor-pointer hover:shadow-lg transition-shadow bg-purple-50/30"
                            onClick={() => onTaskClick(task)}
                        >
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base text-talabat-brown flex items-center justify-between">
                                    <span className="line-clamp-1">{task.title}</span>
                                    <Badge variant="outline" className="text-xs whitespace-nowrap ml-2">
                                        {task.assignee?.name}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-xs text-talabat-brown/60">
                                    Due: {task.dueDate && format(task.dueDate, "MMM d")}
                                </p>

                                {/* Quick Actions */}
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={(e) => handleQuickApprove(task.id, e)}
                                        disabled={processing === task.id}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        {processing === task.id ? "Approving..." : "Approve"}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onTaskClick(task);
                                        }}
                                        className="flex-1"
                                    >
                                        <MessageSquare className="h-3 w-3 mr-1" />
                                        Feedback
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onTaskClick(task);
                                        }}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
