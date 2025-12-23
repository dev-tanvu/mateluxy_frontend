'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useResetPassword } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';

const formSchema = z.object({
    otp: z.string()
        .min(6, 'OTP must be 6 digits')
        .max(6, 'OTP must be 6 digits')
        .regex(/^[0-9]+$/, 'OTP must contain only numbers'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type ErrorResponse = {
    error?: string;
    message?: string;
    attemptsRemaining?: number;
    lockoutDuration?: number;
};

function ResetPasswordContent() {
    const resetPasswordMutation = useResetPassword();
    const router = useRouter();
    const searchParams = useSearchParams();
    const usernameOrEmail = searchParams.get('user') || '';

    const [errorInfo, setErrorInfo] = useState<ErrorResponse | null>(null);
    const [isLocked, setIsLocked] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            otp: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        setErrorInfo(null);
        setIsLocked(false);

        resetPasswordMutation.mutate(
            {
                usernameOrEmail,
                otp: values.otp,
                newPassword: values.newPassword,
            },
            {
                onSuccess: () => {
                    router.push('/login?reset=success');
                },
                onError: (error: any) => {
                    const errorData = error?.response?.data as ErrorResponse;
                    setErrorInfo(errorData);

                    if (errorData?.error === 'TOO_MANY_ATTEMPTS') {
                        setIsLocked(true);
                        form.reset();
                    }
                },
            }
        );
    }

    const getErrorMessage = () => {
        if (!errorInfo) return null;

        const { error, message, attemptsRemaining, lockoutDuration } = errorInfo;

        switch (error) {
            case 'INVALID_OTP':
                return {
                    variant: 'warning' as const,
                    icon: AlertCircle,
                    title: 'Invalid OTP',
                    message: `${message}${attemptsRemaining !== undefined ? ` You have ${attemptsRemaining} attempt(s) remaining.` : ''}`,
                };

            case 'TOO_MANY_ATTEMPTS':
                return {
                    variant: 'destructive' as const,
                    icon: Lock,
                    title: 'Account Temporarily Locked',
                    message: lockoutDuration
                        ? `Too many failed attempts. Please try again in ${lockoutDuration} minute(s).`
                        : message || 'Too many failed attempts.',
                };

            case 'OTP_EXPIRED':
                return {
                    variant: 'warning' as const,
                    icon: AlertCircle,
                    title: 'OTP Expired',
                    message: 'Your OTP has expired. Please request a new one.',
                };

            case 'OTP_NOT_FOUND':
                return {
                    variant: 'warning' as const,
                    icon: AlertCircle,
                    title: 'No OTP Found',
                    message: 'No OTP found for this account. Please request a new one.',
                };

            default:
                return {
                    variant: 'destructive' as const,
                    icon: AlertCircle,
                    title: 'Error',
                    message: message || 'Failed to reset password. Please try again.',
                };
        }
    };

    const errorDisplay = getErrorMessage();

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <Card className="w-[450px]">
                <CardHeader>
                    <CardTitle className="text-2xl">Reset Password</CardTitle>
                    <CardDescription>
                        Enter the OTP sent to your email and create a new password.
                        {usernameOrEmail && <span className="block mt-1 font-medium text-sm">Account: {usernameOrEmail}</span>}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {errorDisplay && (
                        <Alert
                            variant={errorDisplay.variant}
                            className="mb-4"
                        >
                            <errorDisplay.icon className="h-4 w-4" />
                            <AlertDescription>
                                <p className="font-semibold">{errorDisplay.title}</p>
                                <p className="text-sm mt-1">{errorDisplay.message}</p>
                            </AlertDescription>
                        </Alert>
                    )}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="otp"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>OTP (6 digits)</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="123456"
                                                maxLength={6}
                                                disabled={isLocked}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="Enter new password"
                                                disabled={isLocked}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="Confirm new password"
                                                disabled={isLocked}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={resetPasswordMutation.isPending || isLocked}
                            >
                                {resetPasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isLocked ? 'Account Locked' : 'Reset Password'}
                            </Button>
                        </form>
                    </Form>

                    <div className="mt-6 space-y-2 text-center">
                        <Link
                            href={`/forgot-password${usernameOrEmail ? `?user=${usernameOrEmail}` : ''}`}
                            className="text-sm text-blue-600 hover:underline block"
                        >
                            Request New OTP
                        </Link>
                        <Link href="/login" className="text-sm text-gray-600 hover:underline block">
                            Back to Login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense>
            <ResetPasswordContent />
        </Suspense>
    );
}
