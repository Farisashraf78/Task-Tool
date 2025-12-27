import { prisma } from "@/lib/prisma";
import { UserHistoryProfile } from "@/components/UserHistoryProfile";
import { redirect } from "next/navigation";

export default async function UserHistoryPage({ params }: { params: { id: string } }) {
    const { id } = params;

    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            assignedTasks: {
                orderBy: { createdAt: 'desc' },
                include: { creator: true }
            },
            assignedProjects: {
                orderBy: { createdAt: 'desc' }
            },
            activityLogs: {
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!user) {
        redirect("/history");
    }

    return <UserHistoryProfile user={user as any} />;
}
