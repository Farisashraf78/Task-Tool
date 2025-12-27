"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertTriangle, Users } from "lucide-react";

interface HistoryStats {
    totalActivities: number;
    topContributors: {
        name: string;
        avatar: string | null;
        count: number;
    }[];
    lateCompletions: number;
}

interface HistoryInsightsProps {
    stats: HistoryStats;
}

export function HistoryInsights({ stats }: HistoryInsightsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-3 mb-8">
            {/* Total Activity */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">30-Day Activity</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalActivities}</div>
                    <p className="text-xs text-muted-foreground">
                        Total recorded events
                    </p>
                </CardContent>
            </Card>

            {/* Risk Monitor */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Risk Monitor</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.lateCompletions}</div>
                    <p className="text-xs text-muted-foreground">
                        Tasks completed late (last 30 days)
                    </p>
                </CardContent>
            </Card>

            {/* Top Contributors */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Top Activity</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 mt-2">
                        {stats.topContributors.length > 0 ? (
                            stats.topContributors.slice(0, 3).map((user, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full object-cover" />
                                            ) : (
                                                user.name.charAt(0)
                                            )}
                                        </div>
                                        <span>{user.name}</span>
                                    </div>
                                    <span className="font-semibold text-slate-600">{user.count}</span>
                                </div>
                            ))
                        ) : (
                            <span className="text-xs text-muted-foreground">No activity tailored yet.</span>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
