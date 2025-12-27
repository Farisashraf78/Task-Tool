"use client";

import { useState } from "react";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { motion } from "framer-motion";
import { PremiumTaskCard } from "./PremiumTaskCard";
import { updateTaskStatus } from "@/app/actions/task";
import { Badge } from "@/components/ui/badge";

interface DragDropKanbanProps {
    tasks: any[];
    onTaskClick: (task: any) => void;
}

const COLUMNS = [
    { id: "NEW", title: "To Do", color: "bg-gray-100" },
    { id: "IN_PROGRESS", title: "In Progress", color: "bg-blue-100" },
    { id: "UNDER_REVIEW", title: "Review", color: "bg-purple-100" },
    { id: "COMPLETED", title: "Done", color: "bg-green-100" },
];

export function DragDropKanban({ tasks, onTaskClick }: DragDropKanbanProps) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const taskId = active.id as string;
            const newStatus = over.id as string;

            await updateTaskStatus(taskId, newStatus);
        }

        setActiveId(null);
    };

    const getTasksByStatus = (status: string) => {
        return tasks.filter((task) => task.status === status);
    };

    const activeTask = tasks.find((task) => task.id === activeId);

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="grid grid-cols-4 gap-4">
                {COLUMNS.map((column) => {
                    const columnTasks = getTasksByStatus(column.id);

                    return (
                        <div
                            key={column.id}
                            className="flex flex-col min-h-[600px]"
                        >
                            {/* Column Header */}
                            <div className={`${column.color} rounded-t-lg p-3 border-b-2 border-talabat-orange/30`}>
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-talabat-brown">{column.title}</h3>
                                    <Badge variant="secondary">{columnTasks.length}</Badge>
                                </div>
                            </div>

                            {/* Droppable Area */}
                            <div
                                id={column.id}
                                className="flex-1 bg-talabat-offwhite/50 rounded-b-lg p-3 space-y-3"
                            >
                                {columnTasks.map((task) => (
                                    <div key={task.id} id={task.id}>
                                        <PremiumTaskCard task={task} onClick={() => onTaskClick(task)} />
                                    </div>
                                ))}

                                {columnTasks.length === 0 && (
                                    <div className="h-32 flex items-center justify-center text-talabat-brown/30 text-sm">
                                        Drop tasks here
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <DragOverlay>
                {activeTask ? (
                    <div className="opacity-80">
                        <PremiumTaskCard task={activeTask} onClick={() => { }} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
