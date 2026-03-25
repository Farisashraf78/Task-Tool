"use client";

import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { NewTaskDialog } from "./NewTaskDialog";
import { TaskDetailsDialog } from "./TaskDetailsDialog";
import { GlassmorphicMetrics } from "./GlassmorphicMetrics";
import { TeamPulse } from "./TeamPulse";
import { UpcomingDeadlines } from "./UpcomingDeadlines";
import { TaskBoard } from "./TaskBoard";
import { BentoTaskCard } from "./BentoTaskCard";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, X, LayoutGrid, Columns3, Filter, Download, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { isOverdue } from "@/lib/taskUtils";

interface BentoDashboardProps {
    tasks: any[];
    users: any[];
    currentUser: any;
}

export function PremiumDashboard({ tasks, users, currentUser }: BentoDashboardProps) {
    const router = useRouter();
    const [viewMode, setViewMode] = useState<"board" | "grid">("board");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTask, setSelectedTask] = useState<any | null>(null);

    const isManager = currentUser.role === "MANAGER";

    // Auto-refresh
    useEffect(() => {
        const interval = setInterval(() => {
            router.refresh();
        }, 5000); // Relaxed to 5s to reduce jitter

        return () => clearInterval(interval);
    }, [router]);

    // Calculate metrics
    const metrics = useMemo(() => ({
        total: tasks.length,
        inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
        underReview: tasks.filter((t) => t.status === "UNDER_REVIEW").length,
        completed: tasks.filter((t) => t.status === "COMPLETED").length,
    }), [tasks]);

    // Search filtering
    const filteredTasks = useMemo(() => {
        if (!searchQuery) return tasks;

        const query = searchQuery.toLowerCase();
        return tasks.filter(
            (task) =>
                task.title.toLowerCase().includes(query) ||
                task.description?.toLowerCase().includes(query) ||
                task.assignee?.name.toLowerCase().includes(query)
        );
    }, [tasks, searchQuery]);

    // Team capacity data
    const teamCapacity = useMemo(() => {
        return users
            .filter((u) => u.role === "MEMBER")
            .map((user) => ({
                name: user.name,
                activeTasks: tasks.filter(
                    (t) => t.assigneeId === user.id && t.status !== "COMPLETED"
                ).length,
                overdueTasks: tasks.filter((t) => t.assigneeId === user.id && isOverdue(t)).length,
            }));
    }, [users, tasks]);

    // Upcoming deadlines (next 7 days)
    const upcomingDeadlines = useMemo(
        () =>
            filteredTasks
                .filter((task) => {
                    if (!task.dueDate || task.status === "COMPLETED") return false;
                    const dueDate = new Date(task.dueDate);
                    const today = new Date();
                    const weekFromNow = new Date();
                    weekFromNow.setDate(weekFromNow.getDate() + 7);
                    return dueDate >= today && dueDate <= weekFromNow;
                })
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
        [filteredTasks]
    );

    const handleExport = () => {
        const headers = "ID,Title,Status,Priority,Assignee,Due Date,Classification,Created At\n";
        const rows = filteredTasks.map(t => {
            const dueDate = t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—";
            const createdAt = new Date(t.createdAt).toLocaleDateString();
            return `${t.id},"${t.title.replace(/"/g, '""')}",${t.status},${t.priority},"${t.assignee?.name || "Unassigned"}",${dueDate},${t.classification || "OTHER"},${createdAt}`;
        }).join("\n");

        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tasks-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 p-6">
            {/* 1. Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        {isManager ? "Overview of team performance and deadlines" : "Your personal workspace"}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        className="h-10 border-gray-200 text-gray-600 hover:text-gray-900 gap-2"
                    >
                        <Download className="h-4 w-4" />
                        Export CSV
                    </Button>
                    {currentUser.name.toLowerCase().includes("maha") && (
                        <NewTaskDialog users={users} currentUserId={currentUser.id} />
                    )}
                </div>
            </div>

            {/* 2. KPI Summary */}
            <section>
                <GlassmorphicMetrics
                    total={metrics.total}
                    inProgress={metrics.inProgress}
                    underReview={metrics.underReview}
                    completed={metrics.completed}
                />
            </section>

            {/* 3. Main Focus Area - Split Layout */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-full">
                    <UpcomingDeadlines tasks={upcomingDeadlines} onTaskClick={setSelectedTask} />
                </div>
                <div className="lg:col-span-1 h-full">
                    {isManager ? (
                        <TeamPulse teamMembers={teamCapacity} />
                    ) : (
                        <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] h-full flex flex-col pt-5">
                            <div className="px-5 pb-3 border-b border-talabat-border">
                                <h3 className="text-base font-semibold text-talabat-text-dark">
                                    My Tasks Summary
                                </h3>
                            </div>
                            <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                                {tasks
                                    .filter(t => t.assigneeId === currentUser.id && t.status !== "COMPLETED")
                                    .sort((a, b) => {
                                        if (!a.dueDate) return 1;
                                        if (!b.dueDate) return -1;
                                        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
                                    })
                                    .slice(0, 8)
                                    .map(task => {
                                        return (
                                            <div key={task.id} className="flex flex-col gap-1.5 p-3 hover:bg-talabat-light-gray rounded-lg cursor-pointer transition-colors" onClick={() => setSelectedTask(task)}>
                                                <div className="flex items-start justify-between gap-3">
                                                    <span className="text-sm font-bold text-talabat-text-dark line-clamp-1">
                                                        {task.title}
                                                    </span>
                                                    <span className="text-[10px] whitespace-nowrap font-bold px-2 py-0.5 rounded-full bg-talabat-light-gray text-talabat-text-dark">
                                                        {task.status.replace("_", " ")}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[11px] text-talabat-text-muted font-bold uppercase mt-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "No date"}
                                                </div>
                                            </div>
                                        );
                                })}
                                {tasks.filter(t => t.assigneeId === currentUser.id && t.status !== "COMPLETED").length === 0 && (
                                    <div className="text-center py-8 text-sm text-talabat-text-muted">
                                        No active tasks
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* 4. Task Management Area */}
            <section className="space-y-4 pt-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-gray-900">All Tasks</h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                            {filteredTasks.length}
                        </span>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {/* Search Input */}
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search tasks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9 text-sm bg-white border-gray-200 focus:border-talabat-orange focus:ring-talabat-orange/20 rounded-lg"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    <X className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                                </button>
                            )}
                        </div>

                        {/* View Filters */}
                        {isManager && (
                            <div className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-lg border border-gray-200/50">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewMode("board")}
                                    className={`h-7 px-2 rounded-md transition-all ${viewMode === "board" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    <Columns3 className="h-4 w-4 mr-1.5" />
                                    Board
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewMode("grid")}
                                    className={`h-7 px-2 rounded-md transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    <LayoutGrid className="h-4 w-4 mr-1.5" />
                                    Grid
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Task Content */}
                <div className="min-h-[400px]">
                    {viewMode === "board" && isManager ? (
                        <TaskBoard tasks={filteredTasks} currentUser={currentUser} users={users} />
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        >
                            {filteredTasks.map((task) => (
                                <BentoTaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />
                            ))}
                            {filteredTasks.length === 0 && (
                                <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                        <Filter className="h-8 w-8 text-gray-300" />
                                    </div>
                                    <h3 className="text-gray-900 font-medium mb-1">No tasks found</h3>
                                    <p className="text-gray-500 text-sm">Try adjusting your search terms</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Task Details Dialog Modal */}
            {selectedTask && (
                <TaskDetailsDialog
                    task={selectedTask}
                    currentUser={currentUser}
                    open={!!selectedTask}
                    onOpenChange={(open: boolean) => {
                        if (!open) {
                            setSelectedTask(null);
                            router.refresh();
                        }
                    }}
                    users={users}
                />
            )}
        </div>
    );
}
