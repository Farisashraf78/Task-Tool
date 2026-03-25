"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface TeamMember {
    name: string;
    activeTasks: number;
    overdueTasks: number;
}

interface TeamPulseProps {
    teamMembers: TeamMember[];
}

export function TeamPulse({ teamMembers }: TeamPulseProps) {
    const maxTasks = Math.max(...teamMembers.map((m) => m.activeTasks), 1);

    return (
        <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] h-full flex flex-col pt-5">
            <div className="px-5 pb-3 border-b border-talabat-border">
                <h3 className="text-base font-semibold text-talabat-text-dark">
                    Team Workload
                </h3>
            </div>
            <div className="flex-1 p-2">
                {teamMembers.map((member, index) => {
                    const widthPct = Math.min((member.activeTasks / maxTasks) * 100, 100);
                    return (
                        <div
                            key={member.name}
                            className="flex items-center justify-between px-3 h-[40px] hover:bg-talabat-light-gray rounded-lg transition-colors"
                        >
                            <div className="flex items-center gap-3 min-w-0 w-1/3">
                                <div className="h-7 w-7 rounded-full bg-talabat-orange shrink-0 flex items-center justify-center text-[10px] font-bold text-white">
                                    {member.name.charAt(0)}
                                </div>
                                <span className="text-sm font-medium text-talabat-text-dark truncate">{member.name}</span>
                            </div>

                            <div className="flex items-center gap-2 flex-1 justify-end">
                                <span className="text-xs bg-talabat-light-gray px-2 py-0.5 rounded-full text-talabat-text-dark font-medium">
                                    {member.activeTasks}
                                </span>
                                {member.overdueTasks > 0 && (
                                    <span className="text-xs text-talabat-orange font-bold">
                                        {member.overdueTasks} overdue
                                    </span>
                                )}
                            </div>

                            <div className="w-12 h-1.5 bg-talabat-border rounded-full overflow-hidden ml-3">
                                <div className="h-full bg-talabat-orange rounded-full" style={{ width: `${widthPct}%` }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
