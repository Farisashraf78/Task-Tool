import { Sidebar } from "@/components/Sidebar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId");

    if (!userId) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-white">
            <Sidebar />
            <main className="ml-[280px] p-0">
                {children}
            </main>
        </div>
    );
}
