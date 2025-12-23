'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLogin } from '@/lib/hooks/use-auth';
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
import { Loader2, Mail, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

interface LoginFormProps {
    onForgotPassword: () => void;
}

export function LoginForm({ onForgotPassword }: LoginFormProps) {
    const loginMutation = useLogin();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: '',
            password: '',
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        loginMutation.mutate(values);
    }

    return (
        <div className="w-full animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-6 lg:hidden">
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">M</div>
                    <span className="font-bold text-lg">Mateluxy</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                    Log in to your account.
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    Enter your username and password to log in.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {loginMutation.isError && (
                        <Alert variant="destructive">
                            <AlertDescription>
                                {(loginMutation.error as any)?.response?.data?.message || 'Login failed'}
                            </AlertDescription>
                        </Alert>
                    )}

                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="sr-only">Username</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <Input
                                            placeholder="Username or Email"
                                            className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="sr-only">Password</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <Input
                                            type="password"
                                            placeholder="Password"
                                            className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex items-center justify-end">
                        <button
                            type="button"
                            onClick={onForgotPassword}
                            className="text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                            Forgot password?
                        </button>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700"
                        disabled={loginMutation.isPending}
                    >
                        {loginMutation.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        Login
                    </Button>
                </form>
            </Form>
        </div>
    );
}
