"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
    const email = formData.get("email") as string;

    if (!email) {
        return { error: "Email is required" };
    }

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        return { error: "User not found. Please ask Maha to add you." };
    }

    // Set cookie
    (await cookies()).set("userId", user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
    });

    redirect("/dashboard");
}

export async function logout() {
    (await cookies()).delete("userId");
    redirect("/login");
}
