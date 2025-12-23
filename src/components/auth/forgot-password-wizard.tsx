'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForgotPassword, useResetPassword } from '@/lib/hooks/use-auth';
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
import { Loader2, Mail, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { OtpInput } from '@/components/ui/otp-input';
import { SuccessPopup } from '@/components/ui/success-popup';

// Schemas for each step
const emailSchema = z.object({
    usernameOrEmail: z.string().min(1, 'Username or Email is required'),
});

const otpSchema = z.object({
    otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/, 'OTP must be numeric'),
});

const passwordSchema = z.object({
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

interface ForgotPasswordWizardProps {
    onBackToLogin: () => void;
}

type WizardStep = 'EMAIL' | 'OTP' | 'PASSWORD' | 'SUCCESS';

export function ForgotPasswordWizard({ onBackToLogin }: ForgotPasswordWizardProps) {
    const [step, setStep] = useState<WizardStep>('EMAIL');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');

    const forgotPasswordMutation = useForgotPassword();
    const resetPasswordMutation = useResetPassword();

    // Forms
    const emailForm = useForm<z.infer<typeof emailSchema>>({
        resolver: zodResolver(emailSchema),
        defaultValues: { usernameOrEmail: '' },
    });

    const otpForm = useForm<z.infer<typeof otpSchema>>({
        resolver: zodResolver(otpSchema),
        defaultValues: { otp: '' },
    });

    const passwordForm = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { newPassword: '', confirmPassword: '' },
    });

    // Auto-navigate on success
    useEffect(() => {
        if (step === 'SUCCESS') {
            const timer = setTimeout(() => {
                onBackToLogin();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [step, onBackToLogin]);

    // Handlers
    const onEmailSubmit = (values: z.infer<typeof emailSchema>) => {
        forgotPasswordMutation.mutate(values.usernameOrEmail, {
            onSuccess: () => {
                setEmail(values.usernameOrEmail);
                setStep('OTP');
            },
        });
    };

    const onOtpSubmit = (values: z.infer<typeof otpSchema>) => {
        setOtp(values.otp);
        setStep('PASSWORD');
    };

    const onPasswordSubmit = (values: z.infer<typeof passwordSchema>) => {
        resetPasswordMutation.mutate({
            usernameOrEmail: email,
            otp: otp,
            newPassword: values.newPassword,
        }, {
            onSuccess: () => {
                setStep('SUCCESS');
            },
        });
    };

    const renderStep = () => {
        switch (step) {
            case 'EMAIL':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold">Forgot Password?</h2>
                            <p className="text-sm text-gray-600">Enter your email to receive a reset code.</p>
                        </div>

                        <Form {...emailForm}>
                            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                                {forgotPasswordMutation.isError && (
                                    <Alert variant="destructive">
                                        <AlertDescription>
                                            {(forgotPasswordMutation.error as any)?.response?.data?.message || 'Failed to send OTP'}
                                        </AlertDescription>
                                    </Alert>
                                )}
                                <FormField
                                    control={emailForm.control}
                                    name="usernameOrEmail"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="sr-only">Email</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                                    <Input
                                                        placeholder="Username or Email"
                                                        className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700" disabled={forgotPasswordMutation.isPending}>
                                    {forgotPasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Send OTP
                                </Button>
                            </form>
                        </Form>
                    </div>
                );

            case 'OTP':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold">Verification Code</h2>
                            <p className="text-sm text-gray-600">
                                Enter the 6-digit verification code that was sent to <br />
                                <span className="font-medium text-gray-900">{email}</span>
                            </p>
                        </div>

                        <Form {...otpForm}>
                            <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-8">
                                <FormField
                                    control={otpForm.control}
                                    name="otp"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <OtpInput
                                                    length={6}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-center" />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base">
                                    Verify Account
                                </Button>
                                <div className="text-center text-sm text-gray-600">
                                    Didn't receive code?{' '}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            forgotPasswordMutation.mutate(email);
                                        }}
                                        className="text-blue-600 font-medium hover:underline"
                                        disabled={forgotPasswordMutation.isPending}
                                    >
                                        {forgotPasswordMutation.isPending ? 'Sending...' : 'Resend'}
                                    </button>
                                </div>
                            </form>
                        </Form>
                    </div>
                );

            case 'PASSWORD':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold">Reset Password</h2>
                            <p className="text-sm text-gray-600">Create a new password for your account.</p>
                        </div>

                        <Form {...passwordForm}>
                            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                                {resetPasswordMutation.isError && (
                                    <Alert variant="destructive">
                                        <AlertDescription>
                                            {(resetPasswordMutation.error as any)?.response?.data?.message || 'Failed to reset password'}
                                        </AlertDescription>
                                    </Alert>
                                )}
                                <FormField
                                    control={passwordForm.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="sr-only">New Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                                    <Input
                                                        type="password"
                                                        placeholder="New Password"
                                                        className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={passwordForm.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="sr-only">Confirm Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                                    <Input
                                                        type="password"
                                                        placeholder="Confirm Password"
                                                        className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700" disabled={resetPasswordMutation.isPending}>
                                    {resetPasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Reset Password
                                </Button>
                            </form>
                        </Form>
                    </div>
                );

            // SUCCESS step is removed as it's handled by popup
        }
    };

    return (
        <div className="w-full">
            <SuccessPopup
                isOpen={step === 'SUCCESS'}
                title="Password Reset!"
                message="Your password has been successfully updated. Redirecting to login..."
                autoCloseDuration={2000}
                onClose={onBackToLogin}
            />

            {step !== 'SUCCESS' && (
                <>
                    <button
                        onClick={onBackToLogin}
                        className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
                    >
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Back to Login
                    </button>
                    {renderStep()}
                </>
            )}
        </div>
    );
}
