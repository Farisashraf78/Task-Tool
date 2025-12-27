"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { updateProject } from "@/app/actions/projects";
import { format } from "date-fns";

interface EditProjectDialogProps {
    project: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditProjectDialog({ project, open, onOpenChange }: EditProjectDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        const updates = {
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            status: formData.get("status") as string,
            priority: formData.get("priority") as string,
            startDate: formData.get("startDate") ? new Date(formData.get("startDate") as string) : null,
            dueDate: formData.get("dueDate") ? new Date(formData.get("dueDate") as string) : null,
        };

        const result = await updateProject(project.id, updates);
        setIsLoading(false);

        if (result.success) {
            onOpenChange(false);
        } else {
            alert("Failed to update project");
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-white">
                <DialogHeader>
                    <DialogTitle>Edit Project Details</DialogTitle>
                </DialogHeader>
                <form action={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Project Name</Label>
                        <Input id="title" name="title" defaultValue={project.title} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" defaultValue={project.description} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select name="status" defaultValue={project.status}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="AT_RISK">At Risk</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="ON_HOLD">On Hold</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select name="priority" defaultValue={project.priority}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="LOW">Low</SelectItem>
                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                    <SelectItem value="HIGH">High</SelectItem>
                                    <SelectItem value="URGENT">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                name="startDate"
                                type="date"
                                defaultValue={project.startDate ? format(new Date(project.startDate), "yyyy-MM-dd") : ""}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="dueDate">Due Date</Label>
                            <Input
                                id="dueDate"
                                name="dueDate"
                                type="date"
                                defaultValue={project.dueDate ? format(new Date(project.dueDate), "yyyy-MM-dd") : ""}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-[#FF5900] hover:bg-[#FF5900]/90 text-white" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
