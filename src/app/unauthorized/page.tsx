import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function UnauthorizedPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
            <h1 className="text-4xl font-bold text-red-600 mb-4">403 - Unauthorized</h1>
            <p className="text-gray-600 mb-8">You do not have permission to access this page.</p>
            <Link href="/dashboard">
                <Button>Return to Dashboard</Button>
            </Link>
        </div>
    );
}
