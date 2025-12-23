import { Skeleton } from "@/components/ui/skeleton";

export function PropertyDetailSkeleton() {
    return (
        <div className="min-h-screen bg-white p-8">
            {/* Header / Back */}
            <div className="mb-8">
                {/* Status Tracker */}
                <div className="flex items-center gap-8 mb-12">
                    {[1, 2, 3, 4].map((step) => (
                        <div key={step} className="flex items-center gap-2">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-5 w-24 rounded-md" />
                        </div>
                    ))}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-4">
                                <Skeleton className="h-5 w-24 rounded-md" />
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                            <Skeleton className="h-9 w-32 rounded-md mb-2" />
                            <Skeleton className="h-4 w-40 rounded-md" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-12 gap-8">
                {/* Left Column (Stats/Ranking) - span 8 */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    {/* Ranking & Info */}
                    <div>
                        <div className="space-y-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between border-b border-gray-200 pb-4">
                                    <Skeleton className="h-5 w-32 rounded-md" />
                                    <Skeleton className="h-5 w-24 rounded-md" />
                                </div>
                            ))}
                            <Skeleton className="h-4 w-full rounded-md mt-2" />
                        </div>
                    </div>

                    {/* Quality Score Card */}
                    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <Skeleton className="h-7 w-40 rounded-md" />
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-8 w-16 rounded-full" />
                                <Skeleton className="h-5 w-5 rounded-full" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-7 w-7 rounded-lg" />
                                        <Skeleton className="h-5 w-32 rounded-md" />
                                    </div>
                                    <Skeleton className="h-5 w-10 rounded-md" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column (Leads) - span 4 */}
                <div className="col-span-12 lg:col-span-4">
                    <div className="mb-6">
                        <Skeleton className="h-8 w-24 rounded-md" />
                    </div>

                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="rounded-[24px] bg-white px-5 py-4 border border-[#EDF1F7]">
                                <div className="flex items-center gap-2 mb-3">
                                    <Skeleton className="h-5 w-24 rounded-md" />
                                </div>
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <Skeleton className="h-5 w-32 rounded-md mb-2" />
                                        <Skeleton className="h-4 w-24 rounded-md mb-1" />
                                        <Skeleton className="h-4 w-full rounded-md mb-1" />
                                        <Skeleton className="h-4 w-20 rounded-md mb-3" />
                                    </div>
                                    <Skeleton className="h-16 w-16 rounded-lg ml-2" />
                                </div>
                                <div className="mt-3 pt-3 border-t border-dashed border-gray-200 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-6 w-6 rounded-full" />
                                        <Skeleton className="h-4 w-24 rounded-md" />
                                    </div>
                                    <Skeleton className="h-4 w-16 rounded-md" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
