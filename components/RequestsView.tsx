"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
    CheckCircle2, Plus, AlertTriangle, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { createRequest, updateRequestStatus, cancelRequest } from "@/app/actions/request";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Request {
    id: string;
    title: string;
    description: string | null;
    isUrgent: boolean;
    dueDate: string | null;
    status: string;
    managerComment: string | null;
    createdAt: string;
    requester: {
        name: string;
    };
}

interface RequestsViewProps {
    requests: Request[];
    currentUser: {
        id: string;
        role: string;
    };
}

export function RequestsView({ requests, currentUser }: RequestsViewProps) {
    const isManager = currentUser.role === "MANAGER";
    const [filter, setFilter] = useState("ALL");
    const [createOpen, setCreateOpen] = useState(false);
    const [actionComment, setActionComment] = useState<Record<string, string>>({});

    const filteredRequests = requests.filter(r => {
        if (filter === "ALL") return true;
        return r.status === filter;
    });

    const handleCreateSubmit = async (formData: FormData) => {
        const res = await createRequest(formData);
        if (res.success) setCreateOpen(false);
    };

    const handleAction = async (id: string, status: "APPROVED" | "REJECTED") => {
        await updateRequestStatus(id, status, actionComment[id]);
        setActionComment(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    };

    const handleCancel = async (id: string) => {
        if (confirm("Are you sure you want to cancel this request?")) {
            await cancelRequest(id);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "APPROVED": return "bg-green-100 text-green-700 border-green-200";
            case "REJECTED": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-yellow-100 text-yellow-700 border-yellow-200";
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto p-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Requests</h1>
                    <p className="text-gray-500 mt-1">
                        {isManager ? "Manage team requests and approvals" : "Submit requests to your manager"}
                    </p>
                </div>
                {!isManager && (
                    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-talabat-orange hover:bg-orange-600 gap-2">
                                <Plus className="h-4 w-4" />
                                New Request
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Request</DialogTitle>
                            </DialogHeader>
                            <form action={handleCreateSubmit} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Topic / Subject</label>
                                    <Input name="title" required placeholder="e.g. Need access to analytics" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Details</label>
                                    <Textarea name="description" placeholder="Explain why you need this..." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Due Date (Optional)</label>
                                        <Input type="date" name="dueDate" />
                                    </div>
                                    <div className="flex items-end pb-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" name="isUrgent" className="w-4 h-4 accent-red-500" />
                                            <span className="text-sm font-medium text-red-600">Mark as Urgent</span>
                                        </label>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" className="bg-talabat-orange hover:bg-orange-600">Submit Request</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <div className="flex items-center gap-2">
                <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                    {["ALL", "PENDING", "APPROVED", "REJECTED"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={cn(
                                "px-4 py-1.5 text-xs font-bold rounded-md transition-all",
                                filter === tab
                                    ? "bg-white text-talabat-orange shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Request List */}
            <div className="grid gap-4">
                {filteredRequests.map(req => (
                    <div key={req.id} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center relative overflow-hidden">
                        {/* Urgent Stripe */}
                        {req.isUrgent && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />}

                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3 mb-1">
                                <Badge variant="outline" className={getStatusColor(req.status)}>
                                    {req.status}
                                </Badge>
                                {req.isUrgent && (
                                    <Badge variant="destructive" className="flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" /> Urgent
                                    </Badge>
                                )}
                                <span className="text-xs text-gray-500">
                                    {format(new Date(req.createdAt), "MMM d, yyyy")}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">{req.title}</h3>
                            {req.description && <p className="text-gray-600 text-sm">{req.description}</p>}

                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                                <span>Requested by <span className="font-medium text-gray-700">{req.requester.name}</span></span>
                            </div>
                            {req.managerComment && (
                                <div className="mt-4 p-3 bg-gray-50 border border-gray-100 rounded-lg">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Maha&apos;s Update</p>
                                    <p className="text-sm text-gray-700 italic">&quot;{req.managerComment}&quot;</p>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        {isManager && req.status === "PENDING" && (
                            <div className="flex flex-col gap-3 min-w-[300px]">
                                <Input
                                    placeholder="Add a comment (optional)..."
                                    className="text-sm h-9"
                                    value={actionComment[req.id] || ""}
                                    onChange={(e) => setActionComment(prev => ({ ...prev, [req.id]: e.target.value }))}
                                />
                                <div className="flex items-center gap-3">
                                    <Button size="sm" variant="ghost" className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleAction(req.id, "REJECTED")}>
                                        Reject
                                    </Button>
                                    <Button size="sm" className="flex-2 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleAction(req.id, "APPROVED")}>
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Approve & Create task
                                    </Button>
                                </div>
                            </div>
                        )}
                        {!isManager && req.status === "PENDING" && (
                            <div className="flex items-center gap-4">
                                <div className="text-sm text-gray-400 italic">Waiting for approval...</div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-400 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => handleCancel(req.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                ))}

                {filteredRequests.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        No requests found.
                    </div>
                )}
            </div>
        </div>
    );
}
