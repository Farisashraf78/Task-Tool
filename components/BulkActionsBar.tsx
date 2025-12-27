"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Users, ArrowRight, CheckSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { bulkDeleteTasks, bulkUpdateStatus, bulkReassign } from "@/app/actions/task";
import { ConfirmDialog } from "./ConfirmDialog";

interface BulkActionsBarProps {
    selectedTaskIds: string[];
    onClearSelection: () => void;
    users: any[];
}

export function BulkActionsBar({ selectedTaskIds, onClearSelection, users }: BulkActionsBarProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const [showAssignMenu, setShowAssignMenu] = useState(false);

    if (selectedTaskIds.length === 0) return null;

    const handleBulkDelete = async () => {
        await bulkDeleteTasks(selectedTaskIds);
        onClearSelection();
    };

    const handleBulkStatus = async (status: string) => {
        await bulkUpdateStatus(selectedTaskIds, status);
        setShowStatusMenu(false);
        onClearSelection();
    };

    const handleBulkReassign = async (assigneeId: string) => {
        await bulkReassign(selectedTaskIds, assigneeId);
        setShowAssignMenu(false);
        onClearSelection();
    };

    return (
        <>
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
                <div className="bg-talabat-brown text-white rounded-full shadow-2xl px-6 py-4 flex items-center gap-4 border-2 border-talabat-orange">
                    <div className="flex items-center gap-2">
                        <CheckSquare className="h-5 w-5" />
                        <span className="font-bold">{selectedTaskIds.length} selected</span>
                    </div>

                    <div className="h-6 w-px bg-white/20" />

                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setShowStatusMenu(!showStatusMenu)}
                            className="bg-white/20 hover:bg-white/30"
                        >
                            <ArrowRight className="h-4 w-4 mr-1" />
                            Change Status
                        </Button>

                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setShowAssignMenu(!showAssignMenu)}
                            className="bg-white/20 hover:bg-white/30"
                        >
                            <Users className="h-4 w-4 mr-1" />
                            Reassign
                        </Button>

                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setShowDeleteConfirm(true)}
                        >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                        </Button>
                    </div>

                    <div className="h-6 w-px bg-white/20" />

                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={onClearSelection}
                        className="text-white hover:bg-white/10"
                    >
                        Clear
                    </Button>
                </div>

                {/* Status Menu */}
                {showStatusMenu && (
                    <div className="absolute bottom-full mb-2 left-0 bg-white rounded-lg shadow-xl p-2 border border-talabat-brown/20">
                        {["NEW", "IN_PROGRESS", "UNDER_REVIEW", "COMPLETED"].map((status) => (
                            <button
                                key={status}
                                onClick={() => handleBulkStatus(status)}
                                className="w-full text-left px-4 py-2 hover:bg-talabat-offwhite rounded text-talabat-brown text-sm"
                            >
                                {status.replace("_", " ")}
                            </button>
                        ))}
                    </div>
                )}

                {/* Assign Menu */}
                {showAssignMenu && (
                    <div className="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-xl p-2 border border-talabat-brown/20 max-h-60 overflow-y-auto">
                        {users.map((user) => (
                            <button
                                key={user.id}
                                onClick={() => handleBulkReassign(user.id)}
                                className="w-full text-left px-4 py-2 hover:bg-talabat-offwhite rounded text-talabat-brown text-sm whitespace-nowrap"
                            >
                                {user.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={showDeleteConfirm}
                onOpenChange={setShowDeleteConfirm}
                onConfirm={handleBulkDelete}
                title="Delete Multiple Tasks"
                description={`Are you sure you want to delete ${selectedTaskIds.length} tasks? This action cannot be undone.`}
                confirmText="Delete All"
                variant="destructive"
            />
        </>
    );
}
