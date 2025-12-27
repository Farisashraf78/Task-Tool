"use client";

import { useState, useMemo } from "react";
import { format, differenceInMinutes } from "date-fns";
import {
    Search,
    ChevronRight, Clock, Download, Layers, ChevronDown, ChevronUp, Filter, AlertTriangle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { HistoryInsights } from "./HistoryInsights";

interface LogUser {
    name: string;
    role?: string;
}

interface LogItem {
    id: string;
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    details: string | null;
    createdAt: string | Date;
    user: LogUser;
    oldValue?: string | null;
    newValue?: string | null;
}

interface HistoryViewProps {
    logs: LogItem[];
    currentUser: any;
    teamMembers: any[];
    stats?: any;
}

// Helper to parse details
const getParsedDetails = (details: string | null) => {
    if (!details) return { text: "", impact: null };
    try {
        if (details.startsWith("{")) {
            const parsed = JSON.parse(details);
            return {
                text: parsed.text || "No details",
                impact: parsed.impact || null
            };
        }
        return { text: details, impact: null };
    } catch {
        return { text: details, impact: null };
    }
};

export function HistoryView({ logs, currentUser, teamMembers, stats }: HistoryViewProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMember, setSelectedMember] = useState("ALL");
    const [selectedLog, setSelectedLog] = useState<LogItem | null>(null);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    // 1. FILTERING
    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const { text } = getParsedDetails(log.details);
            const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (text && text.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesMember = selectedMember === "ALL" || log.userId === selectedMember;

            return matchesSearch && matchesMember;
        });
    }, [logs, searchTerm, selectedMember]);

    // 2. SMART GROUPING
    // Group consecutive logs by same user + same entityType + same entityId + within 10 mins
    const groupedLogs = useMemo(() => {
        interface LogGroup {
            id: string;
            userId: string;
            user: LogUser;
            entityType: string;
            entityId: string;
            items: LogItem[];
            startTime: Date;
            endTime: Date;
        }

        const groups: LogGroup[] = [];
        if (filteredLogs.length === 0) return groups;

        let currentGroup: LogGroup = {
            id: filteredLogs[0].id, // Use first log ID as group ID
            userId: filteredLogs[0].userId,
            user: filteredLogs[0].user,
            entityType: filteredLogs[0].entityType,
            entityId: filteredLogs[0].entityId,
            items: [filteredLogs[0]],
            startTime: new Date(filteredLogs[0].createdAt),
            endTime: new Date(filteredLogs[0].createdAt)
        };

        for (let i = 1; i < filteredLogs.length; i++) {
            const log = filteredLogs[i];
            const logTime = new Date(log.createdAt);
            const prevTime = currentGroup.endTime;
            const diffMins = Math.abs(differenceInMinutes(logTime, prevTime));

            const isSameUser = log.userId === currentGroup.userId;
            const isSameEntity = log.entityType === currentGroup.entityType && log.entityId === currentGroup.entityId;
            const isNearby = diffMins <= 10;

            if (isSameUser && isSameEntity && isNearby) {
                currentGroup.items.push(log);
                currentGroup.endTime = logTime; // Update end time (logs are desc, so actually start time might appear later in list if not sorted desc? Assuming input sorted desc)
            } else {
                groups.push(currentGroup);
                currentGroup = {
                    id: log.id,
                    userId: log.userId,
                    user: log.user,
                    entityType: log.entityType,
                    entityId: log.entityId,
                    items: [log],
                    startTime: logTime,
                    endTime: logTime
                };
            }
        }
        groups.push(currentGroup);
        return groups;
    }, [filteredLogs]);

    const toggleGroup = (groupId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(groupId)) {
            newExpanded.delete(groupId);
        } else {
            newExpanded.add(groupId);
        }
        setExpandedGroups(newExpanded);
    };

    const handleExport = () => {
        const headers = "Date,User,Action,Target,Details\n";
        const rows = filteredLogs.map(log => {
            const { text } = getParsedDetails(log.details);
            return `${log.createdAt},${log.user.name},${log.action},${log.entityType}: ${log.entityId},"${text}"`;
        }).join("\n");

        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-log-${format(new Date(), "yyyy-MM-dd")}.csv`;
        a.click();
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 p-6">
            {/* 1. Header Section - EXACT DASHBOARD MATCH */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">History</h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        {currentUser.role === "MANAGER" ? "Complete audit log of team activities" : "Your activity timeline"}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Search Input */}
                    <div className="relative w-64 hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search history..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-9 text-sm bg-white border-gray-200 focus:border-talabat-orange focus:ring-talabat-orange/20 rounded-lg"
                        />
                    </div>

                    {/* Filter Popover */}
                    {currentUser.role === "MANAGER" && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="h-9 border-gray-200 text-gray-600 hover:text-gray-900">
                                    <Filter className="h-4 w-4 mr-2" />
                                    {selectedMember === "ALL" ? "All Users" : teamMembers.find(m => m.id === selectedMember)?.name || "User"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-56 p-2" align="end">
                                <div className="space-y-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn("w-full justify-start font-normal", selectedMember === "ALL" && "bg-gray-100 font-medium")}
                                        onClick={() => setSelectedMember("ALL")}
                                    >
                                        All Team
                                    </Button>
                                    <div className="h-px bg-gray-100 my-1" />
                                    {teamMembers.map(member => (
                                        <Button
                                            key={member.id}
                                            variant="ghost"
                                            size="sm"
                                            className={cn("w-full justify-start font-normal", selectedMember === member.id && "bg-gray-100 font-medium")}
                                            onClick={() => setSelectedMember(member.id)}
                                        >
                                            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] mr-2 text-gray-600 font-bold">
                                                {member.name.charAt(0)}
                                            </div>
                                            {member.name}
                                        </Button>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}

                    {/* Export Button */}
                    {currentUser.role === "MANAGER" && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExport}
                            className="h-9 border-gray-200 text-gray-600 hover:text-gray-900"
                        >
                            <Download className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Smart Insights (Manager Only) */}
            {currentUser.role === "MANAGER" && stats && (
                <HistoryInsights stats={stats} />
            )}

            {/* Clean List View - NO VERTICAL LINES */}
            <div className="space-y-3">
                {groupedLogs.length === 0 ? (
                    <div className="py-16 text-center">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="h-6 w-6 text-gray-300" />
                        </div>
                        <h3 className="text-gray-900 font-medium mb-1">No activity found</h3>
                        <p className="text-gray-500 text-sm">Try adjusting your filters</p>
                    </div>
                ) : (
                    groupedLogs.map((group) => {
                        const isGroup = group.items.length > 1;
                        const mainLog = group.items[0];
                        const { text, impact } = getParsedDetails(mainLog.details);
                        const isExpanded = expandedGroups.has(group.id);

                        return (
                            <div
                                key={group.id}
                                className="bg-white border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm transition-all duration-200 overflow-hidden"
                            >
                                <div
                                    onClick={isGroup ? (e) => toggleGroup(group.id, e) : () => setSelectedLog(mainLog)}
                                    className="px-4 py-3 flex items-center gap-4 cursor-pointer"
                                >
                                    {/* 1. Avatar */}
                                    <div className="h-8 w-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-xs font-semibold text-gray-700">
                                        {group.user.name.charAt(0)}
                                    </div>

                                    {/* 2. Action & Content */}
                                    <div className="flex-1 min-w-0 flex items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            {isGroup ? (
                                                <Badge variant="secondary" className="gap-1.5 font-medium text-gray-600 bg-gray-100 hover:bg-gray-200">
                                                    <Layers className="h-3 w-3" />
                                                    {group.items.length} updates
                                                </Badge>
                                            ) : (
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {mainLog.action.replace(/_/g, " ")}
                                                </span>
                                            )}

                                            <span className="text-sm text-gray-400 hidden sm:inline">-</span>

                                            <span className="text-sm text-gray-500 truncate">
                                                {isGroup ? (
                                                    <span>
                                                        <span className="font-medium text-gray-700">{group.user.name}</span> made multiple changes to <span className="font-medium text-gray-900">{group.entityType}</span>
                                                    </span>
                                                ) : (
                                                    <span>
                                                        <span className="font-medium text-gray-900">{text || group.entityId}</span>
                                                    </span>
                                                )}
                                            </span>
                                        </div>

                                        {/* Impact Badge - Inline */}
                                        {!isGroup && impact && (
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-medium border border-red-100">
                                                <AlertTriangle className="h-3 w-3" />
                                                {impact.type === 'LATE' ? 'Late Submission' : 'Risk'}
                                            </div>
                                        )}
                                    </div>

                                    {/* 3. Time & Chev */}
                                    <div className="flex items-center gap-4 pl-4 border-l border-gray-50">
                                        <span className="text-xs text-gray-400 whitespace-nowrap font-medium">
                                            {format(new Date(group.startTime), "h:mm a")}
                                        </span>
                                        {isGroup ? (
                                            isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4 text-gray-300" />
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Group View */}
                                {isGroup && isExpanded && (
                                    <div className="bg-gray-50 border-t border-gray-100 divide-y divide-gray-100">
                                        {group.items.map((item: any) => {
                                            const d = getParsedDetails(item.details);
                                            return (
                                                <div
                                                    key={item.id}
                                                    onClick={() => setSelectedLog(item)}
                                                    className="px-4 py-2.5 pl-16 flex items-center gap-3 hover:bg-gray-100 cursor-pointer transition-colors"
                                                >
                                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                                    <span className="text-xs font-semibold uppercase text-gray-500 w-32 tracking-wide">
                                                        {item.action.replace(/_/g, " ")}
                                                    </span>
                                                    <span className="text-sm text-gray-900 flex-1">
                                                        {d.text}
                                                    </span>
                                                    <span className="text-xs text-gray-400 font-mono">
                                                        {format(new Date(item.createdAt), "h:mm a")}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>

            {/* Clean Detail Dialog */}
            <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0 rounded-2xl">
                    <DialogHeader className="p-6 pb-4 border-b border-gray-50">
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                            Details
                        </DialogTitle>
                    </DialogHeader>

                    {selectedLog && (
                        <div className="p-6 space-y-6">
                            {/* Header Info */}
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-talabat-orange/10 flex items-center justify-center text-talabat-orange font-bold text-sm">
                                    {selectedLog.user.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{selectedLog.user.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {format(new Date(selectedLog.createdAt), "MMMM d, yyyy • h:mm a")}
                                    </p>
                                </div>
                            </div>

                            {/* Impact Alert */}
                            {(() => {
                                const { impact } = getParsedDetails(selectedLog.details);
                                if (!impact) return null;
                                return (
                                    <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
                                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-red-900">Flagged: {impact.type}</p>
                                            <p className="text-xs text-red-700 mt-0.5">{impact.label}</p>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Data Grid */}
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedLog.action.replace(/_/g, " ")}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Target</label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedLog.entityType}</p>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Context</label>
                                    <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                                        {getParsedDetails(selectedLog.details).text || "No details provided"}
                                    </p>
                                </div>
                            </div>

                            {/* Diff View */}
                            {(selectedLog.oldValue || selectedLog.newValue) && (
                                <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                                    <div className="bg-red-50/50 rounded-lg p-3 border border-red-100/50">
                                        <div className="text-[10px] font-bold text-red-600/70 mb-1 uppercase">Previous</div>
                                        <p className="text-sm text-gray-600">{selectedLog.oldValue || "—"}</p>
                                    </div>
                                    <div className="bg-green-50/50 rounded-lg p-3 border border-green-100/50">
                                        <div className="text-[10px] font-bold text-green-600/70 mb-1 uppercase">New Value</div>
                                        <p className="text-sm text-gray-900">{selectedLog.newValue || "—"}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

