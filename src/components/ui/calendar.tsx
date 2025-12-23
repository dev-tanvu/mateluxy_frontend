"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-3", className)}
            classNames={{
                // Layout containers
                months: "flex flex-col sm:flex-row gap-4",
                month: "flex flex-col gap-4",
                month_caption: "flex justify-center pt-1 relative items-center h-10",
                caption_label: "text-sm font-medium text-[#1f2837]",

                // Navigation
                nav: "flex items-center gap-1",
                button_previous: "absolute left-1 h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-[#e5ecf5] hover:bg-[#f8fafc]",
                button_next: "absolute right-1 h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-[#e5ecf5] hover:bg-[#f8fafc]",

                // Calendar grid
                month_grid: "w-full border-collapse",
                weekdays: "flex",
                weekday: "text-[#8b97a8] rounded-md w-9 font-normal text-[0.8rem] text-center",
                week: "flex w-full mt-2",
                day: "h-9 w-9 text-center text-sm p-0 relative flex items-center justify-center",
                day_button: "h-8 w-8 p-0 font-normal rounded-full hover:bg-[#f0f7ff] hover:text-[#0aa5ff] focus:bg-[#f0f7ff] focus:text-[#0aa5ff] inline-flex items-center justify-center transition-colors",

                // Day states
                selected: "bg-[#0aa5ff] text-white hover:bg-[#0aa5ff] hover:text-white focus:bg-[#0aa5ff] focus:text-white rounded-full",
                today: "bg-[#f0f7ff] text-[#0aa5ff] font-semibold rounded-full",
                outside: "text-[#c7ced9] opacity-50",
                disabled: "text-[#c7ced9] opacity-50 cursor-not-allowed",
                hidden: "invisible",

                ...classNames,
            }}
            components={{
                Chevron: ({ orientation }) => {
                    return orientation === "left" ? (
                        <ChevronLeft className="h-4 w-4" />
                    ) : (
                        <ChevronRight className="h-4 w-4" />
                    );
                },
            }}
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar }
