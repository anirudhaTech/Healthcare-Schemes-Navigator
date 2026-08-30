import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  name: string;
  shortName: string;
}

interface ProgressBarProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (stepId: number) => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 w-full -z-0" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-600 transition-all duration-300 -z-0"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div
              key={step.id}
              onClick={() => {
                if (step.id <= currentStep) {
                  onStepClick(step.id);
                }
              }}
              className="flex flex-col items-center cursor-pointer group"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all z-10 ${
                  isCompleted
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/40'
                    : isCurrent
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-md'
                    : 'bg-white border-2 border-slate-300 text-slate-500 group-hover:border-slate-400'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step.id}
              </div>
              <span
                className={`text-[11px] font-semibold mt-2 text-center whitespace-nowrap transition-colors hidden sm:block ${
                  isCurrent
                    ? 'text-emerald-700 font-bold'
                    : isCompleted
                    ? 'text-slate-700'
                    : 'text-slate-400'
                }`}
              >
                {step.name}
              </span>
              <span
                className={`text-[10px] font-semibold mt-1 text-center whitespace-nowrap sm:hidden ${
                  isCurrent ? 'text-emerald-700 font-bold' : 'text-slate-400'
                }`}
              >
                {step.shortName}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
