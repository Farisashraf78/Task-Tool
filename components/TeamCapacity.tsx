"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const teamMembers = [
    { name: "Faris", icon: "⚡" },
    { name: "Mansour", icon: "🛡️" },
    { name: "Doaa", icon: "🎨" },
    { name: "Marim", icon: "🕵️‍♀️" },
    { name: "Nourhan", icon: "🚀" },
    { name: "Ghofran", icon: "🧙‍♂️" }
];

export function TeamCapacity({ tasks }: { tasks: any[] }) {
    // Calculate workload
    const workload = teamMembers.map(member => {
        const count = tasks.filter(t => t.assignee?.name.includes(member.name) && t.status !== "COMPLETED").length;
        return { ...member, count };
    });

    const getRingColor = (count: number) => {
        if (count >= 6) return "border-purple-500 text-purple-600 bg-purple-50"; // Overloaded
        if (count >= 3) return "border-orange-500 text-orange-600 bg-orange-50"; // Busy
        return "border-green-500 text-green-600 bg-green-50"; // Optimal
    };

    return (
        <Card className="border-none shadow-sm bg-white rounded-[24px]">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-[#411517] flex items-center gap-2">
                    Team Pulse
                    <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-4">
                    {workload.map((member) => (
                        <div key={member.name} className="flex flex-col items-center gap-2 group cursor-pointer transition-transform hover:scale-105">
                            <div className={cn(
                                "relative w-14 h-14 rounded-full border-[3px] flex items-center justify-center text-2xl shadow-sm transition-all duration-300",
                                getRingColor(member.count)
                            )}>
                                {member.icon}
                                {member.count > 0 && (
                                    <div className={cn(
                                        "absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm border border-white",
                                        member.count >= 6 ? "bg-purple-500" : member.count >= 3 ? "bg-orange-500" : "bg-green-500"
                                    )}>
                                        {member.count}
                                    </div>
                                )}
                            </div>
                            <span className="text-xs font-semibold text-[#411517]/80 group-hover:text-[#411517]">
                                {member.name}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
