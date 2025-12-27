import { prisma } from "@/lib/prisma";

/**
 * Log an activity for a task
 */
export async function logActivity(
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    details?: string,
    field?: string,
    oldValue?: string,
    newValue?: string,
    impact?: { type: 'LATE' | 'ON_TIME' | 'RISK_HIGH' | 'RISK_RESOLVED'; label: string }
) {
    try {
        // Resolve entity name if not provided in details
        let resolvedName = details;
        if (!resolvedName && entityType === "TASK") {
            const task = await prisma.task.findUnique({ where: { id: entityId } });
            resolvedName = task?.title || "Unknown Task";
        } else if (!resolvedName && entityType === "PROJECT") {
            const project = await prisma.project.findUnique({ where: { id: entityId } });
            resolvedName = project?.title || "Unknown Project";
        }

        // Use the resolved name as the primary detail if no specific detail was passed
        let finalDetails = details || resolvedName;

        // If impact exists, serialize it into details for storage
        if (impact) {
            const structuredData = {
                text: finalDetails,
                impact: impact
            };
            finalDetails = JSON.stringify(structuredData);
        }

        await prisma.activityLog.create({
            data: {
                userId,
                action,
                entityType,
                entityId,
                details: finalDetails,
                field,
                oldValue,
                newValue,
                // Link relations if possible for integrity
                taskId: entityType === "TASK" ? entityId : undefined,
                projectId: entityType === "PROJECT" ? entityId : undefined,
            },
        });
    } catch (error) {
        console.error("Failed to log activity:", error);
    }
}

/**
 * Get aggregated history statistics for the Manager Dashboard
 */
export async function getHistoryStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Total activities in last 30 days
    const totalActivities = await prisma.activityLog.count({
        where: {
            createdAt: { gte: thirtyDaysAgo }
        }
    });

    // 2. Most active users (simple count)
    const activeUsers = await prisma.activityLog.groupBy({
        by: ['userId'],
        _count: {
            id: true
        },
        where: {
            createdAt: { gte: thirtyDaysAgo }
        },
        orderBy: {
            _count: {
                id: 'desc'
            }
        },
        take: 5
    });

    // Fetch user details for these IDs
    const userIds = activeUsers.map(u => u.userId);
    const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, avatar: true }
    });

    const topContributors = activeUsers.map(u => {
        const user = users.find(ur => ur.id === u.userId);
        return {
            name: user?.name || 'Unknown',
            avatar: user?.avatar,
            count: u._count.id
        };
    });

    // 3. Late Completions (Risk Indicator)
    // We look for logs with "LATE" impact in the details (requires parsing or string search)
    const lateLogs = await prisma.activityLog.count({
        where: {
            action: { contains: "COMPLETE" },
            details: { contains: "LATE" },
            createdAt: { gte: thirtyDaysAgo }
        }
    });

    return {
        totalActivities,
        topContributors,
        lateCompletions: lateLogs
    };
}

/**
 * Check if a task is overdue
 */
export function isOverdue(task: { dueDate: Date | null; status: string }): boolean {
    if (!task.dueDate || task.status === "COMPLETED") return false;
    return new Date(task.dueDate) < new Date();
}

/**
 * Get tasks due in the next N days
 */
export async function getUpcomingDeadlines(days: number = 7) {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    return await prisma.task.findMany({
        where: {
            dueDate: {
                gte: now,
                lte: future,
            },
            status: {
                not: "COMPLETED",
            },
        },
        include: {
            assignee: true,
            creator: true,
        },
        orderBy: {
            dueDate: "asc",
        },
    });
}

/**
 * Get all overdue tasks
 */
export async function getOverdueTasks() {
    return await prisma.task.findMany({
        where: {
            dueDate: {
                lt: new Date(),
            },
            status: {
                not: "COMPLETED",
            },
        },
        include: {
            assignee: true,
            creator: true,
        },
        orderBy: {
            dueDate: "asc",
        },
    });
}

/**
 * Get tasks needing review
 */
export async function getTasksNeedingReview() {
    return await prisma.task.findMany({
        where: {
            status: "UNDER_REVIEW",
        },
        include: {
            assignee: true,
            creator: true,
        },
        orderBy: {
            updatedAt: "desc",
        },
    });
}

/**
 * Get task counts by status
 */
export async function getTaskCountsByStatus() {
    const statuses = ["NEW", "IN_PROGRESS", "UNDER_REVIEW", "COMPLETED"];
    const counts: Record<string, number> = {};

    for (const status of statuses) {
        counts[status] = await prisma.task.count({ where: { status } });
    }

    return counts;
}

/**
 * Get task counts by person
 */
export async function getTaskCountsByPerson() {
    const users = await prisma.user.findMany({
        include: {
            _count: {
                select: {
                    assignedTasks: {
                        where: {
                            status: {
                                not: "COMPLETED",
                            },
                        },
                    },
                },
            },
        },
    });

    return users.map((user) => ({
        name: user.name,
        count: user._count.assignedTasks,
    }));
}
