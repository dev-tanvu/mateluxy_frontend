'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Plus, Bell, ChevronDown, Wrench, LogOut, Construction } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMe, useLogout } from '@/lib/hooks/use-auth';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { NotificationsDropdown } from './notifications-dropdown';

export function Topbar() {
    const { data: user } = useMe();
    const { mutate: logout } = useLogout();
    const [avatarError, setAvatarError] = useState(false);

    // Under Development State
    const [showUnderDevDialog, setShowUnderDevDialog] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState<string>('');
    const [isRapidToolsOpen, setIsRapidToolsOpen] = useState(false);

    const handleUnderDevClick = (title: string, e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        setIsRapidToolsOpen(false);
        setSelectedFeature(title);
        setShowUnderDevDialog(true);
    };

    return (
        <header className="font-outfit flex h-20 items-center justify-between bg-white/50 backdrop-blur-sm px-8 w-full border-b border-gray-100/50">
            {/* Logo */}
            <div className="flex items-center gap-3">
                <img
                    src="/Logo.png"
                    alt="Mateluxy Logo"
                    className="h-14 w-auto"
                />
            </div>

            {/* Spacer since search is removed */}
            <div className="flex-1"></div>

            {/* Actions */}
            <div className="flex items-center gap-4">
                {/* Add New Property Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild id="add-property-trigger">
                        <Button className="h-10 rounded-lg bg-[#00B7FF14] py-6 px-16 text-[#00B7FF] hover:bg-[#00B7FF24] hover:text-[#00B7FF] shadow-none border-0">
                            <Plus className="h-4 w-4" />
                            Add new property
                            <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem asChild className="cursor-pointer py-3">
                            <Link href="/properties/new" className="text-[15px] font-medium">
                                New Property
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer py-3">
                            <Link href="/off-plan/new" className="text-[15px] font-medium">
                                New Off Plan Property
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Rapid Tools Dropdown */}
                <DropdownMenu open={isRapidToolsOpen} onOpenChange={setIsRapidToolsOpen}>
                    <DropdownMenuTrigger asChild id="rapid-tools-trigger">
                        <Button variant="outline" className="h-10 gap-2 rounded-lg py-6 px-16 border-gray-200 text-gray-600 hover:bg-gray-50">
                            <Wrench className="h-4 w-4 text-blue-500" />
                            Rapid Tools
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[280px] p-5 rounded-xl shadow-lg border border-gray-100">
                        {/* Tools Section */}
                        <p className="text-[15px] font-normal text-[#222F3E] mb-4">Tools</p>
                        <div className="grid grid-cols-4 gap-1 mb-5">
                            <button
                                onClick={() => handleUnderDevClick('Watermark Tool')}
                                className="flex flex-col items-center gap-2 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <img src="/svg/watermark_icon.svg" alt="Watermark" className="h-6 w-6" />
                                <span className="text-[10px] text-[#8E99A4]">Watermark</span>
                            </button>
                            <button
                                onClick={() => handleUnderDevClick('Password Tool')}
                                className="flex flex-col items-center gap-2 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <img src="/svg/password_icon.svg" alt="Password" className="h-6 w-6" />
                                <span className="text-[10px] text-[#8E99A4]">Password</span>
                            </button>
                            <button
                                onClick={() => handleUnderDevClick('Settings')}
                                className="flex flex-col items-center gap-2 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <img src="/svg/settings_icon.svg" alt="Settings" className="h-6 w-6" />
                                <span className="text-[10px] text-[#8E99A4]">Settings</span>
                            </button>
                            <button
                                onClick={() => handleUnderDevClick('Form Builder')}
                                className="flex flex-col items-center gap-2 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <img src="/svg/form_icon.svg" alt="Form" className="h-6 w-6" />
                                <span className="text-[10px] text-[#8E99A4]">Form</span>
                            </button>
                        </div>

                        <div className="h-px bg-gray-200 mb-4" />

                        {/* Rapid Actions Section */}
                        <p className="text-[15px] font-semibold text-[#222F3E] mb-3">Rapid Actions</p>

                        <div className="space-y-0.5">
                            <Link
                                href="/agents?action=add"
                                onClick={() => setIsRapidToolsOpen(false)}
                                className="flex items-center gap-3 py-2 px-1 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                <img src="/svg/add_new_agent_icn.svg" alt="" className="h-4 w-4 opacity-70" />
                                <span className="text-[13px] text-[#222F3E]">Add new agent</span>
                            </Link>

                            <button
                                onClick={() => handleUnderDevClick('Tenancy Contract')}
                                className="w-full flex items-center gap-3 py-2 px-1 rounded-md hover:bg-gray-50 transition-colors text-left"
                            >
                                <img src="/svg/create_tenancy_icon.svg" alt="" className="h-4 w-4 opacity-70" />
                                <span className="text-[13px] text-[#222F3E]">Create tenancy contract</span>
                            </button>

                            <button
                                onClick={() => handleUnderDevClick('NOC Generator')}
                                className="w-full flex items-center gap-3 py-2 px-1 rounded-md hover:bg-gray-50 transition-colors text-left"
                            >
                                <img src="/svg/create_noc_icon.svg" alt="" className="h-4 w-4 opacity-70" />
                                <span className="text-[13px] text-[#222F3E]">Create Mateluxy NOC</span>
                            </button>

                            <a
                                href="https://www.propertyfinder.ae"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setIsRapidToolsOpen(false)}
                                className="flex items-center gap-3 py-2 px-1 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                <img src="/property_finder_icon.svg" alt="" className="h-4 w-4" />
                                <span className="text-[13px] text-[#E64A4A]">Property Finder Direct Login</span>
                            </a>

                            <a
                                href="https://www.bayut.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setIsRapidToolsOpen(false)}
                                className="flex items-center gap-3 py-2 px-1 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                <img src="/svg/bayut_icon.svg" alt="" className="h-4 w-4" />
                                <span className="text-[13px] text-[#E64A4A]">Bayut Direct Login</span>
                            </a>

                            <a
                                href="https://dubailand.gov.ae"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setIsRapidToolsOpen(false)}
                                className="flex items-center gap-3 py-2 px-1 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                <img src="/svg/dld_icon.svg" alt="" className="h-4 w-4" />
                                <span className="text-[13px] text-[#E64A4A]">DLD Direct Login</span>
                            </a>

                            <a
                                href="https://mateluxy.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setIsRapidToolsOpen(false)}
                                className="flex items-center gap-3 py-2 px-1 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                <img src="/svg/mateluxy_icon.svg" alt="" className="h-4 w-4" />
                                <span className="text-[13px] text-[#E64A4A]">Mateluxy Website</span>
                            </a>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="h-8 w-[1px] bg-gray-200 mx-2" />

                <NotificationsDropdown />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild id="user-menu-trigger">
                        <button className="flex items-center gap-3 rounded-full border border-gray-100 bg-gray-50 p-1 pr-4 outline-none hover:bg-gray-100 transition-colors">
                            <div className="h-8 w-8 rounded-full bg-gray-900 overflow-hidden">
                                {user?.avatarUrl && !avatarError ? (
                                    <img
                                        src={user.avatarUrl}
                                        alt={user.fullName}
                                        className="h-full w-full object-cover"
                                        onError={() => setAvatarError(true)}
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white text-sm font-semibold">
                                        {user?.fullName?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                )}
                            </div>
                            <span className="text-sm font-medium text-gray-700">{user?.fullName || 'Loading...'}</span>
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => logout()} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Under Development Dialog */}
            <Dialog open={showUnderDevDialog} onOpenChange={setShowUnderDevDialog}>
                <DialogContent className="sm:max-w-[400px] rounded-[24px] p-8 text-center bg-white border border-gray-100 shadow-2xl z-[9999]">
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-amber-50/50">
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
                            className="mt-6 bg-[#00AAFF] hover:bg-[#0099DD] text-white px-8 h-11 rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
                        >
                            Got it
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </header>
    );
}
