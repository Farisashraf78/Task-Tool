"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { CheckCircle2, MoreHorizontal, Plus, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { NewTaskDialog } from "./NewTaskDialog";
import { EditProjectDialog } from "./EditProjectDialog";
import { updateTask } from "@/app/actions/task";
import { deleteProject } from "@/app/actions/projects";
import { ConfirmDialog } from "./ConfirmDialog";
import { useRouter } from "next/navigation";

// Types
interface ProjectDetailsProps {
    project: any;
    currentUser: any;
    users: any[];
}

export function ProjectDetailsClient({ project, currentUser, users }: ProjectDetailsProps) {
    const isManager = currentUser.role === "MANAGER";

    // Member View defaults to "MY_TASKS", Manager to "TASKS" (All)
    const [activeTab, setActiveTab] = useState(isManager ? "TASKS" : "MY_TASKS");
    const [taskFilter, setTaskFilter] = useState("ALL");
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const router = useRouter();

    const myTasks = project.tasks.filter((t: any) => t.assigneeId === currentUser.id);
    const completedTasksCount = project.tasks.filter((t: any) => t.status === "COMPLETED").length;
    const totalTasks = project._count.tasks || 0;
    const progress = totalTasks > 0 ? (completedTasksCount / totalTasks) * 100 : 0;

    const calculateDaysRemaining = () => {
        if (!project.dueDate) return null;
        const diff = new Date(project.dueDate).getTime() - new Date().getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };
    const daysRemaining = calculateDaysRemaining();

    // Task Filter Logic
    const getFilteredTasks = (tasksToFilter: any[]) => {
        if (taskFilter === "COMPLETED") return tasksToFilter.filter((t: any) => t.status === "COMPLETED");
        if (taskFilter === "PENDING") return tasksToFilter.filter((t: any) => t.status !== "COMPLETED");
        return tasksToFilter;
    };

    const displayTasks = activeTab === "MY_TASKS" ? getFilteredTasks(myTasks) : getFilteredTasks(project.tasks);

    // Quick Action: Mark Complete (Member)
    const handleToggleStatus = async (task: any) => {
        const newStatus = task.status === "COMPLETED" ? "NEW" : "COMPLETED"; // Simple toggle
        await updateTask(task.id, { status: newStatus });
        // Optimistic update could go here, but revalidatePath handles it usually
    };

    const handleDeleteProject = async () => {
        const result = await deleteProject(project.id);
        if (result.success) {
            router.push("/projects");
        } else {
            alert(result.error || "Failed to delete project");
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 p-6">
            {/* 1. Project Overview */}
            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm space-y-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="space-y-3 max-w-3xl">
                        <div className="flex items-center gap-4 flex-wrap">
                            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">{project.title}</h1>
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border",
                                    project.status === "ACTIVE" ? "bg-green-50 text-green-700 border-green-200" :
                                        project.status === "AT_RISK" ? "bg-red-50 text-red-700 border-red-200" :
                                            "bg-slate-50 text-slate-600 border-slate-200"
                                )}>
                                    {project.status.replace("_", " ")}
                                </span>
                                {(project.priority === "HIGH" || project.priority === "URGENT") && (
                                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-red-50 text-red-700 border border-red-200">
                                        {project.priority} Priority
                                    </span>
                                )}
                            </div>
                        </div>
                        <p className="text-lg text-slate-500 leading-relaxed">
                            {project.description || "No description provided."}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {isManager && (
                            <>
                                <Button
                                    variant="outline"
                                    className="h-10 border-slate-200 text-slate-600 hover:text-slate-900 gap-2"
                                    onClick={() => setEditDialogOpen(true)}
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                    Settings
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="h-10 gap-2 shrink-0 bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white transition-all"
                                    onClick={() => setDeleteConfirmOpen(true)}
                                >
                                    Delete Project
                                </Button>
                                <EditProjectDialog
                                    project={project}
                                    open={editDialogOpen}
                                    onOpenChange={setEditDialogOpen}
                                />
                                <NewTaskDialog
                                    users={users}
                                    currentUserId={currentUser.id}
                                    defaultProjectId={project.id}
                                >
                                    <Button className="h-10 bg-[#FF5900] hover:bg-[#FF5900]/90 text-white rounded-lg shadow-md hover:shadow-lg transition-all font-medium">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Task
                                    </Button>
                                </NewTaskDialog>
                            </>
                        )}
                        {!isManager && (
                            <div className="text-right">
                                <span className="text-xs text-slate-400 font-medium">Your Role</span>
                                <p className="font-bold text-slate-700">Team Member</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Timeline & Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8 border-t border-slate-100">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between text-sm text-slate-500 font-medium mb-2">
                            <span>Project Timeline</span>
                            <span>{daysRemaining !== null ? `${daysRemaining} days remaining` : "No deadlines set"}</span>
                        </div>
                        <div className="relative h-12 bg-slate-50 rounded-xl border border-slate-200 flex items-center px-4 overflow-hidden">
                            <div className="flex items-center justify-between w-full relative z-10">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-slate-400" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-bold text-slate-400">Start</span>
                                        <span className="text-xs font-semibold text-slate-700">
                                            {project.startDate ? format(new Date(project.startDate), "MMM d") : "N/A"}
                                        </span>
                                    </div>
                                </div>
                                <div className="h-0.5 flex-1 mx-4 bg-slate-200 border-t border-dashed border-slate-300" />
                                <div className="flex items-center gap-2">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] uppercase font-bold text-slate-400">Due</span>
                                        <span className="text-xs font-semibold text-slate-700">
                                            {project.dueDate ? format(new Date(project.dueDate), "MMM d, yyyy") : "N/A"}
                                        </span>
                                    </div>
                                    <div className={cn(
                                        "h-2 w-2 rounded-full",
                                        project.dueDate && new Date(project.dueDate) < new Date() ? "bg-red-500" : "bg-slate-300"
                                    )} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm font-medium">
                            <span className="text-slate-500">Completion Status</span>
                            <span className="text-[#FF5900] font-bold">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#CFFF00] transition-all duration-1000 ease-out rounded-full shadow-sm"
                                style={{ width: `${progress}%`, backgroundColor: progress === 100 ? '#CFFF00' : '#FF5900' }}
                            />
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                            <span>{totalTasks} Tasks</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span>{completedTasksCount} Done</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Tabs */}
            <div className="flex items-center border-b border-gray-200">
                {(isManager ? ["Tasks", "Team", "Activity"] : ["My Tasks", "All Tasks", "My Contribution", "Activity"]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab.replace(" ", "_").toUpperCase())}
                        className={cn(
                            "px-6 py-4 text-sm font-medium transition-colors relative",
                            activeTab === tab.replace(" ", "_").toUpperCase()
                                ? "text-[#FF5900]"
                                : "text-slate-500 hover:text-slate-800"
                        )}
                    >
                        {tab}
                        {activeTab === tab.replace(" ", "_").toUpperCase() && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF5900]"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* 3. Content Areas */}

            {/* MY TASKS (Member Primary) */}
            {activeTab === "MY_TASKS" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                        <h2 className="text-lg font-bold text-gray-900">My Assigned Tasks</h2>
                        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-100">
                            {["ALL", "PENDING", "COMPLETED"].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setTaskFilter(f)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                                        taskFilter === f
                                            ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                                            : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    {f.charAt(0) + f.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {displayTasks.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                            <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <p className="text-slate-500 font-medium">You have no tasks matching this filter.</p>
                            <p className="text-slate-400 text-sm mt-1">Great job! Check "All Tasks" to see if you can help others.</p>
                        </div>
                    ) : (
                        displayTasks.map((task: any) => {
                            const isAssignee = task.assigneeId === currentUser.id;
                            const canToggle = isManager || isAssignee;

                            return (
                                <motion.div
                                    key={task.id}
                                    layout
                                    className="group flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:shadow-md hover:border-[#FF5900]/20 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => canToggle && handleToggleStatus(task)}
                                            disabled={!canToggle}
                                            className={cn(
                                                "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                                task.status === "COMPLETED"
                                                    ? "bg-green-100 border-green-500"
                                                    : "border-slate-300 hover:border-[#FF5900]",
                                                !canToggle && "opacity-40 cursor-not-allowed"
                                            )}>
                                            {task.status === "COMPLETED" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                                        </button>
                                        <div>
                                            <h3 className={cn(
                                                "font-bold text-gray-900 transition-colors",
                                                task.status === "COMPLETED" && "line-through text-slate-400"
                                            )}>
                                                {task.title}
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-1 line-clamp-1">{task.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {(task.priority === "URGENT" || task.priority === "HIGH") &&
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-red-50 text-red-600">
                                                {task.priority}
                                            </span>
                                        }
                                        {task.dueDate && (
                                            <span className={cn(
                                                "text-xs font-medium flex items-center gap-1",
                                                new Date(task.dueDate) < new Date() && task.status !== "COMPLETED" ? "text-red-500" : "text-slate-400"
                                            )}>
                                                <Clock className="h-3 w-3" />
                                                {format(new Date(task.dueDate), "MMM d")}
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            )}

            {/* ALL TASKS (Manager Primary / Member Secondary) */}
            {(activeTab === "TASKS" || activeTab === "ALL_TASKS") && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                            {activeTab === "ALL_TASKS" ? "All Project Tasks (Read Only)" : "Project Tasks"}
                        </h2>
                        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-100">
                            {["ALL", "PENDING", "COMPLETED"].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setTaskFilter(f)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                                        taskFilter === f
                                            ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                                            : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    {f.charAt(0) + f.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-3">
                        {displayTasks.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200">
                                <p className="text-slate-500 font-medium">No tasks found</p>
                            </div>
                        ) : (
                            displayTasks.map((task: any) => (
                                <div
                                    key={task.id}
                                    className={cn(
                                        "flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:shadow-sm transition-all",
                                        activeTab === "ALL_TASKS" && "opacity-90 grayscale-[0.3]" // Visual cue for read-only feel
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "h-6 w-6 rounded-full border-2 flex items-center justify-center",
                                            task.status === "COMPLETED" ? "bg-green-100 border-green-500" : "border-slate-300"
                                        )}>
                                            {task.status === "COMPLETED" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                                        </div>
                                        <div>
                                            <h3 className={cn(
                                                "font-bold text-gray-900",
                                                task.status === "COMPLETED" && "line-through text-slate-400"
                                            )}>
                                                {task.title}
                                            </h3>
                                            {task.assignee ? (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="h-5 w-5 rounded-full bg-[#F4EDE3] flex items-center justify-center text-[10px] font-bold text-[#411517]">
                                                        {task.assignee.name.charAt(0)}
                                                    </div>
                                                    <span className="text-xs text-slate-500 font-medium">{task.assignee.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 font-medium mt-1 block">Unassigned</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={cn(
                                            "px-2.5 py-0.5 rounded-full text-xs font-bold uppercase",
                                            task.priority === "URGENT" || task.priority === "HIGH" ? "bg-red-50 text-red-600" :
                                                "bg-slate-100 text-slate-500"
                                        )}>
                                            {task.priority}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* TEAM / CONTRIBUTION TAB */}
            {(activeTab === "TEAM" || activeTab === "MY_CONTRIBUTION") && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* If Member View, highlight their card or only show theirs? 
                        Prompt says "My Contribution Summary". Let's show all but highlight ME for context, or just ME.
                        "Show: Number of tasks assigned to me, Completed vs pending, Overdue".
                        I'll just reuse the Team Card logic but filter for current user if MY_CONTRIBUTION.
                    */}
                    {(activeTab === "MY_CONTRIBUTION" ? project.assignees.filter((u: any) => u.id === currentUser.id) : project.assignees).map((member: any) => {
                        const memberTasks = project.tasks.filter((t: any) => t.assigneeId === member.id);
                        const memberCompleted = memberTasks.filter((t: any) => t.status === "COMPLETED").length;
                        const memberProgress = memberTasks.length > 0 ? (memberCompleted / memberTasks.length) * 100 : 0;
                        const overdue = memberTasks.filter((t: any) => t.status !== "COMPLETED" && new Date(t.dueDate) < new Date()).length;

                        return (
                            <div key={member.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-12 w-12 rounded-full bg-[#F4EDE3] flex items-center justify-center text-lg font-bold text-[#411517] ring-2 ring-white shadow-sm">
                                        {member.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{member.name} {member.id === currentUser.id && "(You)"}</h3>
                                        <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">{member.role}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wide">
                                            <span>Contribution</span>
                                            <span>{Math.round(memberProgress)}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-green-500 rounded-full transition-all"
                                                style={{ width: `${memberProgress}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-50">
                                        <div className="text-center p-2 bg-slate-50 rounded-lg">
                                            <span className="block text-lg font-bold text-slate-700">{memberTasks.length}</span>
                                            <span className="text-[10px] text-slate-400 uppercase font-bold">Total</span>
                                        </div>
                                        <div className="text-center p-2 bg-green-50 rounded-lg">
                                            <span className="block text-lg font-bold text-green-600">{memberCompleted}</span>
                                            <span className="text-[10px] text-green-700/60 uppercase font-bold">Done</span>
                                        </div>
                                        <div className="text-center p-2 bg-red-50 rounded-lg">
                                            <span className="block text-lg font-bold text-red-500">
                                                {overdue}
                                            </span>
                                            <span className="text-[10px] text-red-600/60 uppercase font-bold">Late</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ACTIVITY TAB */}
            {activeTab === "ACTIVITY" && (
                <div className="bg-slate-50 p-12 rounded-xl border border-dashed border-slate-200 text-center">
                    <p className="text-slate-500 font-medium">Project Activity</p>
                    <p className="text-slate-400 text-sm">
                        {isManager ? "Viewing all project history." : "Viewing filtered history relevant to you."}
                    </p>
                    {/* Placeholder for actual activity log implementation */}
                </div>
            )}

            <ConfirmDialog
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
                onConfirm={handleDeleteProject}
                title="Delete Project"
                description={`Are you sure you want to delete "${project.title}"? This will also delete all associated tasks. This action cannot be undone.`}
                confirmText="Delete Project"
                variant="destructive"
            />
        </div>
    );
}
