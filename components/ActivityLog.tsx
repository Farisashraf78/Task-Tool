"use client";

import { format } from "date-fns";
import { FileEdit, User, Clock, CheckCircle, XCircle, FileText } from "lucide-react";

export function ActivityLog({ activities }: { activities: any[] }) {
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
                return <FileText className="h-4 w-4 text-green-600" />;
            case "edited":
                return <FileEdit className="h-4 w-4 text-blue-600" />;
            case "status_changed":
                return <CheckCircle className="h-4 w-4 text-talabat-purple" />;
            case "reassigned":
                return <User className="h-4 w-4 text-talabat-orange" />;
            case "deleted":
                return <XCircle className="h-4 w-4 text-red-600" />;
            default:
                return <Clock className="h-4 w-4 text-talabat-brown/60" />;
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
                    return `${userName} changed ${field} from "${oldValue}" to "${newValue}"`;
                }
                return `${userName} edited this task`;
            case "status_changed":
                return `${userName} changed status from "${oldValue}" to "${newValue}"`;
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
            <h4 className="font-semibold text-talabat-brown flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Activity History
            </h4>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {activities.map((activity) => (
                    <div key={activity.id} className="flex gap-3 text-sm border-l-2 border-talabat-offwhite pl-3 py-2">
                        <div className="mt-0.5">{getIcon(activity.action)}</div>
                        <div className="flex-1">
                            <p className="text-talabat-brown">{getActionText(activity)}</p>
                            <p className="text-xs text-talabat-brown/40 mt-1">
                                {format(new Date(activity.createdAt), "MMM d, yyyy 'at' h:mm a")}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
