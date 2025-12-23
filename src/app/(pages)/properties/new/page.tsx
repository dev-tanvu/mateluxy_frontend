'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { CategorySelectionStep } from '@/components/properties/category-selection-step';
import { Loader2 } from 'lucide-react';

// Loading component for dynamic chunks
const StepLoader = () => (
    <div className="flex w-full h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00B7FF]" />
    </div>
);

const PurposeSelectionStep = dynamic(
    () => import('@/components/properties/purpose-selection-step').then(mod => mod.PurposeSelectionStep),
    { loading: () => <StepLoader /> }
);

const NocSelectionStep = dynamic(
    () => import('@/components/properties/noc-selection-step').then(mod => mod.NocSelectionStep),
    { loading: () => <StepLoader /> }
);

const PropertyFormStep = dynamic(
    () => import('@/components/properties/property-form-step').then(mod => mod.PropertyFormStep),
    { loading: () => <StepLoader /> }
);

export default function AddPropertyPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState<'residential' | 'commercial' | ''>('');
    const [selectedPurpose, setSelectedPurpose] = useState<'sell' | 'rent' | ''>('');
    const [nocFile, setNocFile] = useState<File | null>(null);

    const handleCategorySelect = (category: 'residential' | 'commercial') => {
        setSelectedCategory(category);
    };

    const handlePurposeSelect = (purpose: 'sell' | 'rent') => {
        setSelectedPurpose(purpose);
    };

    const handleNext = () => {
        if (currentStep === 0 && selectedCategory) {
            setCurrentStep(1);
        } else if (currentStep === 1 && selectedPurpose) {
            setCurrentStep(2);
        } else if (currentStep === 2 && nocFile) {
            setCurrentStep(3);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        } else {
            router.back();
        }
    };

    return (
        <div className={`h-full p-8 ${currentStep === 3 ? '' : 'flex items-center justify-center'}`}>
            <div className={currentStep === 3 ? "w-full" : "w-full max-w-4xl"}>
                {currentStep === 0 && (
                    <CategorySelectionStep
                        selectedCategory={selectedCategory}
                        onSelectCategory={handleCategorySelect}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                )}

                {currentStep === 1 && (
                    <PurposeSelectionStep
                        selectedPurpose={selectedPurpose}
                        onSelectPurpose={handlePurposeSelect}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                )}

                {currentStep === 2 && (
                    <NocSelectionStep
                        file={nocFile}
                        onFileChange={setNocFile}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                )}

                {currentStep === 3 && (
                    <PropertyFormStep
                        nocFile={nocFile}
                        category={selectedCategory}
                        purpose={selectedPurpose}
                        onBack={handleBack}
                    />
                )}
            </div>
        </div>
    );
}
