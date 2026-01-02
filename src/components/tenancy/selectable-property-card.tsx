import React from 'react';
import Image from 'next/image';
import { useQueryClient } from '@tanstack/react-query';
import { MapPin, BedDouble, Bath, Maximize2, Gauge, Eye } from 'lucide-react';
import { Property, getProperty } from '@/services/property.service';
import { calculatePropertyScore, getScoreColor } from '@/lib/utils/property-scoring';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface SelectablePropertyCardProps {
    property: Property;
    onSelect: (property: Property) => void;
    isSelected?: boolean;
}

export function SelectablePropertyCard({ property, onSelect, isSelected }: SelectablePropertyCardProps) {
    const queryClient = useQueryClient();
    const score = calculatePropertyScore(property);
    const scoreColor = getScoreColor(score);

    const handleCardHover = () => {
        queryClient.prefetchQuery({
            queryKey: ['property', property.id],
            queryFn: () => getProperty(property.id),
        });
    };

    const [imgSrc, setImgSrc] = React.useState(property.coverPhoto || '/placeholder-property.jpg');
    const [imgError, setImgError] = React.useState(false);

    return (
        <div
            onClick={() => onSelect(property)}
            onMouseEnter={handleCardHover}
            className={cn(
                "bg-white rounded-[16px] border transition-all duration-300 group flex flex-col w-full overflow-hidden cursor-pointer active:scale-[0.98]",
                isSelected ? "border-blue-500 ring-2 ring-blue-500/20" : "border-[#E6E6E6] hover:shadow-lg hover:border-blue-300"
            )}
        >
            {/* Image Section */}
            <div className="relative h-[200px] w-full p-[10px]">
                <div className="relative h-full w-full rounded-[10px] overflow-hidden bg-gray-100">
                    <img
                        src={imgSrc}
                        alt={property.propertyTitle || 'Property'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        onError={() => {
                            if (!imgError) {
                                setImgError(true);
                                setImgSrc('/placeholder-property.jpg');
                            }
                        }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    <div className="absolute top-3 left-3 flex gap-2">
                        <Badge variant="secondary" className={cn(
                            "text-white border-0 font-medium",
                            property.purpose === 'Rent' ? "bg-[#FF111180]" : "bg-[#00AAFF80]"
                        )}>
                            For {property.purpose?.toLowerCase()}
                        </Badge>
                        <Badge variant="secondary" className={cn(
                            "text-white border-0 font-medium",
                            property.isActive && property.pfPublished ? "bg-[#00AAFF]" : property.isActive ? "bg-gray-500" : "bg-white text-gray-700"
                        )}>
                            {property.isActive && property.pfPublished ? 'Published' : property.isActive ? 'Draft' : 'Draft'}
                        </Badge>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                        <Badge variant="secondary" className="bg-[#C6EAFF]/40 text-white border-[0.5px] border-[#25AFFF]/20 backdrop-blur-sm">
                            {property.propertyType || 'Apartment'}
                        </Badge>
                        <div className="text-white font-semibold text-[16px] drop-shadow-md">
                            {property.price?.toLocaleString()} AED
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="px-4 pb-4 pt-1 flex-1 flex flex-col">
                <h3 className="text-[16px] font-medium text-[#1A1A1A] mb-1 line-clamp-1">
                    {property.propertyTitle || 'Untitled Property'}
                </h3>

                <div className="flex items-center gap-1.5 text-[#8F9BB3] text-[12px] mb-3">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    <span className="line-clamp-1">{property.address || property.pfLocationPath || 'Location not specified'}</span>
                </div>

                <div className="flex items-center gap-4 mb-4 text-gray-400">
                    <div className="flex items-center gap-1">
                        <BedDouble className="h-4 w-4" />
                        <span className="text-[12px] font-medium">{property.bedrooms || 0}</span>
                    </div>
                    <div className="w-[1px] h-3 bg-gray-200" />
                    <div className="flex items-center gap-1">
                        <Bath className="h-3.5 w-3.5" />
                        <span className="text-[12px] font-medium">{property.bathrooms || 0}</span>
                    </div>
                    <div className="w-[1px] h-3 bg-gray-200" />
                    <div className="flex items-center gap-1">
                        <Maximize2 className="h-3.5 w-3.5" />
                        <span className="text-[12px] font-medium">{property.area || 0} sq.ft</span>
                    </div>
                </div>

                <div className="mt-auto pt-3 border-t border-[#EDF1F7] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="relative h-6 w-6 rounded-full overflow-hidden border border-gray-100">
                            <img src={property.assignedAgent?.photoUrl || '/placeholder-user.jpg'} alt="" className="object-cover w-full h-full" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-semibold text-[#1A1A1A]">{property.assignedAgent?.name || 'Unassigned'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <div className="flex px-[6px] items-center gap-1 h-[24px] rounded-full" style={{ backgroundColor: scoreColor.bg }}>
                            <Gauge className="w-2.5 h-2.5" style={{ color: scoreColor.icon }} />
                            <span className="text-[9px] font-semibold" style={{ color: scoreColor.text }}>{score}/100</span>
                        </div>
                        <div className="flex px-[6px] items-center gap-1 h-[24px] bg-[#E3F2FD] rounded-full">
                            <Eye className="w-2.5 h-2.5 text-[#2196F3]" />
                            <span className="text-[9px] font-semibold text-[#2196F3]">{property.leadsCount || 0} Leads</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
