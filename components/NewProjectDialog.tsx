"use client";

import { useState } from "react";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Assuming generic textarea exists or I'll use native
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { createProject } from "@/app/actions/projects";
import { Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
    id: string;
    name: string;
}

interface NewProjectDialogProps {
    users: User[];
}

export function NewProjectDialog({ users }: NewProjectDialogProps) {
    const [open, setOpen] = useState(false);
    const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        // Append assignees manually
        formData.append("assignees", JSON.stringify(selectedAssignees));

        const result = await createProject(formData);

        setLoading(false);
        if (result.success) {
            toast({
                title: "Success",
                description: "Project created successfully!",
                className: "bg-green-500 text-white border-none"
            });
            setOpen(false);
            setSelectedAssignees([]);
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: result.error || "Failed to create project."
            });
        }
    }

    const toggleAssignee = (userId: string) => {
        setSelectedAssignees(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[#FF5900] hover:bg-[#FF5900]/90 text-white gap-2 rounded-xl">
                    <Plus className="h-4 w-4" />
                    New Project
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                        Launch a new initiative and assign your team.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Project Title</Label>
                        <Input id="title" name="title" required placeholder="e.g., Q1 Marketing Campaign" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Input id="description" name="description" placeholder="Brief overview of goals..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input id="startDate" name="startDate" type="date" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="dueDate">Due Date</Label>
                            <Input id="dueDate" name="dueDate" type="date" required />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select name="priority" defaultValue="MEDIUM">
                            <SelectTrigger>
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="LOW">Low</SelectItem>
                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                <SelectItem value="HIGH">High</SelectItem>
                                <SelectItem value="URGENT">Urgent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Assign Team</Label>
                        <div className="flex flex-wrap gap-2 p-3 border rounded-xl bg-slate-50">
                            {users.map(user => {
                                const isSelected = selectedAssignees.includes(user.id);
                                return (
                                    <div
                                        key={user.id}
                                        onClick={() => toggleAssignee(user.id)}
                                        className={cn(
                                            "cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border",
                                            isSelected
                                                ? "bg-[#FF5900] text-white border-[#FF5900]"
                                                : "bg-white text-slate-600 border-slate-200 hover:border-[#FF5900]/50"
                                        )}
                                    >
                                        <span>{user.name.split(' ')[0]}</span>
                                        {isSelected && <Check className="h-3 w-3" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="w-full bg-[#411517] hover:bg-[#411517]/90 text-white rounded-xl">
                            {loading ? "Creating..." : "Create Project"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
