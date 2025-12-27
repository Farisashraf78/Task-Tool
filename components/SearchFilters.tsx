"use client";

import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface SearchFiltersProps {
    onSearch: (query: string) => void;
    onFilterChange: (filters: FilterOptions) => void;
    users: any[];
}

export interface FilterOptions {
    status?: string[];
    priority?: string[];
    assigneeId?: string[];
    dateRange?: { from: Date | null; to: Date | null };
    quickFilter?: string;
}

export function SearchFilters({ onSearch, onFilterChange, users }: SearchFiltersProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<FilterOptions>({});
    const [showFilters, setShowFilters] = useState(false);

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        onSearch(value);
    };

    const handleQuickFilter = (filterType: string) => {
        const newFilters = { ...filters, quickFilter: filterType };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        setFilters({});
        setSearchQuery("");
        onSearch("");
        onFilterChange({});
    };

    const activeFilterCount = Object.keys(filters).filter(
        (key) => filters[key as keyof FilterOptions] && key !== 'quickFilter'
    ).length + (filters.quickFilter ? 1 : 0);

    return (
        <div className="space-y-3">
            {/* Search Bar */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-talabat-brown/40" />
                    <Input
                        placeholder="Search tasks by title, description, or assignee..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-10 bg-white border-talabat-brown/20 focus:border-talabat-orange"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => handleSearchChange("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                            <X className="h-4 w-4 text-talabat-brown/40 hover:text-talabat-brown" />
                        </button>
                    )}
                </div>

                <Popover open={showFilters} onOpenChange={setShowFilters}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="relative">
                            <Filter className="h-4 w-4 mr-2" />
                            Filters
                            {activeFilterCount > 0 && (
                                <Badge className="ml-2 bg-talabat-orange text-white">
                                    {activeFilterCount}
                                </Badge>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 bg-white" align="end">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-talabat-brown">Advanced Filters</h4>
                                {activeFilterCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="text-xs"
                                    >
                                        Clear all
                                    </Button>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-talabat-brown">Status</label>
                                <div className="flex flex-wrap gap-2">
                                    {["NEW", "IN_PROGRESS", "UNDER_REVIEW", "COMPLETED"].map((status) => (
                                        <Badge
                                            key={status}
                                            variant={filters.status?.includes(status) ? "default" : "outline"}
                                            className="cursor-pointer"
                                            onClick={() => {
                                                const current = filters.status || [];
                                                const updated = current.includes(status)
                                                    ? current.filter((s) => s !== status)
                                                    : [...current, status];
                                                const newFilters = { ...filters, status: updated };
                                                setFilters(newFilters);
                                                onFilterChange(newFilters);
                                            }}
                                        >
                                            {status.replace("_", " ")}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-talabat-brown">Priority</label>
                                <div className="flex flex-wrap gap-2">
                                    {["LOW", "MEDIUM", "HIGH", "URGENT"].map((priority) => (
                                        <Badge
                                            key={priority}
                                            variant={filters.priority?.includes(priority) ? "default" : "outline"}
                                            className="cursor-pointer"
                                            onClick={() => {
                                                const current = filters.priority || [];
                                                const updated = current.includes(priority)
                                                    ? current.filter((p) => p !== priority)
                                                    : [...current, priority];
                                                const newFilters = { ...filters, priority: updated };
                                                setFilters(newFilters);
                                                onFilterChange(newFilters);
                                            }}
                                        >
                                            {priority}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-talabat-brown">Assignee</label>
                                <div className="flex flex-wrap gap-2">
                                    {users.map((user) => (
                                        <Badge
                                            key={user.id}
                                            variant={filters.assigneeId?.includes(user.id) ? "default" : "outline"}
                                            className="cursor-pointer"
                                            onClick={() => {
                                                const current = filters.assigneeId || [];
                                                const updated = current.includes(user.id)
                                                    ? current.filter((id) => id !== user.id)
                                                    : [...current, user.id];
                                                const newFilters = { ...filters, assigneeId: updated };
                                                setFilters(newFilters);
                                                onFilterChange(newFilters);
                                            }}
                                        >
                                            {user.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2 flex-wrap">
                <Badge
                    variant={filters.quickFilter === "overdue" ? "default" : "outline"}
                    className="cursor-pointer bg-red-500 hover:bg-red-600 text-white"
                    onClick={() => handleQuickFilter("overdue")}
                >
                    🔥 My Overdue
                </Badge>
                <Badge
                    variant={filters.quickFilter === "thisweek" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleQuickFilter("thisweek")}
                >
                    📅 This Week
                </Badge>
                <Badge
                    variant={filters.quickFilter === "highpriority" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleQuickFilter("highpriority")}
                >
                    ⚡ High Priority
                </Badge>
                <Badge
                    variant={filters.quickFilter === "needsreview" ? "default" : "outline"}
                    className="cursor-pointer bg-talabat-purple hover:bg-purple-700 text-white"
                    onClick={() => handleQuickFilter("needsreview")}
                >
                    👀 Needs Review
                </Badge>
            </div>
        </div>
    );
}
