"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
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

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" className="relative w-full justify-start text-talabat-brown hover:text-talabat-orange hover:bg-talabat-orange/5">
                    <Bell className="mr-2 h-5 w-5" />
                    Notifications
                    {unreadCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-white border-talabat-brown/10" align="start">
                <div className="p-4 border-b border-talabat-brown/10 font-semibold text-talabat-brown">
                    Notifications
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                    {list.length === 0 ? (
                        <div className="p-4 text-center text-sm text-talabat-brown/50">
                            No notifications.
                        </div>
                    ) : (
                        list.map((n) => (
                            <div
                                key={n.id}
                                className={`p-4 border-b border-talabat-brown/5 last:border-0 text-sm hover:bg-talabat-offwhite/50 cursor-pointer ${!n.read ? "bg-talabat-offwhite/30" : ""
                                    }`}
                                onClick={() => !n.read && handleMarkRead(n.id)}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`font-medium ${!n.read ? "text-talabat-orange" : "text-talabat-brown"}`}>
                                        {n.type}
                                    </span>
                                    <span className="text-xs text-talabat-brown/40">
                                        {format(new Date(n.createdAt), "MMM d")}
                                    </span>
                                </div>
                                <p className="text-talabat-brown/80">{n.message}</p>
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
