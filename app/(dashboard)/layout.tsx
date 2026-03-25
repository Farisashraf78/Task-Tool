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
        <div className="min-h-screen bg-talabat-cream">
            <Sidebar />
            <main className="ml-[220px] px-8 pt-7 pb-8">
                {children}
            </main>
        </div>
    );
}
