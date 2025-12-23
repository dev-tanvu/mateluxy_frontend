import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Types for pinned items (icon stored as string key to be resolved at runtime)
export interface PinnedNavItem {
    title: string;
    href: string;
    iconKey: string; // Key to look up icon from ICON_MAP
}

interface BottomNavState {
    pinnedItems: PinnedNavItem[];
    addItem: (item: PinnedNavItem) => void;
    removeItem: (href: string) => void;
    reorderItems: (fromIndex: number, toIndex: number) => void;
    hasItem: (href: string) => boolean;
    clearAll: () => void;
}

export const useBottomNavStore = create<BottomNavState>()(
    persist(
        (set, get) => ({
            pinnedItems: [],

            addItem: (item) => {
                const { pinnedItems } = get();
                // Don't add duplicates
                if (pinnedItems.some((p) => p.href === item.href)) return;
                // Limit to 6 items
                if (pinnedItems.length >= 6) return;
                set({ pinnedItems: [...pinnedItems, item] });
            },

            removeItem: (href) => {
                set((state) => ({
                    pinnedItems: state.pinnedItems.filter((item) => item.href !== href),
                }));
            },

            reorderItems: (fromIndex, toIndex) => {
                set((state) => {
                    const items = [...state.pinnedItems];
                    const [removed] = items.splice(fromIndex, 1);
                    items.splice(toIndex, 0, removed);
                    return { pinnedItems: items };
                });
            },

            hasItem: (href) => {
                return get().pinnedItems.some((item) => item.href === href);
            },

            clearAll: () => {
                set({ pinnedItems: [] });
            },
        }),
        {
            name: 'crm-bottom-nav-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
