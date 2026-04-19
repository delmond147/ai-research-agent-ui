import React, { useState, useEffect } from 'react';
import { Check, Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  topic: string;
}

const STEPS = [
  "Searching the web",
  "Analysing sources",
  "Generating report"
];

const LoadingScreen: React.FC<LoadingScreenProps> = ({ topic }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Simulate progression of steps for visual feedback
    // In a real SSE implementation, this would be reactive to backend events
    const timers = [
      setTimeout(() => setCurrentStep(0), 0),
      setTimeout(() => setCurrentStep(1), 5000),
      setTimeout(() => setCurrentStep(2), 12000),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-bg-primary text-text-primary px-6">
      <div className="w-full max-w-2xl space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-medium tracking-tight">{topic}</h2>
          <p className="text-text-muted">Intelligence engine at work</p>
        </div>

        {/* Step Tracker */}
        <div className="space-y-6 max-w-sm mx-auto">
          {STEPS.map((step, idx) => (
            <div key={step} className="flex items-center space-x-4">
              <div 
                className="flex items-center justify-center transition-all"
                style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%',
                  backgroundColor: idx < currentStep ? 'var(--chart-2)' : idx === currentStep ? 'var(--accent)' : 'transparent',
                  border: idx <= currentStep ? 'none' : '1px solid var(--border-color)'
                }}
              >
                {idx < currentStep ? (
                  <Check size={14} color="white" />
                ) : idx === currentStep ? (
                  <Loader2 size={14} color="white" className="animate-spin" />
                ) : null}
              </div>
              <span className={`text-sm font-medium transition-all ${
                idx <= currentStep ? 'text-text-primary' : 'text-text-muted'
              }`}>
                {step}
              </span>
            </div>
          ))}
        </div>

        {/* Skeleton Report Layout Preview */}
        <div className="pt-12" style={{ opacity: 0.4, userSelect: 'none', pointerEvents: 'none' }}>
          <div className="card p-8 space-y-6 relative" style={{ overflow: 'hidden' }}>
            <div className="skeleton rounded-lg" style={{ height: '32px', width: '75%' }} />
            <div className="skeleton rounded-lg" style={{ height: '16px', width: '100%' }} />
            <div className="skeleton rounded-lg" style={{ height: '16px', width: '83%' }} />
            
            <div className="flex gap-4 pt-4" style={{ marginTop: '24px' }}>
              <div className="skeleton" style={{ flex: 1, height: '128px', borderRadius: '12px' }} />
              <div className="skeleton" style={{ flex: 1, height: '128px', borderRadius: '12px' }} />
            </div>
            
            <div className="absolute inset-0" style={{ top: 'auto', height: '96px', background: 'linear-gradient(to top, var(--bg-primary), transparent)' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
