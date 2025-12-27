"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function getNotifications() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) return [];

    return await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
    });
}

export async function markAsRead(notificationId: string) {
    await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true }
    });
}
