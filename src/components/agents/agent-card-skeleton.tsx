import { Skeleton } from "@/components/ui/skeleton";

export function AgentCardSkeleton() {
    return (
        <div className="bg-white rounded-[24px] border border-[#EDF1F7] p-5 flex flex-col items-center text-center">
            {/* Avatar */}
            <Skeleton className="w-[88px] h-[88px] rounded-full mb-3" />

            {/* Name & Role */}
            <Skeleton className="h-5 w-32 mb-1 rounded-md" />
            <Skeleton className="h-4 w-24 mb-4 rounded-md" />

            {/* Stats */}
            <div className="flex items-center justify-center gap-6 w-full py-4 border-y border-[#F1F5F9] mb-4">
                <div className="flex flex-col items-center gap-1">
                    <Skeleton className="h-5 w-8 rounded-md" />
                    <Skeleton className="h-3 w-12 rounded-md" />
                </div>
                <div className="w-[1px] h-8 bg-[#F1F5F9]" />
                <div className="flex flex-col items-center gap-1">
                    <Skeleton className="h-5 w-8 rounded-md" />
                    <Skeleton className="h-3 w-12 rounded-md" />
                </div>
            </div>

            {/* Contact Info */}
            <div className="w-full space-y-3 mb-5">
                <Skeleton className="h-9 w-full rounded-xl" />
                <Skeleton className="h-9 w-full rounded-xl" />
            </div>

            {/* Footer */}
            <div className="flex items-center gap-2 mt-auto">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>
        </div>
    );
}
