'use client';

import React, { useEffect } from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { BottomNav } from './bottom-nav';
import { NavDndProvider } from './nav-dnd-provider';
import { useMe } from '@/lib/hooks/use-auth';
import { useAuthStore } from '@/lib/store/auth-store';
import { usePathname, useRouter } from 'next/navigation';
import { MENU_ITEMS } from '@/lib/config/menu';
import { toast } from 'sonner';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const [isNavVisible, setIsNavVisible] = React.useState(true);
    const [lastScrollY, setLastScrollY] = React.useState(0);
    const { data: user } = useMe();
    const setUser = useAuthStore((state) => state.setUser);
    const storedUser = useAuthStore((state) => state.user);
    const pathname = usePathname();
    const router = useRouter();

    // Sync auth state
    useEffect(() => {
        if (user && !storedUser) {
            setUser(user);
        } else if (user && storedUser && user.id !== storedUser.id) {
            // Update if user changed (e.g. role updated)
            setUser(user);
        } else if (user && storedUser && JSON.stringify(user.permissions) !== JSON.stringify(storedUser.permissions)) {
            // Update if permissions changed
            setUser(user);
        }
    }, [user, storedUser, setUser]);

    // Route Protection
    useEffect(() => {
        if (!storedUser || storedUser.role === 'ADMIN') return;

        // Check if current path corresponds to a protected menu item
        const checkPermission = () => {
            // Find matching menu item. We check both main items and subitems.
            let requiredPermission: string | undefined;

            for (const item of MENU_ITEMS) {
                // Check submenu items first if they exist
                if (item.submenu) {
                    for (const sub of item.submenu) {
                        if (pathname === sub.href || pathname.startsWith(sub.href + '/')) {
                            requiredPermission = item.permission;
                            break;
                        }
                    }
                }

                // If checking main item href matches or starts with (e.g. /agents matches /agents/new)
                // Use strict check or startswith depending on logic.
                // Usually sidebar main href is like /properties which is a page or a redirect.
                if (!requiredPermission && (pathname === item.href || pathname.startsWith(item.href + '/'))) {
                    requiredPermission = item.permission;
                }

                if (requiredPermission) break;
            }

            // Also check specific cases that might not be in menu or are dynamic
            // But for sidebar hiding prevention, we mostly care about what's in the menu.

            if (requiredPermission) {
                const hasPermission = storedUser.permissions?.includes(requiredPermission);
                if (!hasPermission) {
                    toast.error("You don't have permission to access this page.");

                    // Find first accessible route
                    let fallbackRoute = '/dashboard'; // Default

                    for (const item of MENU_ITEMS) {
                        // Check if user has permission for this item
                        if (!item.permission || storedUser.permissions?.includes(item.permission)) {
                            // If allowed, use this as fallback
                            // If it has submenu, go to first submenu item
                            if (item.submenu && item.submenu.length > 0) {
                                fallbackRoute = item.submenu[0].href;
                            } else {
                                fallbackRoute = item.href;
                            }
                            break; // Found the first one
                        }
                    }

                    // If the user has NO permissions at all and fallback is still dashboard (which they might not have),
                    // we might need a distinct error page. But assuming they have at least one.
                    // If they don't have dashboard access, the loop above should have found the next best thing.
                    // If the loop didn't find ANYTHING (empty permissions?), fallbackRoute remains '/dashboard',
                    // which will loop if we don't handle it.
                    // Safety check: if fallback is same as current path, redirect to login or show error?
                    // But current path is definitely rejected here.

                    router.push(fallbackRoute);
                }
            }
        };

        checkPermission();
    }, [pathname, storedUser, router]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const currentScrollY = e.currentTarget.scrollTop;

        // User Request: Scrolling DOWN -> Hidden, Scrolling UP -> Visible
        if (currentScrollY > lastScrollY) {
            // Scrolling Down (scrollTop increasing) -> Hidden
            setIsNavVisible(false);
        } else if (currentScrollY < lastScrollY) {
            // Scrolling Up (scrollTop decreasing) -> Visible
            setIsNavVisible(true);
        }

        setLastScrollY(currentScrollY);
    };

    return (
        <NavDndProvider>
            <div className="flex h-screen w-full flex-col overflow-hidden bg-gradient-to-r from-white to-[#F3FAFF]">
                {/* Topbar - Full Width */}
                <Topbar />

                {/* Content Area - Sidebar + Main */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <Sidebar />

                    {/* Main Content Area */}
                    <main className="relative flex flex-1 flex-col overflow-hidden rounded-3xl bg-[#F0F0F042] p-4">
                        <div className="flex flex-1 flex-col overflow-hidden rounded-3xl bg-[#ffffff]">
                            <div
                                className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                                onScroll={handleScroll}
                            >
                                {children}
                            </div>
                        </div>

                        {/* Bottom Navigation */}
                        <BottomNav isVisible={isNavVisible} />
                    </main>
                </div>
            </div>
        </NavDndProvider>
    );
}

