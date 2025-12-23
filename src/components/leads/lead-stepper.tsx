import { Check } from "lucide-react";
import React from "react";

interface Step {
    title: string;
    description: string;
}

interface LeadStepperProps {
    steps: Step[];
    currentStep: number;
}

export function LeadStepper({ steps, currentStep }: LeadStepperProps) {
    return (
        <div className="h-full w-full rounded-[32px] bg-[#f6fbff] p-10 shadow-[0_18px_48px_rgba(37,92,161,0.08)]">
            <h2 className="text-[26px] font-semibold text-[#1f2837]">Add New Lead</h2>
            <div className="mt-12 space-y-10">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;

                    return (
                        <div key={step.title} className="relative flex items-start gap-4">
                            <div className="flex flex-col items-center">
                                <div
                                    className={[
                                        "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold shadow-sm",
                                        isCompleted ? "border-[#36c16c] bg-white text-[#36c16c]" :
                                            isCurrent ? "border-[#2aa0ff] bg-[#2aa0ff] text-white" :
                                                "border-[#e4ecf7] bg-white text-[#a0acc0]"
                                    ].join(" ")}
                                >
                                    {isCompleted ? <Check className="h-5 w-5" /> : index + 1}
                                </div>
                                {index !== steps.length - 1 && (
                                    <div className="mt-1 h-16 w-[2px] bg-[#dce8f8]" />
                                )}
                            </div>
                            <div className="pt-1">
                                <div className={`text-lg font-semibold ${isCompleted || isCurrent ? "text-[#1b2430]" : "text-[#97a3b7]"}`}>
                                    {step.title}
                                </div>
                                <div className="mt-1 text-sm text-[#97a3b7]">
                                    {step.description}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

