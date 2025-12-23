'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForgotPassword } from '@/lib/hooks/use-auth';
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
import { Loader2, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const formSchema = z.object({
    usernameOrEmail: z.string().min(1, 'Username or Email is required'),
});

type ErrorResponse = {
    error?: string;
    message?: string;
    lockoutDuration?: number;
};

export default function ForgotPasswordPage() {
    const forgotPasswordMutation = useForgotPassword();
    const router = useRouter();
    const [errorInfo, setErrorInfo] = useState<ErrorResponse | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            usernameOrEmail: '',
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        setErrorInfo(null);

        forgotPasswordMutation.mutate(values.usernameOrEmail, {
            onSuccess: () => {
                router.push(`/reset-password?user=${values.usernameOrEmail}`);
            },
            onError: (error: any) => {
                const errorData = error?.response?.data as ErrorResponse;
                setErrorInfo(errorData);
            },
        });
    }

    const getErrorDisplay = () => {
        if (!errorInfo) return null;

        if (errorInfo.error === 'ACCOUNT_LOCKED') {
            return {
                variant: 'destructive' as const,
                icon: Lock,
                title: 'Account Locked',
                message: errorInfo.message || 'Your account is temporarily locked.',
            };
        }

        return {
            variant: 'destructive' as const,
            icon: AlertCircle,
            title: 'Error',
            message: errorInfo.message || 'Failed to send OTP. Please try again.',
        };
    };

    const errorDisplay = getErrorDisplay();

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <Card className="w-[450px]">
                <CardHeader>
                    <CardTitle className="text-2xl">Forgot Password</CardTitle>
                    <CardDescription>Enter your username or email to receive an OTP.</CardDescription>
                </CardHeader>
                <CardContent>
                    {errorDisplay && (
                        <Alert variant={errorDisplay.variant} className="mb-4">
                            <errorDisplay.icon className="h-4 w-4" />
                            <AlertDescription>
                                <p className="font-semibold">{errorDisplay.title}</p>
                                <p className="text-sm mt-1">{errorDisplay.message}</p>
                            </AlertDescription>
                        </Alert>
                    )}

                    {forgotPasswordMutation.isSuccess && (
                        <Alert className="mb-4">
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertDescription>
                                <p className="font-semibold">OTP Sent!</p>
                                <p className="text-sm mt-1">Check your email for the OTP code.</p>
                            </AlertDescription>
                        </Alert>
                    )}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="usernameOrEmail"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username or Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="username or email"
                                                disabled={errorInfo?.error === 'ACCOUNT_LOCKED'}
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
                                disabled={
                                    forgotPasswordMutation.isPending ||
                                    errorInfo?.error === 'ACCOUNT_LOCKED'
                                }
                            >
                                {forgotPasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {errorInfo?.error === 'ACCOUNT_LOCKED' ? 'Account Locked' : 'Send OTP'}
                            </Button>
                        </form>
                    </Form>

                    <div className="mt-6 text-center">
                        <Link href="/login" className="text-sm text-blue-600 hover:underline">
                            Back to Login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
