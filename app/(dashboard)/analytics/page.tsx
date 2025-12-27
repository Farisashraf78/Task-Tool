import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { DualDashboard } from "@/components/DualDashboard";
import { redirect } from "next/navigation";

export default async function AnalyticsPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) redirect("/login");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) redirect("/login");

    // Get all tasks for metrics
    const allTasks = await prisma.task.findMany({
        orderBy: { createdAt: "desc" },
    });

    // Get all projects for metrics
    const allProjects = await prisma.project.findMany({
        include: {
            assignees: true,
        },
        orderBy: { createdAt: "desc" }
    });

    const users = await prisma.user.findMany();

    return <DualDashboard tasks={allTasks as any} projects={allProjects as any} users={users as any} currentUser={user as any} />;
}
