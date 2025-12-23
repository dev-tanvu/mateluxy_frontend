'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DeveloperSelectionStep } from '@/components/off-plan-properties/developer-selection-step';
import { PropertyDetailsStep } from '@/components/off-plan-properties/property-details-step';
import { useCreateOffPlanProperty } from '@/lib/hooks/use-off-plan-properties';
import { CreateOffPlanPropertyDto } from '@/lib/services/off-plan-property.service';
import { AddDeveloperSheet } from '@/components/developers/add-developer-sheet';

export default function AddOffPlanPropertyPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedDeveloperId, setSelectedDeveloperId] = useState<string>('');
    const [formData, setFormData] = useState<Partial<CreateOffPlanPropertyDto>>({});
    const [isAddDeveloperOpen, setIsAddDeveloperOpen] = useState(false);

    const { mutate: createProperty, isPending } = useCreateOffPlanProperty();

    const handleSelectDeveloper = (developerId: string) => {
        setSelectedDeveloperId(developerId);
    };

    const handleNext = () => {
        if (currentStep === 0 && selectedDeveloperId) {
            setCurrentStep(1);
        }
    };

    const handleBack = () => {
        if (currentStep === 1) {
            setCurrentStep(0);
        } else {
            router.back();
        }
    };

    const handlePropertySubmit = (data: CreateOffPlanPropertyDto) => {
        console.log('📝 handlePropertySubmit called with data:', data);
        console.log('🔄 Calling createProperty mutation...');

        // Publish with isActive = true
        createProperty({ ...data, isActive: true } as any, {
            onSuccess: () => {
                console.log('✅ Property published successfully! Redirecting...');
                router.push('/off-plan');
            },
            onError: (error) => {
                console.error('❌ Error creating property:', error);
            },
        });
    };

    const handleSaveAsDraft = (data: CreateOffPlanPropertyDto) => {
        console.log('💾 handleSaveAsDraft called with data:', data);

        // Save as draft with isActive = false
        createProperty({ ...data, isActive: false } as any, {
            onSuccess: () => {
                console.log('✅ Property saved as draft successfully! Redirecting...');
                router.push('/off-plan');
            },
            onError: (error) => {
                console.error('❌ Error saving draft:', error);
            },
        });
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <div className="p-8 space-y-8">
            {/* Navigation Buttons - Only for steps > 0 */}


            {/* Step Content */}
            <div className="max-w-7xl mx-auto">
                {currentStep === 0 && (
                    <DeveloperSelectionStep
                        selectedDeveloperId={selectedDeveloperId}
                        onSelectDeveloper={handleSelectDeveloper}
                        onAddDeveloper={() => setIsAddDeveloperOpen(true)}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                )}

                {currentStep === 1 && (
                    <PropertyDetailsStep
                        developerId={selectedDeveloperId}
                        initialData={formData}
                        onSubmit={handlePropertySubmit}
                        onSaveAsDraft={handleSaveAsDraft}
                        onCancel={handleCancel}
                    />
                )}
            </div>

            <AddDeveloperSheet
                isOpen={isAddDeveloperOpen}
                onClose={() => setIsAddDeveloperOpen(false)}
            />
        </div>
    );
}
