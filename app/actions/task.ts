"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createNotification } from "@/lib/notifications";
import { logActivity } from "@/lib/taskUtils";

/**
 * Helper to get current user
 */
async function getCurrentUser() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    if (!userId) return null;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    return user;
}

/**
 * Create a new task
 */
export async function createTask(formData: FormData) {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const priority = formData.get("priority") as string;
    const assigneeId = formData.get("assigneeId") as string;
    const dueDateStr = formData.get("dueDate") as string;
    const projectId = formData.get("projectId") as string;
    const classification = (formData.get("classification") as string) || "OTHER";

    const cookieStore = await cookies();
    const creatorId = cookieStore.get("userId")?.value;

    if (!creatorId) {
        return { error: "Not authenticated" };
    }

    const user = await prisma.user.findUnique({ where: { id: creatorId } });
    if (!user || !user.name.toLowerCase().includes("maha")) {
        return { error: "Only Mahaa is allowed to create tasks." };
    }

    if (!title) {
        return { error: "Title is required" };
    }

    let dueDate: Date | null = null;
    if (dueDateStr) {
        dueDate = new Date(dueDateStr);
    }

    // Handle unassigned
    let finalAssigneeId: string | null = assigneeId;
    if (!assigneeId || assigneeId === "unassigned") {
        finalAssigneeId = null;
    }

    const task = await prisma.task.create({
        data: {
            title,
            description,
            priority: priority || "MEDIUM",
            status: "NEW",
            dueDate,
            classification,
            creatorId,
            assigneeId: finalAssigneeId,
            projectId: projectId || null,
        },
    });

    // Log creation
    await logActivity(creatorId, "CREATE_TASK", "TASK", task.id, title);

    // Notify assignee
    if (finalAssigneeId && finalAssigneeId !== creatorId) {
        await createNotification(
            finalAssigneeId,
            "ASSIGNMENT",
            `You were assigned a new task: ${title}`,
            task.id
        );
    }

    revalidatePath("/dashboard");
    return { success: true };
}

/**
 * UPDATE TASK - Manager only (full edit)
 */
export async function updateTask(
    taskId: string,
    updates: {
        title?: string;
        description?: string;
        priority?: string;
        status?: string;
        classification?: string;
        dueDate?: string | null;
        assigneeId?: string | null;
    }
) {
    const user = await getCurrentUser();
    if (!user) return { error: "Not authenticated" };

    // Get current task
    const currentTask = await prisma.task.findUnique({
        where: { id: taskId },
        include: { assignee: true },
    });

    if (!currentTask) return { error: "Task not found" };

    // Permission Check
    const isManager = user.role === "MANAGER";
    const isAssignee = currentTask.assigneeId === user.id;

    if (!isManager && !isAssignee) {
        return { error: "Permission denied. You can only edit tasks assigned to you." };
    }

    // Track changes for activity log
    const changes: Array<{ field: string; oldValue: string; newValue: string }> = [];

    if (updates.title && updates.title !== currentTask.title) {
        changes.push({ field: "title", oldValue: currentTask.title, newValue: updates.title });
    }
    if (updates.description !== undefined && updates.description !== currentTask.description) {
        changes.push({
            field: "description",
            oldValue: currentTask.description || "",
            newValue: updates.description || "",
        });
    }
    if (updates.priority && updates.priority !== currentTask.priority) {
        changes.push({ field: "priority", oldValue: currentTask.priority, newValue: updates.priority });
    }
    if (updates.status && updates.status !== currentTask.status) {
        changes.push({ field: "status", oldValue: currentTask.status, newValue: updates.status });
    }
    if (updates.classification && updates.classification !== currentTask.classification) {
        changes.push({ field: "classification", oldValue: currentTask.classification, newValue: updates.classification });
    }
    if (updates.dueDate !== undefined) {
        const oldDate = currentTask.dueDate?.toISOString() || "none";
        const newDate = updates.dueDate || "none";
        if (oldDate !== newDate) {
            changes.push({ field: "dueDate", oldValue: oldDate, newValue: newDate });
        }
    }
    if (updates.assigneeId !== undefined && updates.assigneeId !== currentTask.assigneeId) {
        changes.push({
            field: "assigneeId",
            oldValue: currentTask.assignee?.name || "Unassigned",
            newValue: updates.assigneeId || "Unassigned",
        });
    }

    // Update task
    const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
            title: updates.title,
            description: updates.description,
            priority: updates.priority,
            status: updates.status,
            classification: updates.classification,
            dueDate: updates.dueDate ? new Date(updates.dueDate) : null,
            completedAt: updates.status === "COMPLETED" ? new Date() : (updates.status && updates.status !== "COMPLETED" ? null : undefined),
            assigneeId: updates.assigneeId,
        },
    });

    // Log each change
    for (const change of changes) {
        await logActivity(
            user.id,
            "UPDATE_TASK",
            "TASK",
            taskId,
            `Updated ${change.field}`,
            change.field,
            change.oldValue,
            change.newValue
        );
    }

    // Notify if assignee changed
    if (updates.assigneeId !== undefined && updates.assigneeId !== currentTask.assigneeId) {
        if (updates.assigneeId) {
            await createNotification(
                updates.assigneeId,
                "ASSIGNMENT",
                `Task "${updatedTask.title}" was reassigned to you`,
                taskId
            );
        }
        if (currentTask.assigneeId && currentTask.assigneeId !== user.id) {
            await createNotification(
                currentTask.assigneeId,
                "UPDATE",
                `Task "${updatedTask.title}" was reassigned`,
                taskId
            );
        }
    }

    // Notify if deadline changed
    if (changes.some((c) => c.field === "dueDate") && updatedTask.assigneeId) {
        await createNotification(
            updatedTask.assigneeId,
            "UPDATE",
            `Deadline changed for "${updatedTask.title}"`,
            taskId
        );
    }

    revalidatePath("/dashboard");
    return { success: true };
}

/**
 * DELETE TASK - Manager only
 */
export async function deleteTask(taskId: string) {
    const user = await getCurrentUser();
    if (!user) return { error: "Not authenticated" };
    if (user.role !== "MANAGER") return { error: "Permission denied - Manager only" };

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return { error: "Task not found" };

    // Log deletion before deleting
    await logActivity(user.id, "DELETE_TASK", "TASK", taskId, "Task deleted");

    await prisma.task.delete({ where: { id: taskId } });

    revalidatePath("/dashboard");
    return { success: true };
}

/**
 * ADD MANAGER NOTE - Manager only
 */
export async function addManagerNote(taskId: string, content: string) {
    const user = await getCurrentUser();
    if (!user) return { error: "Not authenticated" };
    if (user.role !== "MANAGER") return { error: "Permission denied - Manager only" };

    await prisma.managerNote.create({
        data: {
            taskId,
            content,
        },
    });

    await logActivity(user.id, "ADD_NOTE", "TASK", taskId, "Manager note added");

    revalidatePath("/dashboard");
    return { success: true };
}

/**
 * DUPLICATE TASK
 */
export async function duplicateTask(taskId: string) {
    const user = await getCurrentUser();
    if (!user) return { error: "Not authenticated" };

    const original = await prisma.task.findUnique({ where: { id: taskId } });
    if (!original) return { error: "Task not found" };

    const duplicate = await prisma.task.create({
        data: {
            title: `${original.title} (Copy)`,
            description: original.description,
            priority: original.priority,
            status: "NEW",
            dueDate: original.dueDate,
            creatorId: user.id,
            assigneeId: null, // Unassigned by default
        },
    });

    await logActivity(user.id, "DUPLICATE_TASK", "TASK", duplicate.id, `Duplicated from ${taskId}`);

    revalidatePath("/dashboard");
    return { success: true, taskId: duplicate.id };
}

/**
 * UPDATE STATUS (Members can use this)
 */
export async function updateTaskStatus(taskId: string, status: string) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    if (!userId) return { error: "Not authenticated" };

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return { error: "Task not found" };

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { error: "User not found" };

    const isManager = user.role === "MANAGER";
    const isAssignee = task.assigneeId === userId;
    const isFaris = user.name.toLowerCase().includes("faris");

    if (!isManager && !isAssignee && !isFaris) {
        return { error: "Permission denied. Only Faris or managers/assignees can update status." };
    }

    const oldStatus = task.status;

    await prisma.task.update({
        where: { id: taskId },
        data: {
            status,
            completedAt: status === "COMPLETED" ? new Date() : null
        },
    });

    // Calculate Impact if completing
    let impact: { type: 'LATE' | 'ON_TIME' | 'RISK_HIGH' | 'RISK_RESOLVED'; label: string } | undefined;

    if (status === "COMPLETED" && task.dueDate) {
        const now = new Date();
        const due = new Date(task.dueDate);
        if (now > due) {
            // Calculate days late
            const diffTime = Math.abs(now.getTime() - due.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            impact = {
                type: 'LATE',
                label: `${diffDays} Day${diffDays > 1 ? 's' : ''} Late`
            };
        } else {
            impact = {
                type: 'ON_TIME',
                label: "On Time"
            };
        }
    }

    // Log status change
    await logActivity(
        userId,
        "UPDATE_STATUS",
        "TASK",
        taskId,
        `Status updated to ${status}`,
        "status",
        oldStatus,
        status,
        impact // Pass the calculated impact
    );

    // Notify creator if someone else updates it
    if (task.creatorId !== userId) {
        await createNotification(
            task.creatorId,
            "UPDATE",
            `Task "${task.title}" status updated to ${status.replace("_", " ")}`,
            task.id
        );
    }

    revalidatePath("/dashboard");
    return { success: true };
}

/**
 * Get users
 */
export async function getUsers() {
    return await prisma.user.findMany();
}

/**
 * BULK DELETE - Manager only
 */
export async function bulkDeleteTasks(taskIds: string[]) {
    const user = await getCurrentUser();
    if (!user) return { error: "Not authenticated" };
    if (user.role !== "MANAGER") return { error: "Permission denied - Manager only" };

    // Log deletions
    for (const taskId of taskIds) {
        await logActivity(user.id, "DELETE_TASK", "TASK", taskId, "Bulk deleted");
    }

    await prisma.task.deleteMany({
        where: {
            id: {
                in: taskIds,
            },
        },
    });

    revalidatePath("/dashboard");
    return { success: true };
}

/**
 * BULK UPDATE STATUS - Manager only
 */
export async function bulkUpdateStatus(taskIds: string[], status: string) {
    const user = await getCurrentUser();
    if (!user) return { error: "Not authenticated" };
    if (user.role !== "MANAGER") return { error: "Permission denied - Manager only" };

    await prisma.task.updateMany({
        where: {
            id: {
                in: taskIds,
            },
        },
        data: { status },
    });

    // Log changes
    for (const taskId of taskIds) {
        await logActivity(
            user.id,
            "UPDATE_STATUS",
            "TASK",
            taskId,
            `Bulk status update to ${status}`,
            "status",
            "various",
            status
        );
    }

    revalidatePath("/dashboard");
    return { success: true };
}

/**
 * BULK REASSIGN - Manager only
 */
export async function bulkReassign(taskIds: string[], assigneeId: string) {
    const user = await getCurrentUser();
    if (!user) return { error: "Not authenticated" };
    if (user.role !== "MANAGER") return { error: "Permission denied - Manager only" };

    await prisma.task.updateMany({
        where: {
            id: {
                in: taskIds,
            },
        },
        data: { assigneeId },
    });

    // Log and notify
    for (const taskId of taskIds) {
        await logActivity(
            user.id,
            "REASSIGN_TASK",
            "TASK",
            taskId,
            "Bulk reassigned",
            "assigneeId",
            "various",
            assigneeId
        );
    }

    if (assigneeId) {
        await createNotification(
            assigneeId,
            "ASSIGNMENT",
            `You were assigned ${taskIds.length} tasks`,
            taskIds[0]
        );
    }

    revalidatePath("/dashboard");
    return { success: true };
}
