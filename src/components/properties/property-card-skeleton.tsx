import { Skeleton } from "@/components/ui/skeleton";

export function PropertyCardSkeleton() {
    return (
        <div className="bg-white rounded-[16px] border border-[1px] border-[#E6E6E6] flex flex-col w-full max-w-[360px] overflow-hidden">
            {/* Image Placeholder */}
            <div className="relative h-[220px] w-full p-[10px]">
                <Skeleton className="h-full w-full rounded-[10px]" />
            </div>

            {/* Content Section */}
            <div className="px-4 pb-4 pt-1 flex-1 flex flex-col">
                {/* Title */}
                <Skeleton className="h-6 w-3/4 mb-2 rounded-md" />

                {/* Location */}
                <div className="flex items-center gap-1.5 mb-4">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-1/2 rounded-md" />
                </div>

                {/* Specs */}
                <div className="flex items-center gap-4 mb-5">
                    <Skeleton className="h-4 w-12 rounded-md" />
                    <Skeleton className="h-4 w-12 rounded-md" />
                    <Skeleton className="h-4 w-16 rounded-md" />
                </div>

                {/* Agent Info */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div className="flex flex-col gap-1">
                            <Skeleton className="h-3 w-24 rounded-md" />
                            <Skeleton className="h-3 w-16 rounded-md" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                </div>

                {/* Footer Stats */}
                <div className="mt-auto pt-3 border-t border-[#EDF1F7] flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-7 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-12 rounded-md" />
                </div>
            </div>
        </div>
    );
}
