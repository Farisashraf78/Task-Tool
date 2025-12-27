"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateTaskStatus, deleteTask, duplicateTask, updateTask } from "@/app/actions/task";
import { addComment } from "@/app/actions/comment";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { format } from "date-fns";
import { Send, Edit, Trash2, Copy } from "lucide-react";

interface TaskDetailsDialogProps {
    task: any;
    currentUser: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    users?: any[];
}

export function TaskDetailsDialog({ task, currentUser, open, onOpenChange, users = [] }: TaskDetailsDialogProps) {
    const isManager = currentUser.role === "MANAGER";
    const isAssignee = task.assigneeId === currentUser.id;
    const isFaris = currentUser.name.toLowerCase().includes("faris");
    const canUpdateStatus = isManager || isAssignee || isFaris;
    const router = useRouter();
    const [comment, setComment] = useState("");
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [formData, setFormData] = useState({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : "",
        assigneeId: task.assigneeId || "",
    });

    const handleStatusChange = async (newStatus: string) => {
        await updateTaskStatus(task.id, newStatus);
        router.refresh();
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;
        await addComment(task.id, comment);
        setComment("");
        router.refresh();
    };

    const handleDelete = async () => {
        await deleteTask(task.id);
        onOpenChange(false);
        router.refresh();
    };

    const handleDuplicate = async () => {
        await duplicateTask(task.id);
        onOpenChange(false);
        router.refresh();
    };

    const handleUpdate = async () => {
        await updateTask(task.id, formData);
        setShowEditDialog(false);
        router.refresh();
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[700px] bg-white max-h-[85vh] overflow-y-auto rounded-3xl">
                    <DialogHeader>
                        <div className="flex justify-between items-start mr-8 gap-4">
                            <div className="flex-1">
                                <DialogTitle className="text-2xl text-talabat-brown">{task.title}</DialogTitle>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant={
                                        task.priority === "URGENT" ? "destructive" :
                                            task.priority === "HIGH" ? "default" :
                                                "secondary"
                                    } className={task.priority === "HIGH" ? "bg-talabat-orange" : ""}>
                                        {task.priority}
                                    </Badge>
                                    <Badge variant="outline">
                                        {task.status.replace("_", " ")}
                                    </Badge>
                                </div>
                            </div>

                            {/* Manager Controls */}
                            {isManager && (
                                <div className="flex gap-2 shrink-0">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDuplicate}
                                        className="rounded-xl"
                                    >
                                        <Copy className="h-4 w-4 mr-1" />
                                        Duplicate
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowEditDialog(true)}
                                        className="rounded-xl"
                                    >
                                        <Edit className="h-4 w-4 mr-1" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="rounded-xl"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                        <DialogDescription className="text-base pt-3 text-talabat-brown/80">
                            {task.description || "No description."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        {/* Task Info */}
                        <div className="grid grid-cols-3 gap-4 text-sm border-b border-talabat-brown/10 pb-4">
                            <div>
                                <span className="font-semibold block text-talabat-brown mb-1">Due Date</span>
                                <span className="text-talabat-brown/60">
                                    {task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "No deadline"}
                                </span>
                            </div>
                            <div>
                                <span className="font-semibold block text-talabat-brown mb-1">Assignee</span>
                                <span className="text-talabat-brown/60">{task.assignee?.name || "Unassigned"}</span>
                            </div>
                            <div>
                                <span className="font-semibold block text-talabat-brown mb-1">Creator</span>
                                <span className="text-talabat-brown/60">{task.creator?.name}</span>
                            </div>
                        </div>

                        {/* Status Controls */}
                        {canUpdateStatus && (
                            <div className="space-y-3">
                                <h4 className="font-bold text-talabat-brown">Update Status</h4>
                                <div className="flex gap-2 flex-wrap">
                                    {["NEW", "IN_PROGRESS", "UNDER_REVIEW", "COMPLETED"].map((s) => (
                                        <Button
                                            key={s}
                                            variant={task.status === s ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handleStatusChange(s)}
                                            className={`rounded-2xl ${task.status === s ? "bg-talabat-orange hover:bg-orange-600 font-bold" : ""}`}
                                        >
                                            {s.replace("_", " ")}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Activity Timeline */}
                        <div className="border-t pt-4">
                            <ActivityTimeline activities={task.activityLogs || []} />
                        </div>

                        {/* Comments */}
                        <div className="space-y-4 border-t pt-4">
                            <h4 className="font-bold text-talabat-brown">
                                Comments ({task.comments?.length || 0})
                            </h4>

                            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                                {task.comments && task.comments.map((c: any) => (
                                    <div key={c.id} className="bg-talabat-offwhite/50 p-3 rounded-2xl border border-talabat-brown/10">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-semibold text-talabat-brown text-sm">{c.author.name}</span>
                                            <span className="text-xs text-talabat-brown/40">
                                                {format(new Date(c.createdAt), "MMM d, h:mm a")}
                                            </span>
                                        </div>
                                        <p className="text-talabat-brown/80 text-sm">{c.content}</p>
                                    </div>
                                ))}
                                {(!task.comments || task.comments.length === 0) && (
                                    <p className="text-talabat-brown/40 text-sm italic">No comments yet</p>
                                )}
                            </div>

                            {/* Add Comment */}
                            <form onSubmit={handleCommentSubmit} className="flex gap-2">
                                <input
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="flex-1 min-h-[42px] rounded-2xl border border-talabat-brown/20 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-talabat-orange"
                                />
                                <Button type="submit" size="icon" className="bg-talabat-orange hover:bg-orange-600 h-[42px] w-[42px] rounded-2xl">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="sm:max-w-[600px] bg-white rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl text-talabat-brown flex items-center gap-2">
                            <Edit className="h-6 w-6 text-talabat-orange" />
                            Edit Task
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-bold text-talabat-brown">Title</label>
                            <input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="h-10 rounded-2xl border border-talabat-brown/20 px-4 focus:outline-none focus:ring-2 focus:ring-talabat-orange"
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-bold text-talabat-brown">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="rounded-2xl border border-talabat-brown/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-talabat-orange"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-bold text-talabat-brown">Priority</label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    className="h-10 rounded-2xl border border-talabat-brown/20 px-4 focus:outline-none focus:ring-2 focus:ring-talabat-orange"
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="URGENT">Urgent</option>
                                </select>
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-bold text-talabat-brown">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="h-10 rounded-2xl border border-talabat-brown/20 px-4 focus:outline-none focus:ring-2 focus:ring-talabat-orange"
                                >
                                    <option value="NEW">New</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="UNDER_REVIEW">Under Review</option>
                                    <option value="COMPLETED">Completed</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-bold text-talabat-brown">Due Date</label>
                                <input
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    className="h-10 rounded-2xl border border-talabat-brown/20 px-4 focus:outline-none focus:ring-2 focus:ring-talabat-orange"
                                />
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-bold text-talabat-brown">Assign To</label>
                                <select
                                    value={formData.assigneeId}
                                    onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                                    className="h-10 rounded-2xl border border-talabat-brown/20 px-4 focus:outline-none focus:ring-2 focus:ring-talabat-orange"
                                >
                                    <option value="">Unassigned</option>
                                    {users.map((user: any) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button variant="outline" onClick={() => setShowEditDialog(false)} className="flex-1 rounded-2xl">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUpdate}
                                className="flex-1 bg-talabat-orange hover:bg-orange-600 rounded-2xl"
                            >
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={showDeleteConfirm}
                onOpenChange={setShowDeleteConfirm}
                onConfirm={handleDelete}
                title="Delete Task"
                description={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="destructive"
            />
        </>
    );
}
