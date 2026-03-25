import { cookies } from "next/headers";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
    LayoutDashboard,
    Bell,
    LogOut,
    Building2,
    History,
    MessageSquare,
    TrendingUp
} from "lucide-react";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { getNotifications } from "@/app/actions/notification";
import { NotificationCenter } from "@/components/NotificationCenter";
import { cn } from "@/lib/utils";

async function getUser() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    if (!userId) return null;
    return await prisma.user.findUnique({ where: { id: userId } });
}

export async function Sidebar() {
    const user = await getUser();

    if (!user) return null; // Should be handled by layout redirection

    const notifications = await getNotifications();

    const menuItems = [
        {
            title: user.role === 'MANAGER' ? 'Manager Dashboard' : 'My Dashboard',
            icon: LayoutDashboard,
            href: '/dashboard',
            visible: true
        },
        {
            title: 'Projects',
            icon: Building2,
            href: '/projects',
            visible: user.role === 'MANAGER'
        },
        {
            title: 'Requests',
            icon: MessageSquare,
            href: '/requests',
            visible: true
        },
        {
            title: 'Notifications',
            icon: Bell,
            href: '/notifications',
            visible: true,
            component: <NotificationCenter notifications={notifications} />
        },
        {
            title: 'Performance',
            icon: TrendingUp,
            href: '/analytics',
            visible: true
        },
        {
            title: user.role === 'MANAGER' ? 'Global History' : 'My History',
            icon: History,
            href: '/history',
            visible: true
        }
    ];

    return (
        <div className="flex flex-col h-full w-[220px] bg-talabat-maroon text-white flex-shrink-0 transition-all duration-300 fixed left-0 top-0 z-40 border-t-[3px] border-t-talabat-orange">
            {/* Logo Section */}
            <div className="p-6 pb-8">
                <h1 className="text-xl font-bold tracking-tight text-white font-outfit">
                    talabat taskaty
                </h1>
                <p className="text-[10px] text-talabat-lime mt-1 uppercase tracking-wider font-semibold">
                    Operations Hub
                </p>
            </div>

            {/* Navigation */}
            <div className="flex-1 px-3 space-y-1">
                {menuItems.filter(item => item.visible).map((item) => {
                    const isActive = false; // Simplified

                    if (item.title === 'Notifications' && item.component) {
                        return <div key={item.title}>{item.component}</div>;
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group relative text-white/70 hover:text-white hover:bg-white/[0.08]",
                                isActive && "bg-talabat-orange/15 text-white border-l-4 border-talabat-orange"
                            )}
                        >
                            <item.icon className={cn(
                                "h-5 w-5 transition-transform duration-200"
                            )} />
                            <span className="relative z-10">{item.title}</span>
                        </Link>
                    );
                })}
            </div>

            {/* User Profile Section */}
            <div className="p-4 mt-auto">
                <div className="bg-white/[0.04] rounded-xl p-3 border border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-talabat-orange flex items-center justify-center text-white font-bold shrink-0">
                            {user.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">
                                {user.name}
                            </p>
                            <div className="mt-0.5 flex bg-black/40 rounded px-1.5 py-0.5 w-max">
                                <p className="text-[10px] text-talabat-lime uppercase tracking-wider font-medium">
                                    {user.role}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sign Out Button */}
                    <div className="mt-4 pt-3 border-t border-white/10">
                        <form action={logout}>
                            <Button variant="ghost" className="w-full justify-start h-auto p-0 text-white/50 hover:text-white hover:bg-transparent transition-colors text-xs">
                                <LogOut className="mr-2 h-3 w-3" />
                                Sign Out
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
