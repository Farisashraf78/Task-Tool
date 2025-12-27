"use client";

import { useState } from "react";
import { updateTask, deleteTask, duplicateTask } from "@/app/actions/task";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { format } from "date-fns";
import { Pencil, Trash2, Copy } from "lucide-react";

export function EditTaskDialog({ task, users, currentUserRole, children }: any) {
    const [open, setOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : "",
        assigneeId: task.assigneeId || "",
    });

    const handleUpdate = async () => {
        await updateTask(task.id, formData);
        setOpen(false);
    };

    const handleDelete = async () => {
        await deleteTask(task.id);
        setDeleteConfirmOpen(false);
        setOpen(false);
    };

    const handleDuplicate = async () => {
        await duplicateTask(task.id);
        setOpen(false);
    };

    if (currentUserRole !== "MANAGER") return null;

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <div onClick={() => setOpen(true)}>{children}</div>
                <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <Pencil className="h-5 w-5 text-talabat-orange" />
                                Edit Task
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDuplicate}
                                    className="flex items-center gap-1"
                                >
                                    <Copy className="h-4 w-4" />
                                    Duplicate
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setDeleteConfirmOpen(true)}
                                    className="flex items-center gap-1"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </Button>
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label htmlFor="edit-title" className="text-sm font-bold text-talabat-brown">
                                Title
                            </label>
                            <input
                                id="edit-title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="edit-description" className="text-sm font-bold text-talabat-brown">
                                Description
                            </label>
                            <textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label htmlFor="edit-priority" className="text-sm font-bold text-talabat-brown">
                                    Priority
                                </label>
                                <select
                                    id="edit-priority"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="URGENT">Urgent</option>
                                </select>
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="edit-status" className="text-sm font-bold text-talabat-brown">
                                    Status
                                </label>
                                <select
                                    id="edit-status"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                                <label htmlFor="edit-dueDate" className="text-sm font-bold text-talabat-brown">
                                    Due Date
                                </label>
                                <input
                                    type="date"
                                    id="edit-dueDate"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="edit-assignee" className="text-sm font-bold text-talabat-brown">
                                    Assign To
                                </label>
                                <select
                                    id="edit-assignee"
                                    value={formData.assigneeId}
                                    onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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

                        <div className="flex gap-2 pt-4 border-t">
                            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUpdate}
                                className="flex-1 bg-talabat-orange hover:bg-orange-600"
                            >
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
                onConfirm={handleDelete}
                title="Delete Task"
                description={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="destructive"
            />
        </>
    );
}
