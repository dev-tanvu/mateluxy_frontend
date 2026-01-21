
import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

const bedrooms = [
    "Studio",
    ...Array.from({ length: 20 }, (_, i) => (i + 1).toString())
]

interface BedroomsSelectProps {
    value?: string
    onChange: (value: string) => void
    error?: string
}

export function BedroomsSelect({ value, onChange, error }: BedroomsSelectProps) {
    const [open, setOpen] = React.useState(false)

    return (
        <div className="space-y-1">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            "w-full justify-between h-[50px] bg-white border-[#EDF1F7] text-[15px] font-normal hover:bg-white hover:border-gray-300 transition-colors",
                            !value && "text-[#8F9BB3]",
                            error && "border-red-500",
                            open && "ring-2 ring-blue-100 border-blue-500"
                        )}
                        type="button"
                    >
                        {value
                            ? bedrooms.find((bedroom) => bedroom === value)
                            : "Select bedrooms"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Search bedrooms..." />
                        <CommandList>
                            <CommandEmpty>No bedroom found.</CommandEmpty>
                            <CommandGroup>
                                {bedrooms.map((bedroom) => (
                                    <CommandItem
                                        key={bedroom}
                                        value={bedroom}
                                        onSelect={(currentValue) => {
                                            // cmdk returns lowercase values usually, but we want to use the original value or handle it.
                                            // But if we pass specific value prop to CommandItem, onSelect gives that? 
                                            // Check cmdk implementation. Usually it returns the `value` prop if provided.
                                            // Actually, standard CommandItem onSelect returns the current value which might be lowercased if not handled carefully.
                                            // However, let's just use the `bedroom` variable from the map scope.
                                            onChange(bedroom)
                                            setOpen(false)
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === bedroom ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {bedroom}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    )
}
