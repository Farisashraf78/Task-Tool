"use client";

import { format } from "date-fns";
import { FileEdit, User, Clock, CheckCircle, XCircle, FileText, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function ActivityTimeline({ activities }: { activities: any[] }) {
    if (!activities || activities.length === 0) {
        return (
            <div className="text-sm text-talabat-brown/40 italic">
                No activity yet
            </div>
        );
    }

    const getIcon = (action: string) => {
        switch (action) {
            case "created":
                return { icon: FileText, color: "text-green-600", bg: "bg-green-100" };
            case "edited":
                return { icon: FileEdit, color: "text-blue-600", bg: "bg-blue-100" };
            case "status_changed":
                return { icon: CheckCircle, color: "text-talabat-purple", bg: "bg-purple-100" };
            case "reassigned":
                return { icon: User, color: "text-talabat-orange", bg: "bg-orange-100" };
            case "deleted":
                return { icon: XCircle, color: "text-red-600", bg: "bg-red-100" };
            default:
                return { icon: Clock, color: "text-talabat-brown/60", bg: "bg-gray-100" };
        }
    };

    const getActionText = (activity: any) => {
        const { action, field, oldValue, newValue, user } = activity;
        const userName = user?.name || "Someone";

        switch (action) {
            case "created":
                return `${userName} created this task`;
            case "edited":
                if (field) {
                    return (
                        <span>
                            {userName} changed <span className="font-semibold">{field}</span>
                            <ArrowRight className="inline h-3 w-3 mx-1" />
                            <span className="text-talabat-orange font-semibold">{newValue}</span>
                        </span>
                    );
                }
                return `${userName} edited this task`;
            case "status_changed":
                return (
                    <span>
                        {userName} moved to <span className="font-semibold text-talabat-purple">{newValue.replace("_", " ")}</span>
                    </span>
                );
            case "reassigned":
                return `${userName} reassigned task to ${newValue}`;
            case "deleted":
                return `${userName} deleted this task`;
            case "added_note":
                return `${userName} added a manager note`;
            default:
                return `${userName} performed ${action}`;
        }
    };

    return (
        <div className="space-y-3">
            <h4 className="font-bold text-talabat-brown flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-talabat-orange" />
                Activity Timeline
            </h4>
            <div className="relative space-y-4 pl-6">
                {/* Vertical line */}
                <div className="absolute left-2 top-6 bottom-0 w-0.5 bg-talabat-orange/30" />

                {activities.map((activity, index) => {
                    const iconData = getIcon(activity.action);
                    const Icon = iconData.icon;

                    return (
                        <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="relative flex gap-4"
                        >
                            {/* Timeline dot */}
                            <div className={`absolute -left-6 mt-1 flex items-center justify-center h-8 w-8 rounded-full ${iconData.bg} border-2 border-talabat-orange shadow-sm`}>
                                <Icon className={`h-4 w-4 ${iconData.color}`} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 bg-white rounded-lg p-3 shadow-sm border border-talabat-brown/10">
                                <p className="text-sm text-talabat-brown font-medium">{getActionText(activity)}</p>
                                <p className="text-xs text-talabat-brown/40 mt-1 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {format(new Date(activity.createdAt), "MMM d, yyyy 'at' h:mm a")}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
