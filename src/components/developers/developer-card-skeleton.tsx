import { Skeleton } from "@/components/ui/skeleton";

export function DeveloperCardSkeleton() {
    return (
        <div className="relative overflow-hidden flex-shrink-0 w-[200px] h-[120px] bg-white rounded-lg border border-gray-200 flex items-center justify-center p-4">
            <Skeleton className="h-16 w-3/4" />
            <div
                className="absolute top-0 right-10 pointer-events-none"
                style={{
                    width: '130.89px',
                    height: '72.81px',
                    backgroundColor: '#00BBFF',
                    opacity: 0.08,
                    filter: 'blur(20px)',
                    transform: 'translate(30%, -30%)',
                }}
            />
        </div>
    );
}
