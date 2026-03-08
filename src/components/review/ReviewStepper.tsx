"use client";

import { cn } from "@/lib/utils";

interface ReviewStepperProps {
  steps: string[];
  currentStep: number;
}

export function ReviewStepper({ steps, currentStep }: ReviewStepperProps) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-2 flex-1">
          <div
            className={cn(
              "flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium transition-colors",
              i <= currentStep
                ? "bg-falcon-600 text-falcon-50"
                : "bg-falcon-100 text-falcon-400"
            )}
          >
            {i + 1}
          </div>
          <span
            className={cn(
              "text-xs hidden sm:inline transition-colors",
              i <= currentStep ? "text-falcon-800" : "text-falcon-400"
            )}
          >
            {step}
          </span>
          {i < steps.length - 1 && (
            <div
              className={cn(
                "flex-1 h-px transition-colors",
                i < currentStep ? "bg-falcon-600" : "bg-falcon-200"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
