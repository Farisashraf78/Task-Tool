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
        <div className="flex flex-col h-full w-[280px] bg-[#F4EDE3] text-[#411517] flex-shrink-0 transition-all duration-300 fixed left-0 top-0 z-40 border-r border-[#411517]/5">
            {/* Logo Section */}
            <div className="p-8 pb-12">
                <h1 className="text-2xl font-bold tracking-tight text-[#411517] font-outfit">
                    talabat taskaty
                </h1>
                <p className="text-xs text-[#411517]/50 mt-1 uppercase tracking-wider font-medium">
                    Operations Hub
                </p>
            </div>

            {/* Navigation */}
            <div className="flex-1 px-4 space-y-2">
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
                                "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden text-[#411517]/60 hover:text-[#411517] hover:bg-white/60",
                                isActive && "bg-white text-[#FF5900] shadow-sm"
                            )}
                        >
                            <item.icon className={cn(
                                "h-5 w-5 transition-transform duration-200 group-hover:scale-110"
                            )} />
                            <span className="relative z-10">{item.title}</span>
                        </Link>
                    );
                })}
            </div>

            {/* User Profile Section */}
            <div className="p-4 mt-auto">
                <div className="bg-white/40 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/60 transition-colors duration-200 group relative overflow-hidden">
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="h-10 w-10 rounded-full bg-[#FF5900] flex items-center justify-center text-white font-bold shadow-lg shadow-[#FF5900]/20">
                            {user.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[#411517] truncate">
                                {user.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    user.role === 'MANAGER' ? "bg-[#FF5900]" : "bg-[#CFFF00]"
                                )} />
                                <p className="text-xs text-[#411517]/50 truncate uppercase tracking-wider font-medium">
                                    {user.role}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sign Out Button */}
                    <div className="mt-4 pt-3 border-t border-[#411517]/10">
                        <form action={logout}>
                            <Button variant="ghost" className="w-full justify-start h-auto p-0 text-[#411517]/40 hover:text-[#FF5900] hover:bg-transparent transition-colors text-xs">
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
