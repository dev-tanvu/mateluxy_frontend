import {
    LayoutDashboard,
    Building2,
    FileText,
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
    Construction,
    LucideIcon
} from 'lucide-react';

// Icon mapping for serialization/deserialization
// Icons can't be stored in localStorage, so we store keys and resolve them here
export const ICON_MAP: Record<string, LucideIcon> = {
    'LayoutDashboard': LayoutDashboard,
    'Building2': Building2,
    'FileText': FileText,
    'Users': Users,
    'UserCircle': UserCircle,
    'Settings': Settings,
    'Lock': Lock,
    'Bell': Bell,
    'FolderOpen': FolderOpen,
    'Activity': Activity,
    'Briefcase': Briefcase,
    'Layers': Layers,
    'Code2': Code2,
    'Construction': Construction,
};

export function getIcon(key: string): LucideIcon {
    return ICON_MAP[key] || LayoutDashboard;
}
