import { prisma } from "@/lib/prisma";

export async function createNotification(
    userId: string,
    type: string,
    message: string,
    taskId?: string
) {
    try {
        await prisma.notification.create({
            data: {
                userId,
                type,
                message,
                taskId,
                read: false,
            },
        });
        console.log(`[Notification] To ${userId}: ${message}`); // Simulate email log
    } catch (error) {
        console.error("Failed to create notification", error);
    }
}
