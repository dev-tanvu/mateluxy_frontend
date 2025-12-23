import React from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Calendar, DollarSign, ALargeSmall } from 'lucide-react';

export type SortConfig = {
    sortBy: 'date' | 'price' | 'name';
    sortOrder: 'asc' | 'desc';
};

interface SortMenuProps {
    value: SortConfig;
    onChange: (value: SortConfig) => void;
}

export function SortMenu({ value, onChange }: SortMenuProps) {
    const getLabel = () => {
        if (value.sortBy === 'date') return value.sortOrder === 'desc' ? 'Newest' : 'Oldest';
        if (value.sortBy === 'price') return value.sortOrder === 'desc' ? 'Price: High to Low' : 'Price: Low to High';
        if (value.sortBy === 'name') return value.sortOrder === 'asc' ? 'Name: A-Z' : 'Name: Z-A';
        return 'Sort by';
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-white border-[#EDF1F7] text-[#1A1A1A] h-[44px] rounded-xl gap-2 hover:bg-gray-50 min-w-[140px] justify-between">
                    <span>Sort by <span className="text-[#8F9BB3] ml-1">{getLabel()}</span></span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px] bg-white">
                <DropdownMenuLabel>Date</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onChange({ sortBy: 'date', sortOrder: 'desc' })}>
                    <Calendar className="mr-2 h-4 w-4" /> Newest
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChange({ sortBy: 'date', sortOrder: 'asc' })}>
                    <Calendar className="mr-2 h-4 w-4" /> Oldest
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuLabel>Price</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onChange({ sortBy: 'price', sortOrder: 'desc' })}>
                    <DollarSign className="mr-2 h-4 w-4" /> High to Low
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChange({ sortBy: 'price', sortOrder: 'asc' })}>
                    <DollarSign className="mr-2 h-4 w-4" /> Low to High
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuLabel>Name</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onChange({ sortBy: 'name', sortOrder: 'asc' })}>
                    <ALargeSmall className="mr-2 h-4 w-4" /> A to Z
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChange({ sortBy: 'name', sortOrder: 'desc' })}>
                    <ALargeSmall className="mr-2 h-4 w-4" /> Z to A
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
