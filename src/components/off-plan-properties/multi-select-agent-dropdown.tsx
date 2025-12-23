'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Search, User } from 'lucide-react';
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
import { useAgents } from '@/lib/hooks/use-agents';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MultiSelectAgentDropdownProps {
    selectedAgentIds: string[];
    onChange: (agentIds: string[]) => void;
    placeholder?: string;
}

export function MultiSelectAgentDropdown({ selectedAgentIds, onChange, placeholder = "Select agents" }: MultiSelectAgentDropdownProps) {
    const [open, setOpen] = React.useState(false);
    const { data: agents = [] } = useAgents();

    const selectedAgents = agents.filter(agent => selectedAgentIds.includes(agent.id));

    const toggleAgent = (agentId: string) => {
        const newSelectedIds = selectedAgentIds.includes(agentId)
            ? selectedAgentIds.filter(id => id !== agentId)
            : [...selectedAgentIds, agentId];
        onChange(newSelectedIds);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-auto min-h-[50px] bg-white border-[#EDF1F7] rounded-xl text-[#1A1A1A] hover:bg-gray-50 px-3 py-2"
                >
                    <div className="flex flex-wrap gap-1 items-center">
                        {selectedAgentIds.length > 0 ? (
                            selectedAgentIds.length > 2 ? (
                                <span className="text-[15px] font-medium">
                                    {selectedAgentIds.length} agents selected
                                </span>
                            ) : (
                                selectedAgents.map((agent) => (
                                    <Badge
                                        key={agent.id}
                                        variant="secondary"
                                        className="mr-1 bg-[#E0F2FE] text-[#0BA5EC] hover:bg-[#BAE6FD] border-none"
                                    >
                                        {agent.name.split(' ')[0]}
                                    </Badge>
                                ))
                            )
                        ) : (
                            <span className="text-[#8F9BB3] text-[15px] font-normal">{placeholder}</span>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                    <div className="flex items-center border-b px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <CommandInput placeholder="Search agents..." className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50" />
                    </div>
                    <CommandList>
                        <CommandEmpty>No agent found.</CommandEmpty>
                        <CommandGroup className="max-h-[300px] overflow-y-auto">
                            {agents.map((agent) => (
                                <CommandItem
                                    key={agent.id}
                                    onSelect={() => toggleAgent(agent.id)}
                                    className="cursor-pointer"
                                >
                                    <div className="flex items-center gap-3 w-full">
                                        <div className={cn(
                                            "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                            selectedAgentIds.includes(agent.id)
                                                ? "bg-primary text-primary-foreground"
                                                : "opacity-50 [&_svg]:invisible"
                                        )}>
                                            <Check className={cn("h-4 w-4")} />
                                        </div>

                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={agent.photoUrl} alt={agent.name} />
                                            <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                        </Avatar>

                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium leading-none">{agent.name}</span>
                                            {agent.languages && agent.languages.length > 0 && (
                                                <span className="text-xs text-muted-foreground mt-0.5">
                                                    Speaks {agent.languages.slice(0, 2).join(', ')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
