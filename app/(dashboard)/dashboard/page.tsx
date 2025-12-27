import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { PremiumDashboard } from "@/components/PremiumDashboard";

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) return null;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;

    const isManager = user.role === "MANAGER";

    // Get all tasks with full includes
    const allTasks = await prisma.task.findMany({
        where: isManager
            ? {} // Managers see ALL tasks
            : { assigneeId: userId }, // Members see ONLY their tasks
        include: {
            assignee: true,
            creator: true,
            comments: { include: { author: true }, orderBy: { createdAt: "desc" } },
            activityLogs: { include: { user: true }, orderBy: { createdAt: "desc" } },
        },
        orderBy: { createdAt: "desc" },
    });

    // Get all users for the "New Task" dialog
    const users = await prisma.user.findMany();

    return <PremiumDashboard tasks={allTasks} users={users} currentUser={user} />;
}
