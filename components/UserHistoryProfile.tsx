"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
    ArrowLeft, MessageSquare, ListTodo
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface Task {
    id: string;
    title: string;
    description: string | null;
    status: string;
    classification: string;
    revisionCount: number;
    dueDate: string | null;
    completedAt: string | null;
    createdAt: string;
    updatedAt: string;
    comments: any[];
    activityLogs: any[];
}

interface Project {
    id: string;
    title: string;
    description: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
}

interface User {
    id: string;
    name: string;
    assignedTasks: Task[];
    assignedProjects: Project[];
}

interface UserHistoryProfileProps {
    user: User;
}

export function UserHistoryProfile({ user }: UserHistoryProfileProps) {
    const [activeTab, setActiveTab] = useState("MONTHLY"); // MONTHLY, OTHER, PROJECTS
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const tasks = user.assignedTasks || [];
    const projects = user.assignedProjects || [];

    // Filter Tasks
    const monthlyTasks = tasks.filter((t) => t.classification === "MONTHLY");
    const otherTasks = tasks.filter((t) => t.classification !== "MONTHLY");

    // Metrics Calculation
    const completedTasks = tasks.filter((t) => t.status === "COMPLETED");
    const onTimeTasks = completedTasks.filter((t) => {
        if (!t.dueDate) return true;
        const delivered = t.completedAt ? new Date(t.completedAt) : new Date(t.updatedAt);
        return delivered <= new Date(t.dueDate);
    });

    const lateTasks = completedTasks.length - onTimeTasks.length;
    const onTimeRate = completedTasks.length > 0 ? Math.round((onTimeTasks.length / completedTasks.length) * 100) : 0;
    const lateRate = completedTasks.length > 0 ? Math.round((lateTasks / completedTasks.length) * 100) : 0;

    // Determine which list to show
    const getList = () => {
        if (activeTab === "PROJECTS") return projects;
        if (activeTab === "MONTHLY") return monthlyTasks;
        return otherTasks;
    };

    const currentList = getList();

    const getStatusBadge = (item: any, isProject = false) => {
        if (isProject) {
            return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{item.status}</Badge>;
        }

        // Task Logic
        if (item.status === "COMPLETED") {
            const delivered = item.completedAt ? new Date(item.completedAt) : new Date(item.updatedAt);
            const isLate = item.dueDate && delivered > new Date(item.dueDate);
            if (isLate) return <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">LATE DELIVERY</Badge>;
            return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">ON TIME</Badge>;
        }

        if (item.revisionCount > 0) {
            return <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">REDONE {item.revisionCount}x</Badge>;
        }

        return <Badge variant="secondary" className="text-gray-500">{item.status.replace("_", " ")}</Badge>;
    };

    return (
        <div className="max-w-[1600px] mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/history">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-talabat-orange flex items-center justify-center text-white text-xl font-bold">
                        {user.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{user.name}&apos;s File</h1>
                        <p className="text-gray-500 text-sm">Employee History & Performance</p>
                    </div>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Performance</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-bold text-gray-900">{onTimeRate}%</span>
                        <span className="text-xs text-green-600 font-medium">On-Time</span>
                    </div>
                    {lateRate > 0 && (
                        <p className="text-[10px] text-red-500 font-medium mt-1">
                            {lateRate}% Late ({lateTasks} tasks)
                        </p>
                    )}
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Monthly Tasks</p>
                    <div className="text-3xl font-bold text-gray-900 mt-2">{monthlyTasks.length}</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Projects</p>
                    <div className="text-3xl font-bold text-gray-900 mt-2">{projects.length}</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Total Tasks</p>
                    <div className="text-3xl font-bold text-gray-900 mt-2">{tasks.length}</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-gray-100 pb-1">
                <button
                    onClick={() => setActiveTab("MONTHLY")}
                    className={cn(
                        "px-6 py-3 text-sm font-semibold rounded-t-lg transition-colors border-b-2",
                        activeTab === "MONTHLY" ? "border-talabat-orange text-talabat-orange bg-orange-50/50" : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    )}
                >
                    Monthly Tasks
                </button>
                <button
                    onClick={() => setActiveTab("OTHER")}
                    className={cn(
                        "px-6 py-3 text-sm font-semibold rounded-t-lg transition-colors border-b-2",
                        activeTab === "OTHER" ? "border-talabat-orange text-talabat-orange bg-orange-50/50" : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    )}
                >
                    Other Tasks
                </button>
                <button
                    onClick={() => setActiveTab("PROJECTS")}
                    className={cn(
                        "px-6 py-3 text-sm font-semibold rounded-t-lg transition-colors border-b-2",
                        activeTab === "PROJECTS" ? "border-talabat-orange text-talabat-orange bg-orange-50/50" : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    )}
                >
                    Projects
                </button>
            </div>

            {/* Content List */}
            <div className="space-y-3">
                {currentList.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        No items found in this category.
                    </div>
                ) : (
                    currentList.map((item: any) => (
                        <div key={item.id} className="group bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-all duration-200 flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    {getStatusBadge(item, activeTab === "PROJECTS")}
                                    <span className="text-xs text-gray-400">
                                        {activeTab === "PROJECTS" ? "Created" : "Assigned"}: {format(new Date(item.createdAt), "MMM d, yyyy")}
                                    </span>
                                </div>
                                <h3
                                    className={cn(
                                        "font-bold text-gray-900 truncate pr-4",
                                        activeTab !== "PROJECTS" && "cursor-pointer hover:text-talabat-orange"
                                    )}
                                    onClick={() => activeTab !== "PROJECTS" && setSelectedTask(item as Task)}
                                >
                                    {item.title}
                                </h3>
                                {item.description && <p className="text-sm text-gray-500 truncate mt-1">{item.description}</p>}
                            </div>

                            <div className="flex items-center gap-6 pl-6 border-l border-gray-50">
                                <div className="text-right">
                                    <p className="text-xs text-gray-400 font-medium uppercase">Delivered</p>
                                    <p className="text-sm font-semibold text-gray-700">
                                        {item.status === 'COMPLETED' ? format(new Date(item.completedAt || item.updatedAt), "MMM d") : "-"}
                                    </p>
                                </div>
                                {activeTab !== "PROJECTS" && item.dueDate && (
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400 font-medium uppercase">Due Date</p>
                                        <p className={cn(
                                            "text-sm font-semibold",
                                            new Date(item.dueDate) < new Date() && item.status !== 'COMPLETED' ? "text-red-600" : "text-gray-700"
                                        )}>
                                            {format(new Date(item.dueDate), "MMM d")}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Task Detail Dialog */}
            <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="text-talabat-orange">{selectedTask?.title}</span>
                            <Badge variant="outline">{selectedTask?.classification}</Badge>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Status Info */}
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Status</p>
                                <p className="text-sm font-semibold">{selectedTask?.status.replace("_", " ")}</p>
                            </div>
                            <div className="h-8 w-px bg-gray-200" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Assigned</p>
                                <p className="text-sm font-semibold">{selectedTask && format(new Date(selectedTask.createdAt), "MMM d, yyyy")}</p>
                            </div>
                            {selectedTask?.completedAt && (
                                <>
                                    <div className="h-8 w-px bg-gray-200" />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold">Delivered</p>
                                        <p className="text-sm font-semibold">{format(new Date(selectedTask.completedAt), "MMM d, yyyy")}</p>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Description */}
                        {selectedTask?.description && (
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-2">Description</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">{selectedTask.description}</p>
                            </div>
                        )}

                        {/* Activity Logs (Transfers etc) */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <ListTodo className="h-4 w-4 text-gray-400" />
                                Activity & Transfers
                            </h4>
                            <div className="space-y-2 border-l-2 border-gray-100 ml-2 pl-4">
                                {selectedTask?.activityLogs && selectedTask.activityLogs.length > 0 ? (
                                    selectedTask.activityLogs.map((log: { id: string, createdAt: string, action: string, details: string | null }) => (
                                        <div key={log.id} className="text-xs py-1">
                                            <span className="font-semibold text-gray-700">{format(new Date(log.createdAt), "MMM d, HH:mm")}</span>
                                            <span className="text-gray-500 mx-2">—</span>
                                            <span className="text-gray-600">{log.action.replace("_", " ")}: {log.details}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-400 italic">No activity recorded for this task.</p>
                                )}
                            </div>
                        </div>

                        {/* Comments */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-gray-400" />
                                Task Comments
                            </h4>
                            <div className="space-y-3">
                                {selectedTask?.comments && selectedTask.comments.length > 0 ? (
                                    selectedTask.comments.map((comment: { id: string, author: { name: string }, createdAt: string, content: string }) => (
                                        <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-bold text-gray-900">{comment.author?.name || "Member"}</span>
                                                <span className="text-[10px] text-gray-400">{format(new Date(comment.createdAt), "MMM d, HH:mm")}</span>
                                            </div>
                                            <p className="text-sm text-gray-700">{comment.content}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-400 italic">No comments on this task.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
