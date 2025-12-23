import React from 'react';
import { UseFormRegister, Control, FieldErrors, UseFormWatch, UseFormSetValue, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { PropertyMap } from '@/components/off-plan-properties/maps/property-map';
import { AddressAutocomplete } from '@/components/off-plan-properties/maps/address-autocomplete';
import { PfLocationAutocomplete } from '../pf-location-autocomplete';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { syncPropertyDetailsFromPf } from '@/services/property.service';

interface LocationsTabProps {
    register: UseFormRegister<any>;
    control: Control<any>;
    errors: FieldErrors<any>;
    watch: UseFormWatch<any>;
    setValue: UseFormSetValue<any>;
    propertyId?: string; // Optional property ID for syncing
}

export function LocationsTab({ register, control, errors, watch, setValue, propertyId }: LocationsTabProps) {
    const address = watch('address');
    const latitude = watch('latitude');
    const longitude = watch('longitude');
    const furnishingType = watch('furnishingType');
    const pfLocationId = watch('pfLocationId');
    const pfLocationPath = watch('pfLocationPath');
    const [isSyncing, setIsSyncing] = React.useState(false);

    const handleAddressChange = (newAddress: string, lat: number, lng: number) => {
        setValue('address', newAddress);
        setValue('latitude', lat);
        setValue('longitude', lng);
    };

    const handleSyncFromPf = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!propertyId) return;

        setIsSyncing(true);
        try {
            const updated = await syncPropertyDetailsFromPf(propertyId);
            if (updated.pfLocationId) {
                setValue('pfLocationId', updated.pfLocationId);
                setValue('pfLocationPath', updated.pfLocationPath);
                toast.success('Location synced from Property Finder!');
            } else {
                toast.info('No location data found on Property Finder listing.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to sync from Property Finder');
        } finally {
            setIsSyncing(false);
        }
    };

    const handlePfLocationChange = (location: any) => {
        setValue('pfLocationId', location.id);
        const path = location.path || location.name || '';
        setValue('pfLocationPath', path);
        // Decoupled: Do not update address/lat/lng based on PF location selection
    };

    const handleMarkerDrag = (lat: number, lng: number, address: string) => {
        setValue('latitude', lat);
        setValue('longitude', lng);
        setValue('address', address);
    };

    return (
        <div className="space-y-6">
            {/* PF Location Search - Primary for Sync */}
            <div className="space-y-2.5">
                <Label className="text-[15px] font-medium text-gray-700">
                    Property Finder Location <span className="text-red-500">*</span>
                    <span className="text-xs font-normal text-gray-500 ml-2">(Required for Portal Sync)</span>
                </Label>
                <PfLocationAutocomplete
                    value={pfLocationPath}
                    pfLocationId={pfLocationId}
                    onChange={handlePfLocationChange}
                    placeholder="Search location (e.g. Marina Gate, Downtown Dubai...)"
                />
                {/* Hidden input to ensure validation if needed, or rely on form validation for pfLocationId */}
                <input type="hidden" {...register('pfLocationId', { required: 'Property Finder Location is required' })} />
                {errors.pfLocationId && <p className="text-sm text-red-500">{errors.pfLocationId.message as string}</p>}
            </div>

            {/* Row 1: Address and Furnishing Type */}
            <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2.5">
                    <Label htmlFor="address" className="text-[15px] font-medium text-gray-700">
                        Map Address (Google Maps)
                    </Label>
                    <AddressAutocomplete
                        value={address || ''}
                        onChange={(addr, lat, lng) => {
                            setValue('address', addr);
                            setValue('latitude', lat);
                            setValue('longitude', lng);
                        }}
                        error={errors.address?.message as string}
                    />
                    {errors.address && <p className="text-sm text-red-500">{errors.address.message as string}</p>}
                </div>

                <div className="space-y-2.5">
                    {/* ... existing furnishing type ... */}
                    <Label className="text-[15px] font-medium text-gray-700">
                        Furnishing Type <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                        name="furnishingType"
                        control={control}
                        rules={{ required: 'Furnishing type is required' }}
                        render={({ field }) => (
                            <div className="flex items-center gap-6 h-[50px]">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <div className={cn(
                                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                                        field.value === 'Furnished' ? "border-[#00AAFF]" : "border-gray-300"
                                    )}>
                                        {field.value === 'Furnished' && (
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#00AAFF]" />
                                        )}
                                    </div>
                                    <input
                                        type="radio"
                                        value="Furnished"
                                        checked={field.value === 'Furnished'}
                                        onChange={() => field.onChange('Furnished')}
                                        className="sr-only"
                                    />
                                    <span className="text-[15px] text-gray-700">Furnished</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <div className={cn(
                                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                                        field.value === 'Semi Furnished' ? "border-[#00AAFF]" : "border-gray-300"
                                    )}>
                                        {field.value === 'Semi Furnished' && (
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#00AAFF]" />
                                        )}
                                    </div>
                                    <input
                                        type="radio"
                                        value="Semi Furnished"
                                        checked={field.value === 'Semi Furnished'}
                                        onChange={() => field.onChange('Semi Furnished')}
                                        className="sr-only"
                                    />
                                    <span className="text-[15px] text-gray-700">Semi Furnished</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <div className={cn(
                                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                                        field.value === 'Unfurnished' ? "border-[#00AAFF]" : "border-gray-300"
                                    )}>
                                        {field.value === 'Unfurnished' && (
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#00AAFF]" />
                                        )}
                                    </div>
                                    <input
                                        type="radio"
                                        value="Unfurnished"
                                        checked={field.value === 'Unfurnished'}
                                        onChange={() => field.onChange('Unfurnished')}
                                        className="sr-only"
                                    />
                                    <span className="text-[15px] text-gray-700">Unfurnished</span>
                                </label>
                            </div>
                        )}
                    />
                    {errors.furnishingType && <p className="text-sm text-red-500">{errors.furnishingType.message as string}</p>}
                </div>
            </div>

            {/* Map */}
            <PropertyMap
                address={address}
                latitude={latitude}
                longitude={longitude}
                onAddressChange={handleAddressChange}
                onMarkerDrag={handleMarkerDrag}
                className="h-[400px]"
            />
        </div>
    );
}
