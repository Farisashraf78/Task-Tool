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
    return (
        <Card className="border border-gray-200 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-gray-50 mb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800">
                    <Users className="h-4 w-4 text-talabat-orange" />
                    Team Workload
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
                {teamMembers.map((member, index) => (
                    <div
                        key={member.name}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                                {member.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                            </div>
                            <span className="text-sm font-medium text-gray-700">{member.name}</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                                <Clock className="h-3 w-3" />
                                <span>{member.activeTasks} active</span>
                            </div>

                            {member.overdueTasks > 0 && (
                                <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-md font-medium">
                                    <AlertCircle className="h-3 w-3" />
                                    <span>{member.overdueTasks}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
