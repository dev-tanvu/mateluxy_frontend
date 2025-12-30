'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Property, getProperties } from '@/services/property.service';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Building2, BedDouble, Bath } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface SelectPropertyModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (property: Property) => void;
}

export function SelectPropertyModal({ open, onOpenChange, onSelect }: SelectPropertyModalProps) {
    const [search, setSearch] = useState('');
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(false);

    // Debounce search using simple timeout
    useEffect(() => {
        const timer = setTimeout(() => {
            if (open) {
                fetchProperties(search);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search, open]);

    const fetchProperties = async (searchTerm: string) => {
        setLoading(true);
        try {
            const data = await getProperties({
                page: 1,
                limit: 50,
                search: searchTerm || undefined,
            });
            setProperties(data.data);
        } catch (error) {
            console.error('Failed to fetch properties', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden bg-white/95 backdrop-blur-xl border-white/20">
                <DialogHeader className="p-4 pb-2 border-b border-gray-100">
                    <DialogTitle className="text-lg font-semibold text-gray-900">Select Property</DialogTitle>
                    <div className="relative mt-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search by title, reference, or location..."
                            className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-all duration-200"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </DialogHeader>

                <div className="h-[400px] overflow-y-auto">
                    <div className="p-2 space-y-1">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="p-3 flex gap-3">
                                    <Skeleton className="w-16 h-16 rounded-lg" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                </div>
                            ))
                        ) : properties.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                                <Building2 className="w-8 h-8 mb-2 opacity-50" />
                                <p className="text-sm">No properties found</p>
                            </div>
                        ) : (
                            properties.map((property) => (
                                <button
                                    key={property.id}
                                    onClick={() => {
                                        onSelect(property);
                                        onOpenChange(false);
                                    }}
                                    className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors flex gap-3 group border border-transparent hover:border-gray-100"
                                >
                                    {/* Image Thumbnail */}
                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                                        {property.coverPhoto ? (
                                            <img
                                                src={property.coverPhoto}
                                                alt=""
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <Building2 className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <div className="flex items-start justify-between gap-2">
                                            <h4 className="font-medium text-gray-900 truncate pr-2">
                                                {property.propertyTitle || 'Untitled Property'}
                                            </h4>
                                            <Badge variant="secondary" className="text-[10px] h-5 bg-gray-100 text-gray-600 font-medium border-0">
                                                {property.reference || 'No Ref'}
                                            </Badge>
                                        </div>

                                        <div className="mt-1 flex items-center gap-1 text-xs text-gray-500 truncate">
                                            <MapPin className="w-3 h-3 flex-shrink-0 text-gray-400" />
                                            <span className="truncate">{property.address || property.pfLocationPath || 'Location not specified'}</span>
                                        </div>

                                        <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-400">
                                            {property.bedrooms != null && (
                                                <div className="flex items-center gap-1">
                                                    <BedDouble className="w-3 h-3" />
                                                    <span>{property.bedrooms} Bed</span>
                                                </div>
                                            )}
                                            {property.bathrooms != null && (
                                                <div className="flex items-center gap-1">
                                                    <Bath className="w-3 h-3" />
                                                    <span>{property.bathrooms} Bath</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
