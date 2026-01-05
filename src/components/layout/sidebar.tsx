'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    useDndMonitor,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDraggable } from '@dnd-kit/core';
import { useAuthStore } from '@/lib/store/auth-store';
import { useMe, useUpdateMenuOrder } from '@/lib/hooks/use-auth';
import {
    ChevronDown,
    Construction,
    GripVertical
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MENU_ITEMS, MenuItem, UNDER_DEVELOPMENT_ITEMS } from '@/lib/config/menu';

// Sortable wrapper for sidebar menu items (reordering within sidebar)
function SortableMenuItem({
    item,
    children,
    id
}: {
    item: MenuItem;
    children: React.ReactNode;
    id: string;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id,
        data: {
            id: item.href,
            title: item.title,
            iconKey: item.iconKey,
            href: item.href,
            type: 'sidebar-sortable',
            submenu: item.submenu,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "relative group/drag",
                isDragging && "opacity-50 z-50"
            )}
        >
            {/* Drag handle */}
            <div
                {...attributes}
                {...listeners}
                className="absolute left-0 top-3 -translate-x-2 opacity-0 group-hover/drag:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100"
                title="Drag to reorder"
            >
                <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
            {children}
        </div>
    );
}

// Draggable wrapper for sidebar menu items (to bottom nav)
function DraggableMenuItem({ item, children }: { item: MenuItem; children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `sidebar-${item.href}`,
        data: {
            id: item.href,
            title: item.title,
            iconKey: item.iconKey,
            href: item.href,
            type: 'sidebar-item',
            submenu: item.submenu,
        },
    });

    // Prevent hydration mismatch by only applying drag attributes after mount
    React.useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div
            ref={mounted ? setNodeRef : undefined}
            className={cn(
                "relative group/drag",
                isDragging && "opacity-50"
            )}
        >
            {/* Drag handle - only render with attributes after hydration */}
            {mounted && (
                <div
                    {...attributes}
                    {...listeners}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 opacity-0 group-hover/drag:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100"
                    title="Drag to bottom nav"
                >
                    <GripVertical className="h-4 w-4 text-gray-400" />
                </div>
            )}
            {children}
        </div>
    );
}

export function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuthStore();
    const { data: userData } = useMe();
    const { mutate: updateMenuOrder } = useUpdateMenuOrder();

    // No menu expanded by default
    const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
    const [showUnderDevDialog, setShowUnderDevDialog] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState<string>('');
    const [localMenuOrder, setLocalMenuOrder] = useState<string[]>([]);
    const [mounted, setMounted] = useState(false);

    // Sensors for drag-to-reorder


    // Initialize local menu order from user data or default
    useEffect(() => {
        setMounted(true);
        if (userData?.sidebarMenuOrder && userData.sidebarMenuOrder.length > 0) {
            setLocalMenuOrder(userData.sidebarMenuOrder);
        }
    }, [userData]);

    // Accordion behavior: only one menu can be expanded at a time
    const toggleMenu = (title: string) => {
        setExpandedMenu((prev) => prev === title ? null : title);
    };

    const handleUnderDevClick = (title: string) => {
        setExpandedMenu(null);
        setSelectedFeature(title);
        setShowUnderDevDialog(true);
    };

    // Filter menu items based on user permissions
    const filteredMenuItems = useMemo(() => {
        if (!user) return [];
        // Admin gets everything
        if (user.role === 'ADMIN') return MENU_ITEMS;

        // Moderator gets based on permissions
        if (user.role === 'MODERATOR') {
            return MENU_ITEMS.filter(item => {
                if (!item.permission) return true;
                return user.permissions?.includes(item.permission);
            });
        }

        return [];
    }, [user]);

    // Sort menu items based on saved order
    const sortedMenuItems = useMemo(() => {
        if (localMenuOrder.length === 0) return filteredMenuItems;

        const orderMap = new Map(localMenuOrder.map((href, i) => [href, i]));
        return [...filteredMenuItems].sort((a, b) => {
            const aIndex = orderMap.has(a.href) ? orderMap.get(a.href)! : 999;
            const bIndex = orderMap.has(b.href) ? orderMap.get(b.href)! : 999;
            return aIndex - bIndex;
        });
    }, [filteredMenuItems, localMenuOrder]);

    // Handle drag-to-reorder
    useDndMonitor({
        onDragEnd(event) {
            const { active, over } = event;

            if (!over || active.id === over.id) return;

            const oldIndex = sortedMenuItems.findIndex(item => item.href === active.id);
            const newIndex = sortedMenuItems.findIndex(item => item.href === over.id);

            // If indexes are not found, it means the drag/drop presumably happened elsewhere (e.g. to bottom nav)
            // or involved items not in this list.
            if (oldIndex === -1 || newIndex === -1) return;

            // Create new order
            const newItems = [...sortedMenuItems];
            const [removed] = newItems.splice(oldIndex, 1);
            newItems.splice(newIndex, 0, removed);

            const newOrder = newItems.map(item => item.href);

            // Update local state immediately (optimistic)
            setLocalMenuOrder(newOrder);

            // Save to backend (auto-save)
            updateMenuOrder(newOrder);
        }
    });

    return (
        <>
            <div className="font-outfit backdrop-blur-[30px] relative flex h-full w-72 flex-col bg-[#FFFFFF8A] overflow-hidden">
                {/* Background Effects */}
                <div
                    className="absolute pointer-events-none rounded-full mix-blend-multiply filter blur-[300px] opacity-100"
                    style={{
                        width: '150px',
                        height: '150px',
                        backgroundColor: '#FF9829',
                        top: '150px',
                        left: '-100px',
                        zIndex: 0
                    }}
                />
                <div
                    className="absolute pointer-events-none rounded-full mix-blend-multiply filter blur-[200px] opacity-58"
                    style={{
                        width: '197px',
                        height: '239px',
                        backgroundColor: '#70CBFF',
                        top: '500px',
                        left: '-50px',
                        zIndex: 0
                    }}
                />

                {/* Menu */}
                <div className="relative z-10 flex-1 overflow-y-auto px-4 pt-6 pb-20 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {mounted && (

                        <SortableContext
                            items={sortedMenuItems.map(item => item.href)}
                            strategy={verticalListSortingStrategy}
                        >
                            <nav className="space-y-1">
                                {sortedMenuItems.map((item) => {
                                    const isParentActive = item.submenu?.some(sub => pathname === sub.href);
                                    const isDirectActive = pathname === item.href;
                                    const isExpanded = expandedMenu === item.title;
                                    const isUnderDev = UNDER_DEVELOPMENT_ITEMS.includes(item.title);

                                    if (item.submenu) {
                                        return (
                                            <SortableMenuItem key={item.title} item={item} id={item.href}>
                                                <div>
                                                    <div
                                                        onClick={() => toggleMenu(item.title)}
                                                        className={cn(
                                                            "group flex w-full items-center justify-between rounded-xl px-3 py-3 text-[15px] font-medium transition-all cursor-pointer",
                                                            isParentActive
                                                                ? "bg-[#00AAFF] text-white shadow-sm"
                                                                : "text-[#727C90] hover:bg-gray-50"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <item.icon className={cn("h-5 w-5", isParentActive ? "text-white" : "text-[#727C90]")} />
                                                            <span>{item.title}</span>
                                                        </div>
                                                        <div
                                                            className="p-1 hover:bg-white/10 rounded-full transition-colors"
                                                        >
                                                            <ChevronDown
                                                                className={cn(
                                                                    "h-4 w-4 transition-transform duration-200",
                                                                    isParentActive ? "text-white" : "text-[#727C90]",
                                                                    isExpanded ? "rotate-180" : ""
                                                                )}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Submenu with hierarchy lines */}
                                                    {isExpanded && (
                                                        <div className="ml-6 mt-1 relative">
                                                            {/* Vertical hierarchy line */}
                                                            <div className="absolute left-0 top-0 bottom-2 w-px bg-[#E4E9EE]" />

                                                            <div className="space-y-0">
                                                                {item.submenu.map((sub, index) => {
                                                                    const isSubActive = pathname === sub.href;
                                                                    return (
                                                                        <div key={sub.title} className="relative">
                                                                            {/* Horizontal branch line */}
                                                                            <div className="absolute left-0 top-1/2 w-3 h-px bg-[#E4E9EE]" />

                                                                            {sub.underDevelopment ? (
                                                                                <button
                                                                                    onClick={() => handleUnderDevClick(sub.title)}
                                                                                    className="block pl-5 py-2 text-[14px] font-medium transition-colors w-full text-left text-[#727C90] hover:bg-gray-50/50"
                                                                                >
                                                                                    {sub.title}
                                                                                </button>
                                                                            ) : (
                                                                                <Link
                                                                                    href={sub.href}
                                                                                    className={cn(
                                                                                        "block pl-5 py-2 text-[14px] font-medium transition-colors",
                                                                                        isSubActive
                                                                                            ? "text-[#00AAFF]"
                                                                                            : "text-[#727C90] hover:bg-gray-50/50"
                                                                                    )}
                                                                                >
                                                                                    {sub.title}
                                                                                </Link>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </SortableMenuItem>
                                        );
                                    }

                                    // Handle under development items
                                    if (isUnderDev) {
                                        return (
                                            <SortableMenuItem key={item.title} item={item} id={item.href}>
                                                <button
                                                    onClick={() => handleUnderDevClick(item.title)}
                                                    className={cn(
                                                        "group flex w-full items-center justify-between rounded-xl px-3 py-3 text-[15px] font-medium transition-all",
                                                        "text-[#727C90] hover:bg-gray-50"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <item.icon className="h-5 w-5 text-[#727C90]" />
                                                        <span>{item.title}</span>
                                                    </div>
                                                </button>
                                            </SortableMenuItem>
                                        );
                                    }

                                    return (
                                        <SortableMenuItem key={item.title} item={item} id={item.href}>
                                            <Link
                                                href={item.href}
                                                onClick={() => setExpandedMenu(null)}
                                                className={cn(
                                                    "group flex w-full items-center justify-between rounded-xl px-3 py-3 text-[15px] font-medium transition-all",
                                                    isDirectActive
                                                        ? "bg-[#00AAFF] text-white shadow-sm"
                                                        : "text-[#727C90] hover:bg-gray-50"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <item.icon className={cn("h-5 w-5", isDirectActive ? "text-white" : "text-[#727C90]")} />
                                                    <span>{item.title}</span>
                                                </div>
                                            </Link>
                                        </SortableMenuItem>
                                    );
                                })}
                            </nav>
                        </SortableContext>

                    )}
                </div>
            </div>

            {/* Under Development Dialog */}
            <Dialog open={showUnderDevDialog} onOpenChange={setShowUnderDevDialog}>
                <DialogContent className="sm:max-w-[400px] rounded-[24px] p-8 text-center">
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
                            <Construction className="w-10 h-10 text-amber-500" />
                        </div>
                        <DialogHeader className="space-y-3">
                            <DialogTitle className="text-xl font-semibold text-gray-900">
                                Under Development
                            </DialogTitle>
                            <DialogDescription className="text-gray-500 text-[15px] leading-relaxed">
                                <span className="font-medium text-gray-700">{selectedFeature}</span> is currently under development and will be available soon. We're working hard to bring you this feature!
                            </DialogDescription>
                        </DialogHeader>
                        <Button
                            onClick={() => setShowUnderDevDialog(false)}
                            className="mt-6 bg-[#00AAFF] hover:bg-[#0099DD] text-white px-8 h-11 rounded-xl font-medium"
                        >
                            Got it
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
