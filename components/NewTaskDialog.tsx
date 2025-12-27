"use client";

import { useState } from "react";
import { createTask } from "@/app/actions/task";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";

type User = {
    id: string;
    name: string;
};

export function NewTaskDialog({ users, currentUserId, defaultProjectId, children }: { users: User[], currentUserId: string, defaultProjectId?: string, children?: React.ReactNode }) {
    const [open, setOpen] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        const result = await createTask(formData);
        if (result.success) {
            setOpen(false);
        } else {
            alert(result.error); // Simple error handling
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button className="bg-talabat-orange hover:bg-orange-600 gap-2">
                        <PlusCircle className="h-4 w-4" />
                        New Task
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-white text-talabat-brown">
                <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                    <DialogDescription>
                        Assign a task to yourself or a team member.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="grid gap-4 py-4">
                    {defaultProjectId && <input type="hidden" name="projectId" value={defaultProjectId} />}
                    <div className="grid gap-2">
                        <label htmlFor="title" className="text-sm font-medium">
                            Task Title
                        </label>
                        <input
                            id="title"
                            name="title"
                            required
                            placeholder="e.g. Update Hero Banners"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="description" className="text-sm font-medium">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={3}
                            placeholder="Add details..."
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <label htmlFor="priority" className="text-sm font-medium">
                                Priority
                            </label>
                            <select
                                id="priority"
                                name="priority"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM" selected>Medium</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent</option>
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="dueDate" className="text-sm font-medium">Due Date</label>
                            <input
                                type="date"
                                name="dueDate"
                                id="dueDate"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            />
                        </div>
                    </div>

                    {/* Classification */}
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Task Type</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-sm cursor-pointer p-2 border rounded-md hover:bg-slate-50 flex-1">
                                <input type="radio" name="classification" value="OTHER" defaultChecked className="accent-talabat-orange" />
                                <span>Ad-hoc / Other</span>
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer p-2 border rounded-md hover:bg-slate-50 flex-1">
                                <input type="radio" name="classification" value="MONTHLY" className="accent-talabat-orange" />
                                <span>Monthly Task</span>
                            </label>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="assigneeId" className="text-sm font-medium">
                            Assign To
                        </label>
                        <select
                            id="assigneeId"
                            name="assigneeId"
                            defaultValue={currentUserId}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="unassigned">Unassigned (Draft)</option>
                            {users
                                .filter(u => u.id !== currentUserId)
                                .map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                        </select>
                    </div>
                    <DialogFooter>
                        <Button type="submit" className="bg-talabat-orange hover:bg-orange-600">
                            Create Task
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
