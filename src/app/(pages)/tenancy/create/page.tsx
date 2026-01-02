'use client';

import React, { useState } from 'react';
import { TenancyWizard } from '@/components/tenancy/tenancy-wizard';
import { PropertySelectionStep } from '@/components/tenancy/property-selection-step';
import { Property } from '@/services/property.service';
import { OffPlanProperty } from '@/lib/services/off-plan-property.service';

export default function CreateTenancyPage() {
    const [selectedProperty, setSelectedProperty] = useState<Property | OffPlanProperty | null>(null);

    return (
        <div className="min-h-screen bg-gray-50/50">
            {!selectedProperty ? (
                <PropertySelectionStep onSelect={setSelectedProperty} />
            ) : (
                <TenancyWizard
                    property={selectedProperty}
                    onBack={() => setSelectedProperty(null)}
                />
            )}
        </div>
    );
}
