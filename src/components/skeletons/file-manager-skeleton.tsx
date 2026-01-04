
import { Skeleton } from "@/components/ui/skeleton";

export function FileManagerSkeleton() {
    return (
        <div className="flex bg-[#F2F7FA] min-h-screen animate-pulse">
            {/* Main Content Skeleton */}
            <div className="flex-1 overflow-auto p-12 pr-8">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between mb-10">
                    <Skeleton className="h-8 w-32 rounded-lg" />
                    <Skeleton className="h-12 w-36 rounded-xl" />
                </div>

                {/* Folders Grid Skeleton */}
                <div className="grid grid-cols-3 gap-6 mb-12">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-[12px] p-5 flex items-center justify-between min-h-[120px]">
                            <div className="flex flex-col justify-between h-full gap-3 w-full">
                                <Skeleton className="h-11 w-11 rounded-full" />
                                <div>
                                    <Skeleton className="h-5 w-24 mb-2 rounded" />
                                    <Skeleton className="h-3 w-16 rounded" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Access Skeleton */}
                <div className="mb-12">
                    <Skeleton className="h-6 w-32 mb-6 rounded" />
                    <div className="flex gap-6 overflow-hidden">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="flex flex-col items-center gap-3 min-w-[80px]">
                                <Skeleton className="w-[70px] h-[70px] rounded-[10px]" />
                                <Skeleton className="h-4 w-12 rounded" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Files Table Skeleton */}
                <div className="bg-white rounded-[24px] p-8 shadow-sm">
                    <Skeleton className="h-6 w-32 mb-8 rounded" />
                    <div className="space-y-4">
                        {/* Table Header */}
                        <div className="flex justify-between pb-4 border-b border-gray-100">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-4 w-1/5" />
                            <Skeleton className="h-4 w-1/5" />
                            <Skeleton className="h-4 w-1/5" />
                        </div>
                        {/* Table Rows */}
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex justify-between items-center py-4 border-b border-gray-50">
                                <div className="flex items-center gap-4 w-1/3">
                                    <Skeleton className="h-12 w-12 rounded-[16px]" />
                                    <Skeleton className="h-4 w-3/4 rounded" />
                                </div>
                                <Skeleton className="h-4 w-1/5 rounded" />
                                <Skeleton className="h-4 w-1/5 rounded" />
                                <Skeleton className="h-4 w-1/5 rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="w-[450px] pr-12 pb-12 flex flex-col sticky top-0 h-screen">
                <div className="bg-white rounded-[24px] p-8 flex flex-col h-full shadow-sm overflow-hidden">
                    <Skeleton className="h-8 w-40 mx-auto mb-10 rounded" />

                    {/* Gauge Skeleton */}
                    <div className="mx-auto mb-10">
                        <div className="w-64 h-32 rounded-t-full border-t-[16px] border-r-[16px] border-l-[16px] border-gray-200" />
                    </div>

                    {/* Categories Skeleton */}
                    <div className="space-y-6 mb-12">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-4">
                                <Skeleton className="w-12 h-12 rounded-[12px]" />
                                <div className="flex-1">
                                    <div className="flex justify-between mb-2">
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-4 w-10" />
                                    </div>
                                    <Skeleton className="h-2.5 w-full rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
