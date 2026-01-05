import React from 'react';
import {
    LayoutDashboard,
    Building2,
    Users,
    UserCircle,
    Settings,
    Lock,
    Bell,
    FolderOpen,
    Activity,
    Briefcase,
    Layers,
    Code2,
} from 'lucide-react';

export interface MenuItem {
    title: string;
    icon: React.ElementType;
    iconKey: string; // Key for icon lookup from ICON_MAP (for serialization)
    href: string;
    submenu?: { title: string; href: string; underDevelopment?: boolean }[];
    underDevelopment?: boolean;
    permission?: string;
}

// Items that are under development
export const UNDER_DEVELOPMENT_ITEMS = [
    'Agent App Notifications'
];

export const MENU_ITEMS: MenuItem[] = [
    { title: 'Dashboard', icon: LayoutDashboard, iconKey: 'LayoutDashboard', href: '/dashboard', permission: 'Dashboard' },
    {
        title: 'Properties',
        icon: Building2,
        iconKey: 'Building2',
        href: '/properties',
        permission: 'Property',
        submenu: [
            { title: 'Active Properties', href: '/properties/active-properties' },
            { title: 'Add New Property', href: '/properties/new' },
            { title: 'Saved Drafts', href: '/properties/saved-drafts' },
            { title: 'From Agents', href: '/properties/agents', underDevelopment: true },
            { title: 'Unpublished', href: '/properties/unpublished' },
            { title: 'Rejected Properties', href: '/properties/rejected' },
            { title: 'Sold Properties', href: '/properties/sold' },
            { title: 'Rented Properties', href: '/properties/rented' },
        ],
    },
    {
        title: 'Off Plan',
        icon: Layers,
        iconKey: 'Layers',
        href: '/off-plan',
        permission: 'Off Plan',
        submenu: [
            { title: 'Add New Property', href: '/off-plan/new' },
            { title: 'All Properties', href: '/off-plan' },
            { title: 'Draft Properties', href: '/off-plan/draft' },
            { title: 'From Agents', href: '/off-plan/agents', underDevelopment: true },
            { title: 'Unpublished', href: '/off-plan/unpublished' },
        ],
    },
    {
        title: 'Leads',
        icon: Users,
        iconKey: 'Users',
        href: '/leads',
        permission: 'Leads',
        submenu: [
            { title: 'Leads Dashboard', href: '/leads/3rd-party' },
            { title: 'Add Lead', href: '/leads/new' },
            { title: 'Website Leads', href: '/leads/website', underDevelopment: true },
            { title: 'Property Finder', href: '/leads/property-finder' },
        ],
    },
    { title: 'Agents', icon: UserCircle, iconKey: 'UserCircle', href: '/agents', permission: 'Agents' },
    { title: 'Developers', icon: Briefcase, iconKey: 'Briefcase', href: '/developers', permission: 'Developers' },
    { title: 'Integration', icon: Code2, iconKey: 'Code2', href: '/integration', permission: 'Integrations' },
    { title: 'Activity Logs', icon: Activity, iconKey: 'Activity', href: '/activity-logs', permission: 'Activity Log' },
    { title: 'File Manager', icon: FolderOpen, iconKey: 'FolderOpen', href: '/file-manager', permission: 'File Manager' },
    { title: 'Agent App Notifications', icon: Bell, iconKey: 'Bell', href: '/notifications', underDevelopment: true, permission: 'App Notifications' },
    { title: 'Admin & Editors', icon: Lock, iconKey: 'Lock', href: '/users', permission: 'Users' },
    { title: 'System Settings', icon: Settings, iconKey: 'Settings', href: '/settings', permission: 'Settings' },
    { title: 'Password Manager', icon: Lock, iconKey: 'Lock', href: '/passwords', permission: 'Password Manager' },
];

