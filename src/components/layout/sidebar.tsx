'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useDraggable } from '@dnd-kit/core';
import { useAuthStore } from '@/lib/store/auth-store';
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

// Draggable wrapper for sidebar menu items
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
    // No menu expanded by default
    const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
    const [showUnderDevDialog, setShowUnderDevDialog] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState<string>('');

    // Accordion behavior: only one menu can be expanded at a time
    const toggleMenu = (title: string) => {
        setExpandedMenu((prev) => prev === title ? null : title);
    };

    const handleUnderDevClick = (title: string) => {
        setExpandedMenu(null);
        setSelectedFeature(title);
        setShowUnderDevDialog(true);
    };

    const filteredMenuItems = useMemo(() => {
        if (!user) return [];
        // Admin gets everything
        if (user.role === 'ADMIN') return MENU_ITEMS;

        // Moderator gets based on permissions
        if (user.role === 'MODERATOR') {
            return MENU_ITEMS.filter(item => {
                if (!item.permission) return true; // Show items without permission requirement? Or hide? Assuming show for public stuff, but these are all protected.
                // If item has a permission, user must have it
                return user.permissions?.includes(item.permission);
            });
        }

        return [];
    }, [user]);

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
                    <nav className="space-y-1">
                        {filteredMenuItems.map((item) => {
                            const isParentActive = item.submenu?.some(sub => pathname === sub.href);
                            const isDirectActive = pathname === item.href;
                            const isExpanded = expandedMenu === item.title;
                            const isUnderDev = UNDER_DEVELOPMENT_ITEMS.includes(item.title);

                            if (item.submenu) {
                                return (
                                    <div key={item.title}>
                                        <Link
                                            href={item.submenu[0]?.href || '#'}
                                            onClick={() => {
                                                if (expandedMenu !== item.title) {
                                                    setExpandedMenu(item.title);
                                                }
                                            }}
                                            className={cn(
                                                "group flex w-full items-center justify-between rounded-xl px-3 py-3 text-[15px] font-medium transition-all",
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
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    toggleMenu(item.title);
                                                }}
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
                                        </Link>

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
                                );
                            }

                            // Handle under development items
                            if (isUnderDev) {
                                return (
                                    <button
                                        key={item.title}
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
                                );
                            }

                            return (
                                <DraggableMenuItem key={item.title} item={item}>
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
                                </DraggableMenuItem>
                            );
                        })}
                    </nav>
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
