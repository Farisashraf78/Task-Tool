import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProjectDetailsClient } from "@/components/ProjectDetailsClient";
import { cookies } from "next/headers";

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;

    const project = await prisma.project.findUnique({
        where: { id: resolvedParams.id },
        include: {
            assignees: true,
            tasks: {
                include: {
                    assignee: true
                },
                orderBy: { createdAt: "desc" }
            },
            _count: {
                select: { tasks: true }
            }
        }
    });

    if (!project) {
        notFound();
    }

    const allUsers = await prisma.user.findMany();
    const cookieStore = await cookies();
    const currentUserId = cookieStore.get("userId")?.value;
    const currentUser = currentUserId ? await prisma.user.findUnique({ where: { id: currentUserId } }) : null;

    if (!currentUser) return <div>Unauthorized</div>;

    return <ProjectDetailsClient project={project} users={allUsers} currentUser={currentUser} />;
}
