'use client';

import React, { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { getCountries, getCountryCallingCode } from 'react-phone-number-input/input';
import en from 'react-phone-number-input/locale/en';
import { CountryCode } from 'libphonenumber-js';

interface CountryCodeSelectProps {
    value: CountryCode;
    onChange: (value: CountryCode) => void;
    className?: string;
}

export function CountryCodeSelect({ value, onChange, className }: CountryCodeSelectProps) {
    const [open, setOpen] = useState(false);

    const countries = useMemo(() => {
        return getCountries().map((country) => ({
            code: country,
            name: en[country],
            dial_code: `+${getCountryCallingCode(country)}`,
        }));
    }, []);

    const selectedCountry = countries.find((c) => c.code === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-[110px] justify-between px-3 border-gray-200 bg-white h-[50px]", className)}
                >
                    <div className="flex items-center gap-2">
                        {value && (
                            <img
                                src={`https://flagcdn.com/w40/${value.toLowerCase()}.png`}
                                alt={selectedCountry?.name}
                                className="h-5 w-5 rounded-full object-cover"
                            />
                        )}
                        <span className="text-sm font-medium text-gray-700">{selectedCountry?.dial_code}</span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0 z-[70]" align="start">
                <Command>
                    <CommandInput placeholder="Search country..." />
                    <CommandList>
                        <CommandEmpty>No country found.</CommandEmpty>
                        <CommandGroup className="max-h-[300px] overflow-y-auto">
                            {countries.map((country) => (
                                <CommandItem
                                    key={country.code}
                                    value={country.name}
                                    onSelect={() => {
                                        onChange(country.code);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === country.code ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <img
                                        src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
                                        alt={country.name}
                                        className="mr-2 h-4 w-4 rounded-full object-cover"
                                    />
                                    <span className="flex-1">{country.name}</span>
                                    <span className="text-gray-500 text-sm">{country.dial_code}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
