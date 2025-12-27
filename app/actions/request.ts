"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createNotification } from "@/lib/notifications";
import { logActivity } from "@/lib/taskUtils";

/**
 * Get Requests (Manager sees all, Member sees own)
 */
export async function getRequests() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    if (!userId) return [];

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return [];

    if (user.role === "MANAGER") {
        return await prisma.request.findMany({
            include: { requester: true },
            orderBy: { createdAt: "desc" }
        });
    } else {
        return await prisma.request.findMany({
            where: { requesterId: userId },
            include: { requester: true },
            orderBy: { createdAt: "desc" }
        });
    }
}

/**
 * Create a new Request
 */
export async function createRequest(formData: FormData) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    if (!userId) return { error: "Not authenticated" };

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const isUrgent = formData.get("isUrgent") === "on";
    const dueDateStr = formData.get("dueDate") as string;

    if (!title) return { error: "Title is required" };

    const request = await prisma.request.create({
        data: {
            title,
            description,
            isUrgent,
            dueDate: dueDateStr ? new Date(dueDateStr) : null,
            requesterId: userId,
            status: "PENDING"
        }
    });

    // Notify Manager (Assume there's at least one manager, or notify all managers)
    const managers = await prisma.user.findMany({ where: { role: "MANAGER" } });
    for (const manager of managers) {
        await createNotification(
            manager.id,
            "REQUEST",
            `${isUrgent ? 'URGENT: ' : ''}New request from Team Member`,
            request.id
        );
    }

    revalidatePath("/requests");
    return { success: true };
}

/**
 * Update Request Status (Manager Only)
 * If APPROVED -> Automatically create a Task
 */
export async function updateRequestStatus(requestId: string, status: "APPROVED" | "REJECTED", comment?: string) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    if (!userId) return { error: "Not authenticated" };

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "MANAGER") return { error: "Permission denied" };

    const request = await prisma.request.update({
        where: { id: requestId },
        data: {
            status,
            managerComment: comment
        }
    });

    // Notify Requester
    await createNotification(
        request.requesterId,
        "REQUEST_UPDATE",
        `Your request "${request.title}" was ${status}${comment ? `: ${comment}` : ''}`,
        request.id
    );

    // If Approved, convert to Task
    if (status === "APPROVED") {
        const newTask = await prisma.task.create({
            data: {
                title: request.title,
                description: request.description || `From Request: ${request.title}`,
                priority: request.isUrgent ? "URGENT" : "MEDIUM",
                status: "NEW",
                creatorId: userId,
                assigneeId: request.requesterId,
                classification: "OTHER",
                dueDate: request.dueDate
            }
        });

        await logActivity(userId, "APPROVE_REQUEST", "REQUEST", requestId, `Converted to Task ${newTask.id}${comment ? ` | Comment: ${comment}` : ''}`);
    } else {
        await logActivity(userId, "REJECT_REQUEST", "REQUEST", requestId, `Rejected: ${comment || 'No reason'}`);
    }

    revalidatePath("/requests");
    return { success: true };
}

/**
 * CANCEL REQUEST (Requester Only)
 */
export async function cancelRequest(requestId: string) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    if (!userId) return { error: "Not authenticated" };

    const request = await prisma.request.findUnique({ where: { id: requestId } });
    if (!request) return { error: "Request not found" };

    if (request.requesterId !== userId) {
        return { error: "Permission denied. You can only cancel your own requests." };
    }

    if (request.status !== "PENDING") {
        return { error: "Only pending requests can be cancelled." };
    }

    await prisma.request.delete({ where: { id: requestId } });

    await logActivity(userId, "CANCEL_REQUEST", "REQUEST", requestId, `Cancelled request: ${request.title}`);

    revalidatePath("/requests");
    return { success: true };
}
