'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/auth/auth-layout';
import { AuthHero } from '@/components/auth/auth-hero';
import { LoginForm } from '@/components/auth/login-form';
import { ForgotPasswordWizard } from '@/components/auth/forgot-password-wizard';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [view, setView] = useState<'login' | 'forgot'>('login');

    // Sync state with URL
    useEffect(() => {
        const viewParam = searchParams.get('view');
        if (viewParam === 'forgot') {
            setView('forgot');
        } else {
            setView('login');
        }
    }, [searchParams]);

    const handleForgotPassword = () => {
        router.push('/login?view=forgot');
    };

    const handleBackToLogin = () => {
        router.push('/login');
    };

    return (
        <AuthLayout hero={<AuthHero />}>
            {view === 'login' ? (
                <LoginForm onForgotPassword={handleForgotPassword} />
            ) : (
                <ForgotPasswordWizard onBackToLogin={handleBackToLogin} />
            )}
        </AuthLayout>
    );
}

export default function LoginPage() {
    return (
        <Suspense>
            <LoginContent />
        </Suspense>
    );
}
