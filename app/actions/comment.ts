"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createNotification } from "@/lib/notifications";

export async function addComment(taskId: string, content: string) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) return { error: "Not authenticated" };
    if (!content) return { error: "Content is required" };

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return { error: "Task not found" };

    await prisma.comment.create({
        data: {
            content,
            taskId,
            authorId: userId,
        },
    });

    // Notify Assignee if not the commenter
    if (task.assigneeId && task.assigneeId !== userId) {
        await createNotification(
            task.assigneeId,
            "COMMENT",
            `New comment on "${task.title}"`,
            taskId
        );
    }

    // Notify Creator if not the commenter and not the assignee (avoid double notify)
    if (task.creatorId !== userId && task.creatorId !== task.assigneeId) {
        await createNotification(
            task.creatorId,
            "COMMENT",
            `New comment on "${task.title}"`,
            taskId
        );
    }

    revalidatePath("/dashboard");
    return { success: true };
}
