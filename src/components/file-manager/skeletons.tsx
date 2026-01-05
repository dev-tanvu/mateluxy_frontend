import { Skeleton } from "@/components/ui/skeleton";

export function FolderCardSkeleton() {
    return (
        <div className="bg-white rounded-[12px] p-5 flex items-center justify-between min-h-[120px]">
            <div className="flex flex-col justify-between h-full gap-3 w-full">
                <Skeleton className="h-11 w-11 rounded-full" />
                <div>
                    <Skeleton className="h-5 w-24 mb-2 rounded" />
                    <Skeleton className="h-3 w-16 rounded" />
                </div>
            </div>
        </div>
    );
}

export function FileCardSkeleton() {
    return (
        <div className="bg-[#EEF5FA] rounded-[20px] overflow-hidden p-[10px]">
            <div className="aspect-[4/3] bg-white rounded-[12px] relative overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                    <Skeleton className="h-[60px] w-[60px] rounded-lg" />
                </div>
            </div>
            <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-4 w-2/3 rounded" />
                </div>
            </div>
        </div>
    );
}

export function TableRowSkeleton() {
    return (
        <div className="flex justify-between items-center py-4 border-b border-gray-50">
            <div className="flex items-center gap-4 w-1/3">
                <Skeleton className="h-12 w-12 rounded-[16px]" />
                <Skeleton className="h-4 w-3/4 rounded" />
            </div>
            <Skeleton className="h-4 w-1/5 rounded" />
            <Skeleton className="h-4 w-1/5 rounded" />
            <Skeleton className="h-4 w-1/5 rounded" />
        </div>
    );
}

export function StorageStatsSkeleton() {
    return (
        <div className="flex flex-col h-full bg-white rounded-[24px] p-8 shadow-sm">
            <Skeleton className="h-8 w-40 mx-auto mb-10 rounded" />

            {/* Gauge Skeleton */}
            <div className="mx-auto mb-10">
                <div className="w-64 h-32 rounded-t-full border-t-[16px] border-r-[16px] border-l-[16px] border-gray-200 animate-pulse" />
            </div>

            <div className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="w-12 h-12 rounded-[12px]" />
                        <div className="flex-1">
                            <div className="flex justify-between mb-2">
                                <Skeleton className="h-4 w-16 rounded" />
                                <Skeleton className="h-4 w-10 rounded" />
                            </div>
                            <Skeleton className="h-2.5 w-full rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function CategorySkeleton() {
    return (
        <div className="flex flex-col items-center gap-3 min-w-[80px]">
            <Skeleton className="w-[70px] h-[70px] rounded-[10px]" />
            <Skeleton className="h-4 w-12 rounded" />
        </div>
    );
}
