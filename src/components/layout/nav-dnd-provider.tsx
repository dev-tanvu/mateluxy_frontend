'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
    DndContext,
    DragOverlay,
    DragStartEvent,
    DragEndEvent,
    DragOverEvent,
    useSensor,
    useSensors,
    PointerSensor,
    KeyboardSensor,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useBottomNavStore } from '@/lib/store/bottom-nav-store';
import { getIcon } from '@/lib/utils/icons';

interface DragItem {
    id: string;
    title: string;
    iconKey: string;
    href: string;
    type: 'sidebar-item' | 'pinned-item';
}

interface NavDndContextValue {
    isDragging: boolean;
    isOverDropZone: boolean;
    activeItem: DragItem | null;
}

const NavDndContext = createContext<NavDndContextValue>({
    isDragging: false,
    isOverDropZone: false,
    activeItem: null,
});

export function useNavDnd() {
    return useContext(NavDndContext);
}

interface NavDndProviderProps {
    children: React.ReactNode;
}

export function NavDndProvider({ children }: NavDndProviderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isOverDropZone, setIsOverDropZone] = useState(false);
    const [activeItem, setActiveItem] = useState<DragItem | null>(null);
    const { addItem, hasItem, reorderItems, pinnedItems } = useBottomNavStore();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = useCallback((event: DragStartEvent) => {
        const { active } = event;
        const data = active.data.current as DragItem | undefined;

        if (data) {
            setActiveItem(data);
            setIsDragging(true);
        }
    }, []);

    const handleDragOver = useCallback((event: DragOverEvent) => {
        const { over } = event;
        setIsOverDropZone(over?.id === 'bottom-nav-drop-zone');
    }, []);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;

        if (over && activeItem) {
            // Dropping sidebar item onto bottom nav drop zone
            if (over.id === 'bottom-nav-drop-zone' && activeItem.type === 'sidebar-item') {
                if (!hasItem(activeItem.href)) {
                    addItem({
                        title: activeItem.title,
                        href: activeItem.href,
                        iconKey: activeItem.iconKey,
                    });
                }
            }

            // Reordering within bottom nav
            if (activeItem.type === 'pinned-item' && typeof over.id === 'string') {
                const oldIndex = pinnedItems.findIndex((item) => item.href === active.id);
                const newIndex = pinnedItems.findIndex((item) => item.href === over.id);
                if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                    reorderItems(oldIndex, newIndex);
                }
            }
        }

        setActiveItem(null);
        setIsDragging(false);
        setIsOverDropZone(false);
    }, [activeItem, addItem, hasItem, pinnedItems, reorderItems]);

    const handleDragCancel = useCallback(() => {
        setActiveItem(null);
        setIsDragging(false);
        setIsOverDropZone(false);
    }, []);

    return (
        <NavDndContext.Provider value={{ isDragging, isOverDropZone, activeItem }}>
            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                {children}

                {/* Drag overlay showing the dragged item */}
                <DragOverlay dropAnimation={null}>
                    {activeItem && (
                        <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-2xl border border-gray-200">
                            {(() => {
                                const Icon = getIcon(activeItem.iconKey);
                                return <Icon className="h-5 w-5 text-[#0aa5ff]" />;
                            })()}
                            <span className="text-sm font-medium text-gray-700">{activeItem.title}</span>
                        </div>
                    )}
                </DragOverlay>
            </DndContext>
        </NavDndContext.Provider>
    );
}
