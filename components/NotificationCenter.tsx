"use client";

import { useState } from "react";
import { Bell, CheckSquare } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format, isToday } from "date-fns";
import { markAsRead } from "@/app/actions/notification";

export function NotificationCenter({ notifications }: { notifications: any[] }) {
    const [unreadCount, setUnreadCount] = useState(
        notifications.filter((n) => !n.read).length
    );
    const [list, setList] = useState(notifications);

    const handleMarkRead = async (id: string) => {
        await markAsRead(id);
        setList(list.map(n => n.id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const handleMarkAllRead = async () => {
        const unreadIds = list.filter(n => !n.read).map(n => n.id);
        setList(list.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
        
        for (const id of unreadIds) {
            await markAsRead(id);
        }
    };

    const todayNotifications = list.filter(n => isToday(new Date(n.createdAt)));
    const earlierNotifications = list.filter(n => !isToday(new Date(n.createdAt)));

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" className="relative w-full justify-start text-talabat-text-dark hover:text-talabat-orange hover:bg-talabat-orange/5">
                    <Bell className="mr-2 h-5 w-5" />
                    <span className="font-bold">Notifications</span>
                    {unreadCount > 0 && (
                        <span className="ml-auto bg-talabat-orange text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[340px] p-0 bg-white border border-talabat-border shadow-[0_4px_24px_rgba(0,0,0,0.08)] rounded-xl overflow-hidden" align="start">
                <div className="p-4 border-b border-talabat-border flex items-center justify-between bg-talabat-light-gray">
                    <div className="font-bold text-talabat-text-dark">
                        Notifications
                    </div>
                    {unreadCount > 0 && (
                        <button 
                            onClick={handleMarkAllRead}
                            className="text-[11px] font-bold text-talabat-orange hover:text-talabat-orange/80 uppercase tracking-wide flex items-center gap-1 transition-colors"
                        >
                            <CheckSquare className="h-3 w-3" />
                            Mark all read
                        </button>
                    )}
                </div>
                
                <div className="max-h-[360px] overflow-y-auto">
                    {list.length === 0 ? (
                        <div className="p-8 text-center flex flex-col items-center justify-center">
                            <div className="w-12 h-12 bg-talabat-light-gray rounded-full flex items-center justify-center mb-3">
                                <Bell className="h-5 w-5 text-talabat-text-muted/50" />
                            </div>
                            <span className="text-sm font-bold text-talabat-text-dark">All caught up!</span>
                            <span className="text-xs text-talabat-text-muted mt-1">No new notifications.</span>
                        </div>
                    ) : (
                        <div className="divide-y divide-talabat-border/50">
                            {/* Today Section */}
                            {todayNotifications.length > 0 && (
                                <div>
                                    <div className="px-4 py-2 bg-talabat-light-gray/50 text-[10px] font-bold uppercase tracking-wider text-talabat-text-muted">
                                        Today
                                    </div>
                                    <div className="divide-y divide-talabat-border/50">
                                        {todayNotifications.map((n) => (
                                            <div
                                                key={n.id}
                                                className={`p-4 text-sm transition-colors cursor-pointer relative ${!n.read ? "bg-talabat-cream/30 hover:bg-talabat-cream/50" : "bg-white hover:bg-talabat-light-gray/50"}`}
                                                onClick={() => !n.read && handleMarkRead(n.id)}
                                            >
                                                {!n.read && (
                                                    <div className="absolute left-1.5 top-5 w-2 h-2 rounded-full bg-talabat-orange" />
                                                )}
                                                <div className="pl-2">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className={`text-xs font-bold uppercase tracking-wide ${!n.read ? "text-talabat-orange" : "text-talabat-text-muted"}`}>
                                                            {n.type.replace(/_/g, " ")}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-talabat-text-muted whitespace-nowrap ml-2">
                                                            {format(new Date(n.createdAt), "h:mm a")}
                                                        </span>
                                                    </div>
                                                    <p className={`text-sm ${!n.read ? "font-bold text-talabat-text-dark" : "text-talabat-text-muted font-medium"} leading-snug mt-0.5`}>{n.message}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Earlier Section */}
                            {earlierNotifications.length > 0 && (
                                <div>
                                    <div className="px-4 py-2 bg-talabat-light-gray/50 text-[10px] font-bold uppercase tracking-wider text-talabat-text-muted">
                                        Earlier
                                    </div>
                                    <div className="divide-y divide-talabat-border/50">
                                        {earlierNotifications.map((n) => (
                                            <div
                                                key={n.id}
                                                className={`p-4 text-sm transition-colors cursor-pointer relative ${!n.read ? "bg-talabat-cream/30 hover:bg-talabat-cream/50" : "bg-white hover:bg-talabat-light-gray/50"}`}
                                                onClick={() => !n.read && handleMarkRead(n.id)}
                                            >
                                                {!n.read && (
                                                    <div className="absolute left-1.5 top-5 w-2 h-2 rounded-full bg-talabat-orange" />
                                                )}
                                                <div className="pl-2">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className={`text-xs font-bold uppercase tracking-wide ${!n.read ? "text-talabat-orange" : "text-talabat-text-muted"}`}>
                                                            {n.type.replace(/_/g, " ")}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-talabat-text-muted whitespace-nowrap ml-2">
                                                            {format(new Date(n.createdAt), "MMM d")}
                                                        </span>
                                                    </div>
                                                    <p className={`text-sm ${!n.read ? "font-bold text-talabat-text-dark" : "text-talabat-text-muted font-medium"} leading-snug mt-0.5`}>{n.message}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
