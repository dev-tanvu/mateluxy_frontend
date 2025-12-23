'use client';

import React, { useRef, useState } from 'react';
import { UseFormRegister, Control, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DldTabProps {
    register: UseFormRegister<any>;
    control: Control<any>;
    errors: FieldErrors<any>;
    setValue: UseFormSetValue<any>;
    watch: UseFormWatch<any>;
}

export function DldTab({ register, control, errors, setValue, watch }: DldTabProps) {
    const defaultQrCode = watch('dldQrCode');
    const [qrCodeImage, setQrCodeImage] = useState<string | null>(defaultQrCode || null);
    const qrCodeInputRef = useRef<HTMLInputElement>(null);

    const handleQrCodeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setQrCodeImage(reader.result as string);
                setValue('dldQrCode', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeQrCode = () => {
        setQrCodeImage(null);
        setValue('dldQrCode', '');
        if (qrCodeInputRef.current) {
            qrCodeInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-6 max-w-md">
            {/* DLD Permit Number */}
            <div className="space-y-2.5">
                <Label htmlFor="dldPermitNumber" className="text-[15px] font-medium text-gray-700">
                    DLD Permit Number <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="dldPermitNumber"
                    placeholder="Enter your DLD permit number"
                    className={cn(
                        "h-[50px] bg-white border-[#EDF1F7] rounded-lg focus-visible:ring-blue-500 placeholder:text-[#8F9BB3] text-[15px]",
                        errors.dldPermitNumber && "border-red-500"
                    )}
                    {...register('dldPermitNumber')}
                />
                {errors.dldPermitNumber && <p className="text-sm text-red-500">{errors.dldPermitNumber.message as string}</p>}
            </div>

            {/* DLD QR Code */}
            <div className="space-y-2.5">
                <div className="border border-[#EDF1F7] rounded-lg p-6 bg-white">
                    <p className="text-center text-[#00AAFF] text-[15px] font-medium mb-4">DLD QR Code</p>

                    {!qrCodeImage ? (
                        <label
                            htmlFor="qrCodeUpload"
                            className="flex flex-col items-center justify-center w-32 h-32 mx-auto bg-[#F7F9FC] rounded-xl border-2 border-dashed border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <QrCode className="w-10 h-10 text-gray-300" />
                            <input
                                id="qrCodeUpload"
                                ref={qrCodeInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleQrCodeUpload}
                            />
                        </label>
                    ) : (
                        <div className="relative w-32 h-32 mx-auto">
                            <img
                                src={qrCodeImage}
                                alt="DLD QR Code"
                                className="w-full h-full object-cover rounded-xl border border-[#EDF1F7]"
                            />
                            <button
                                type="button"
                                onClick={removeQrCode}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
