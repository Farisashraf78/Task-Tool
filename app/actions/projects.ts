"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/taskUtils";
import { cookies } from "next/headers";

async function getCurrentUser() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    if (!userId) return null;
    return prisma.user.findUnique({ where: { id: userId } });
}

export async function createProject(formData: FormData) {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const priority = formData.get("priority") as string;
    const startDate = formData.get("startDate") as string;
    const dueDate = formData.get("dueDate") as string;

    const assigneesJson = formData.get("assignees") as string;
    const assigneeIds = assigneesJson ? JSON.parse(assigneesJson) : [];

    const user = await getCurrentUser();
    if (!user) return { error: "Unauthorized" };
    // Manager check mostly for UI, but backend should enforce too if we are strict. 
    // Allowing members to create projects might be okay, but let's stick to "Manager Only" for now if inferred from prompt "Manager... Can create/edit/delete projects".
    if (user.role !== "MANAGER") return { error: "Permission denied - Managers only" };

    try {
        const project = await prisma.project.create({
            data: {
                title,
                description,
                priority,
                startDate: startDate ? new Date(startDate) : null,
                dueDate: dueDate ? new Date(dueDate) : null,
                status: "ACTIVE",
                creator: { connect: { id: user.id } },
                assignees: {
                    connect: assigneeIds.map((id: string) => ({ id }))
                }
            }
        });

        await logActivity(user.id, "CREATE_PROJECT", "PROJECT", project.id, project.title);
        revalidatePath("/projects");
        return { success: true, project };
    } catch (error) {
        console.error("Failed to create project:", error);
        return { error: "Failed to create project" };
    }
}

/**
 * UPDATE PROJECT - Manager Only
 */
export async function updateProject(
    projectId: string,
    updates: {
        title?: string;
        description?: string;
        status?: string;
        priority?: string;
        startDate?: Date | null;
        dueDate?: Date | null;
    }
) {
    const user = await getCurrentUser();
    if (!user) return { error: "Not authenticated" };
    if (user.role !== "MANAGER") return { error: "Permission denied" };

    try {
        const project = await prisma.project.update({
            where: { id: projectId },
            data: updates,
        });

        await logActivity(user.id, "UPDATE_PROJECT", "PROJECT", project.id, `Updated project details`);
        revalidatePath(`/projects/${projectId}`);
        revalidatePath("/projects");
        return { success: true, project };
    } catch (error) {
        return { error: "Failed to update project" };
    }
}

/**
 * ADD MEMBER - Manager Only
 */
export async function addMember(projectId: string, userId: string) {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "MANAGER") return { error: "Permission denied" };

    try {
        await prisma.project.update({
            where: { id: projectId },
            data: { assignees: { connect: { id: userId } } }
        });

        await logActivity(currentUser.id, "ADD_MEMBER", "PROJECT", projectId, `Added user ${userId} to project`);
        revalidatePath(`/projects/${projectId}`);
        return { success: true };
    } catch (error) {
        return { error: "Failed to add member" };
    }
}

/**
 * REMOVE MEMBER - Manager Only
 */
export async function removeMember(projectId: string, userId: string) {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "MANAGER") return { error: "Permission denied" };

    try {
        await prisma.project.update({
            where: { id: projectId },
            data: { assignees: { disconnect: { id: userId } } }
        });

        await logActivity(currentUser.id, "REMOVE_MEMBER", "PROJECT", projectId, `Removed user ${userId} from project`);
        revalidatePath(`/projects/${projectId}`);
        return { success: true };
    } catch (error) {
        return { error: "Failed to remove member" };
    }
}

/**
 * DELETE PROJECT - Manager Only
 */
export async function deleteProject(projectId: string) {
    const user = await getCurrentUser();
    if (!user || user.role !== "MANAGER") return { error: "Permission denied" };

    try {
        // Log deletion before deleting
        await logActivity(user.id, "DELETE_PROJECT", "PROJECT", projectId, `Deleted project ${projectId}`);

        await prisma.project.delete({
            where: { id: projectId }
        });

        revalidatePath("/projects");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete project:", error);
        return { error: "Failed to delete project" };
    }
}
