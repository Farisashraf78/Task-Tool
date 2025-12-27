"use client";

import { useState } from "react";
import { format, isSameMonth } from "date-fns";
import {
    LayoutDashboard, Building2,
    TrendingUp, Users
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface User {
    id: string;
    name: string;
    role: string;
}

interface Task {
    id: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    dueDate: string | null;
    completedAt: string | null;
    assigneeId: string | null;
}

interface Project {
    id: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    dueDate: string | null;
    assignees: { id: string }[];
}

interface DualDashboardProps {
    users: User[];
    tasks: Task[];
    projects: Project[];
    currentUser: User;
}

export function DualDashboard({ users, tasks, projects, currentUser }: DualDashboardProps) {
    const [activeTab, setActiveTab] = useState("TASKS"); // TASKS vs PROJECTS
    const [viewMode, setViewMode] = useState("MONTHLY"); // MONTHLY vs ALL_TIME

    const isManager = currentUser.role === "MANAGER";
    const currentMonth = new Date();

    // Filter Logic
    const filteredTasks = tasks.filter(t => {
        if (viewMode === "MONTHLY") {
            return isSameMonth(new Date(t.createdAt), currentMonth);
        }
        return true;
    });

    const filteredProjects = projects.filter(p => {
        if (viewMode === "MONTHLY") {
            return isSameMonth(new Date(p.createdAt), currentMonth);
        }
        return true;
    });

    // --- TASK METRICS ---
    const calculateTaskMetrics = (userTasks: Task[]) => {
        const total = userTasks.length;
        if (total === 0) return { total: 0, completed: 0, onTime: 0, late: 0, rate: 0, onTimeRate: 0 };

        const completed = userTasks.filter(t => t.status === "COMPLETED");
        const onTime = completed.filter(t => {
            if (!t.dueDate) return true;
            const delivered = t.completedAt ? new Date(t.completedAt) : new Date(t.updatedAt);
            return delivered <= new Date(t.dueDate);
        });

        return {
            total,
            completed: completed.length,
            onTime: onTime.length,
            late: completed.length - onTime.length,
            rate: Math.round((completed.length / total) * 100),
            onTimeRate: completed.length > 0 ? Math.round((onTime.length / completed.length) * 100) : 0
        };
    };

    // --- PROJECT METRICS ---
    const calculateProjectMetrics = (userProjects: Project[]) => {
        const total = userProjects.length;
        if (total === 0) return { total: 0, active: 0, completed: 0, rate: 0, onTimeRate: 0 };

        const completed = userProjects.filter(p => p.status === "COMPLETED");
        const onTime = completed.filter(p => {
            if (!p.dueDate) return true;
            return new Date(p.updatedAt) <= new Date(p.dueDate);
        });

        return {
            total,
            active: total - completed.length,
            completed: completed.length,
            rate: Math.round((completed.length / total) * 100),
            onTimeRate: completed.length > 0 ? Math.round((onTime.length / completed.length) * 100) : 0
        };
    };

    return (
        <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab("TASKS")}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                            activeTab === "TASKS" ? "bg-white text-talabat-orange shadow-sm" : "text-gray-500 hover:text-gray-900"
                        )}
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        Task Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab("PROJECTS")}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                            activeTab === "PROJECTS" ? "bg-white text-talabat-orange shadow-sm" : "text-gray-500 hover:text-gray-900"
                        )}
                    >
                        <Building2 className="h-4 w-4" />
                        Project Dashboard
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">View:</span>
                    <select
                        value={viewMode}
                        onChange={(e) => setViewMode(e.target.value)}
                        className="text-sm border-gray-200 rounded-md shadow-sm focus:border-talabat-orange focus:ring-talabat-orange"
                    >
                        <option value="MONTHLY">Current Month ({format(currentMonth, "MMMM")})</option>
                        <option value="ALL_TIME">All Time</option>
                    </select>
                </div>
            </div>

            {/* DASHBOARD CONTENT */}
            <div className="grid gap-6">
                {activeTab === "TASKS" ? (
                    /* TASK VIEW */
                    <div className="space-y-6">
                        {/* Team Overview Card */}
                        {isManager && (
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Users className="h-5 w-5 text-talabat-orange" />
                                    Team Performance ({viewMode === "MONTHLY" ? "This Month" : "All Time"})
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100 text-left text-gray-500">
                                                <th className="py-3 font-medium">Member</th>
                                                <th className="py-3 font-medium">Tasks Assigned</th>
                                                <th className="py-3 font-medium">Completion Rate</th>
                                                <th className="py-3 font-medium">On-Time %</th>
                                                <th className="py-3 font-medium">Late Deliveries</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {users.filter(u => u.role !== 'MANAGER').map(user => {
                                                // Get tasks for this user
                                                const userTasks = filteredTasks.filter(t => t.assigneeId === user.id);
                                                const metrics = calculateTaskMetrics(userTasks);

                                                return (
                                                    <tr key={user.id} className="group hover:bg-gray-50 transition-colors">
                                                        <td className="py-3 flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">
                                                                {user.name.charAt(0)}
                                                            </div>
                                                            <span className="font-semibold text-gray-900">{user.name}</span>
                                                        </td>
                                                        <td className="py-3 text-gray-600 font-medium">{metrics.total}</td>
                                                        <td className="py-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-green-500" style={{ width: `${metrics.rate}%` }} />
                                                                </div>
                                                                <span className="text-xs font-medium">{metrics.rate}%</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3">
                                                            <span className={cn(
                                                                "px-2 py-0.5 rounded text-xs font-bold",
                                                                metrics.onTimeRate >= 80 ? "bg-green-100 text-green-700" :
                                                                    metrics.onTimeRate >= 50 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                                                            )}>
                                                                {metrics.onTimeRate}%
                                                            </span>
                                                        </td>
                                                        <td className="py-3 font-medium text-red-600">
                                                            {metrics.late > 0 ? `${metrics.late} Tasks` : "-"}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* My Stats for Non-Manager */}
                        {!isManager && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card>
                                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">My Tasks</CardTitle></CardHeader>
                                    <CardContent><div className="text-3xl font-bold">{filteredTasks.filter(t => t.assigneeId === currentUser.id).length}</div></CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Completion</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-green-600">
                                            {calculateTaskMetrics(filteredTasks.filter(t => t.assigneeId === currentUser.id)).rate}%
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">On Time</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-talabat-orange">
                                            {calculateTaskMetrics(filteredTasks.filter(t => t.assigneeId === currentUser.id)).onTimeRate}%
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                ) : (
                    /* PROJECT VIEW */
                    <div className="space-y-6">
                        {isManager ? (
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-blue-500" />
                                    Project Output ({viewMode === "MONTHLY" ? "This Month" : "All Time"})
                                </h3>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100 text-left text-gray-500">
                                            <th className="py-3 font-medium">Member</th>
                                            <th className="py-3 font-medium">Projects Assigned</th>
                                            <th className="py-3 font-medium">Completed Projects</th>
                                            <th className="py-3 font-medium">Completion Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {users.filter(u => u.role !== 'MANAGER').map(user => {
                                            const userProjects = filteredProjects.filter(p => p.assignees.some((a) => a.id === user.id));
                                            const metrics = calculateProjectMetrics(userProjects);
                                            return (
                                                <tr key={user.id} className="group hover:bg-gray-50 transition-colors">
                                                    <td className="py-3 flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        <span className="font-semibold text-gray-900">{user.name}</span>
                                                    </td>
                                                    <td className="py-3 font-medium">{metrics.total}</td>
                                                    <td className="py-3 font-medium text-green-600">{metrics.completed}</td>
                                                    <td className="py-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">{metrics.rate}%</span>
                                                            <span className="text-[10px] text-gray-400">({metrics.onTimeRate}% On-Time)</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-400">
                                Detailed project metrics are available to Managers. You can view your projects in the Projects tab.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
