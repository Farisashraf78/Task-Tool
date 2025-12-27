import { prisma } from "@/lib/prisma";
import { ProjectCard } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { NewProjectDialog } from "@/components/NewProjectDialog";
import { Filter } from "lucide-react";

async function getProjects() {
    console.log("Fetching projects...");
    try {
        const projects = await prisma.project.findMany({
            where: {
                status: { not: "ARCHIVED" }
            },
            include: {
                assignees: true,
                tasks: true,
                _count: {
                    select: { tasks: true }
                }
            },
            orderBy: { updatedAt: "desc" }
        });
        return projects;
    } catch (error) {
        console.error("Error fetching projects:", error);
        return [];
    }
}

export default async function ProjectsPage() {
    const projects = await getProjects();
    const users = await prisma.user.findMany({
        where: { role: "MEMBER" } // Or all users if desired
    });

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Projects</h1>
                    <p className="text-gray-500 mt-1 text-sm">Manage and track high-level initiatives</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2 border-slate-200 text-slate-700">
                        <Filter className="h-4 w-4" />
                        Filter
                    </Button>
                    <NewProjectDialog users={users} />
                </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project: any) => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                    />
                ))}
            </div>
        </div>
    );
}
