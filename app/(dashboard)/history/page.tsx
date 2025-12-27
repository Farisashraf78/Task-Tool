import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { HistoryView } from "@/components/HistoryView";
import { getHistoryStats } from "@/lib/taskUtils";

async function getUser() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    if (!userId) return null;
    return await prisma.user.findUnique({ where: { id: userId } });
}

async function getLogs(userRole: string, userId: string) {
    if (userRole === "MANAGER") {
        return await prisma.activityLog.findMany({
            include: { user: true },
            orderBy: { createdAt: "desc" }
        });
    } else {
        // Members see their own actions AND actions on tasks assigned to them
        const assignedTasks = await prisma.task.findMany({
            where: { assigneeId: userId },
            select: { id: true }
        });
        const assignedTaskIds = assignedTasks.map(t => t.id);

        return await prisma.activityLog.findMany({
            where: {
                OR: [
                    { userId: userId }, // Actions I did
                    { taskId: { in: assignedTaskIds } } // Actions on my tasks
                ]
            },
            include: { user: true },
            orderBy: { createdAt: "desc" }
        });
    }
}

export default async function HistoryPage() {
    const user = await getUser();
    if (!user) redirect("/login");

    const logs = await getLogs(user.role, user.id);
    const teamMembers = user.role === "MANAGER" ? await prisma.user.findMany() : [];

    // Fetch insights only for managers
    const stats = user.role === "MANAGER" ? await getHistoryStats() : null;

    return (
        <HistoryView
            logs={logs as any}
            currentUser={user}
            teamMembers={teamMembers}
            stats={stats}
        />
    );
}
