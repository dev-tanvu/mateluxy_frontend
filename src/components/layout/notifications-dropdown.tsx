'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Check, Info, AlertTriangle, XCircle, CheckCircle2, X, Filter, Calendar, ArrowRight } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markNotificationsRead } from '@/services/integration.service';
import { formatDistanceToNow, format, isToday, isYesterday, isThisWeek, isThisMonth, parseISO, startOfDay, endOfDay, isWithinInterval } from 'date-fns';

// Sidebar Panel Component
function NotificationsSidebar({
    isOpen,
    onClose,
    notifications,
    getIcon
}: {
    isOpen: boolean;
    onClose: () => void;
    notifications: any[];
    getIcon: (type: string) => React.ReactNode;
}) {
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom'>('all');
    const [customDates, setCustomDates] = useState<{ start: string; end: string }>({ start: '', end: '' });

    const filteredNotifications = useMemo(() => {
        return notifications.filter(notification => {
            // Date filter
            const notificationDate = new Date(notification.createdAt);
            let matchesDate = true;

            switch (dateFilter) {
                case 'today':
                    matchesDate = isToday(notificationDate);
                    break;
                case 'yesterday':
                    matchesDate = isYesterday(notificationDate);
                    break;
                case 'week':
                    matchesDate = isThisWeek(notificationDate);
                    break;
                case 'month':
                    matchesDate = isThisMonth(notificationDate);
                    break;
                case 'custom':
                    if (customDates.start && customDates.end) {
                        matchesDate = isWithinInterval(notificationDate, {
                            start: startOfDay(parseISO(customDates.start)),
                            end: endOfDay(parseISO(customDates.end))
                        });
                    } else if (customDates.start) {
                        matchesDate = notificationDate >= startOfDay(parseISO(customDates.start));
                    } else if (customDates.end) {
                        matchesDate = notificationDate <= endOfDay(parseISO(customDates.end));
                    }
                    break;
                default:
                    matchesDate = true;
            }

            return matchesDate;
        });
    }, [notifications, dateFilter, customDates]);

    // Group notifications by date
    const groupedNotifications = useMemo(() => {
        const groups: { [key: string]: any[] } = {};

        filteredNotifications.forEach(notification => {
            const date = new Date(notification.createdAt);
            let groupKey: string;

            if (isToday(date)) {
                groupKey = 'Today';
            } else if (isYesterday(date)) {
                groupKey = 'Yesterday';
            } else if (isThisWeek(date)) {
                groupKey = 'This Week';
            } else if (isThisMonth(date)) {
                groupKey = 'This Month';
            } else {
                groupKey = format(date, 'MMMM yyyy');
            }

            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(notification);
        });

        return groups;
    }, [filteredNotifications]);

    if (!isOpen) return null;

    // Use portal to render sidebar at document body level
    const sidebarContent = (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/20 z-[9998] transition-opacity"
                onClick={onClose}
            />

            {/* Sidebar Panel */}
            <div className="fixed top-0 right-0 h-full w-[30%] min-w-[400px] bg-white shadow-2xl z-[9999] flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">All Notifications</h2>
                        <p className="text-sm text-gray-500 mt-1">{notifications.length} total notifications</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Filters */}
                <div className="p-4 border-b border-gray-100 space-y-4">
                    {/* Date Filter Tabs */}
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-2 flex-wrap">
                            {[
                                { key: 'all', label: 'All' },
                                { key: 'today', label: 'Today' },
                                { key: 'yesterday', label: 'Yesterday' },
                                { key: 'week', label: 'This Week' },
                                { key: 'month', label: 'This Month' },
                                { key: 'custom', label: 'Custom Date' },
                            ].map((filter) => (
                                <button
                                    key={filter.key}
                                    onClick={() => setDateFilter(filter.key as any)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${dateFilter === filter.key
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>

                        {/* Custom Date Inputs */}
                        {dateFilter === 'custom' && (
                            <div className="flex gap-3 bg-gray-50 p-3 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 mb-1.5 block font-medium">From</label>
                                    <input
                                        type="date"
                                        value={customDates.start}
                                        onChange={(e) => setCustomDates(prev => ({ ...prev, start: e.target.value }))}
                                        className="w-full text-sm px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-gray-700 font-sans"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 mb-1.5 block font-medium">To</label>
                                    <input
                                        type="date"
                                        value={customDates.end}
                                        onChange={(e) => setCustomDates(prev => ({ ...prev, end: e.target.value }))}
                                        className="w-full text-sm px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-gray-700 font-sans"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Notifications List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Bell className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications found</h3>
                            <p className="text-gray-500 text-sm">Try adjusting your filters</p>
                        </div>
                    ) : (
                        Object.entries(groupedNotifications).map(([group, items]) => (
                            <div key={group}>
                                <div className="px-6 py-3 bg-gray-50 sticky top-0">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{group}</span>
                                </div>
                                {items.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50 ${!notification.isRead ? 'bg-blue-50/30' : ''}`}
                                    >
                                        <div className="flex gap-4 items-start">
                                            <div className="mt-0.5 shrink-0 bg-white p-2 rounded-full shadow-sm border border-gray-100">
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 space-y-1.5">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {notification.title}
                                                </p>
                                                <p className="text-sm text-gray-500 leading-relaxed">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center gap-2 pt-1">
                                                    <Calendar className="h-3 w-3 text-gray-400" />
                                                    <p className="text-xs text-gray-400">
                                                        {format(new Date(notification.createdAt), 'MMM d, yyyy • h:mm a')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );

    // Render to body using portal to escape any stacking context
    if (typeof document !== 'undefined') {
        return createPortal(sidebarContent, document.body);
    }
    return null;
}

export function NotificationsDropdown() {
    const queryClient = useQueryClient();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Poll every 30 seconds to catch the 15-min warning and start/end events
    const { data: notifications = [] } = useQuery({
        queryKey: ['notifications'],
        queryFn: getNotifications,
        refetchInterval: 30000,
    });

    const markReadMutation = useMutation({
        mutationFn: markNotificationsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Only show first 3 notifications in dropdown
    const previewNotifications = notifications.slice(0, 3);

    const handleOpenChange = (open: boolean) => {
        setIsDropdownOpen(open);
        if (open && unreadCount > 0) {
            markReadMutation.mutate();
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'WARNING': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
            case 'SUCCESS': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'ERROR': return <XCircle className="h-4 w-4 text-red-500" />;
            default: return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

    const handleViewAll = () => {
        setIsDropdownOpen(false); // Close the dropdown first
        setIsSidebarOpen(true);
    };

    return (
        <>
            <DropdownMenu open={isDropdownOpen} onOpenChange={handleOpenChange}>
                <DropdownMenuTrigger asChild>
                    <button className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 outline-none transition-colors">
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
                        )}
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[380px] p-0 rounded-xl shadow-lg border border-gray-100">
                    <DropdownMenuLabel className="p-4 flex items-center justify-between bg-gray-50/50 border-b border-gray-100">
                        <span className="font-semibold text-gray-900">Notifications</span>
                        {unreadCount > 0 && (
                            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                {unreadCount} New
                            </span>
                        )}
                    </DropdownMenuLabel>

                    <div className="py-2">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                No notifications yet
                            </div>
                        ) : (
                            <>
                                {previewNotifications.map((notification) => (
                                    <div key={notification.id} className={`px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${!notification.isRead ? 'bg-blue-50/30' : ''}`}>
                                        <div className="flex gap-3 items-start">
                                            <div className="mt-0.5 shrink-0 bg-white p-1.5 rounded-full shadow-sm border border-gray-100">
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <p className="text-sm font-medium text-gray-900 leading-none">
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-medium pt-1">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* View All Button */}
                                {notifications.length > 3 && (
                                    <div className="p-3 border-t border-gray-100">
                                        <button
                                            onClick={handleViewAll}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium text-sm rounded-lg transition-colors"
                                        >
                                            View All Notifications
                                            <ArrowRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications Sidebar */}
            <NotificationsSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                notifications={notifications}
                getIcon={getIcon}
            />
        </>
    );
}
