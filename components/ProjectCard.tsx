"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ProjectCardProps {
    project: {
        id: string;
        title: string;
        description: string | null;
        status: string;
        priority: string;
        dueDate: Date | null;
        startDate: Date | null;
        tasks: any[];
        assignees: any[];
        _count: {
            tasks: number;
        };
    };
}

export function ProjectCard({ project }: ProjectCardProps) {
    const router = useRouter();

    // Calculate progress
    const completedTasks = project.tasks.filter(t => t.status === "COMPLETED").length;
    const totalTasks = project._count.tasks || 0;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200 cursor-pointer"
            onClick={() => router.push(`/projects/${project.id}`)}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide",
                            project.status === "ACTIVE" ? "bg-green-50 text-green-700" :
                                project.status === "AT_RISK" ? "bg-red-50 text-red-700" :
                                    project.status === "COMPLETED" ? "bg-slate-50 text-slate-500" :
                                        "bg-slate-50 text-slate-600"
                        )}>
                            {project.status.replace("_", " ")}
                        </span>
                        {(project.priority === "HIGH" || project.priority === "URGENT") && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-red-50 text-red-600">
                                {project.priority}
                            </span>
                        )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#FF5900] transition-colors line-clamp-1">
                        {project.title}
                    </h3>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600 -mr-2">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </div>

            <p className="text-gray-500 text-sm mb-6 line-clamp-2 h-10 leading-relaxed">
                {project.description || "No description provided"}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex -space-x-2">
                    {project.assignees.slice(0, 4).map((user, i) => (
                        <div
                            key={user.id}
                            className="h-7 w-7 rounded-full border-2 border-white bg-[#F4EDE3] flex items-center justify-center text-[10px] font-bold text-[#411517] ring-1 ring-slate-100"
                            style={{ zIndex: 10 - i }}
                        >
                            {user.name.charAt(0)}
                        </div>
                    ))}
                    {project.assignees.length > 4 && (
                        <div className="h-7 w-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 ring-1 ring-slate-100 z-0">
                            +{project.assignees.length - 4}
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                        <span>{Math.round(progress)}%</span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={cn("h-full rounded-full transition-all", progress === 100 ? "bg-[#CFFF00]" : "bg-[#FF5900]")}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                    {project.dueDate && (
                        <span className="text-[10px] text-gray-400 font-medium">
                            {format(new Date(project.dueDate), "MMM d")}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
