import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const DRAMA_STEPS = ['立項', '取材', '劇本', '分鏡', '畫面', '字幕', '配音', '合成', '送審', '發佈'];
const LEGACY_STEPS = ['立項', '授權', '訪談', '轉錄', '故事線', '素材', '旁白', '剪輯', '送審', '發佈'];

interface StepNavigationProps {
  mode: 'drama' | 'legacy';
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

export function StepNavigation({ mode, currentStep, onStepClick, className }: StepNavigationProps) {
  const steps = mode === 'drama' ? DRAMA_STEPS : LEGACY_STEPS;
  return (
    <nav className={cn('flex flex-col gap-1 py-4', className)}>
      {steps.map((label, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        return (
          <button
            key={i}
            onClick={() => onStepClick?.(i)}
            className={cn(
              'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-left transition-colors',
              active && 'bg-primary text-white font-semibold',
              done && 'text-primary font-medium hover:bg-primary/5',
              !active && !done && 'text-muted hover:bg-gray-50',
            )}
          >
            <span className={cn(
              'flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold shrink-0',
              active && 'bg-white text-primary',
              done && 'bg-green-500 text-white',
              !active && !done && 'bg-line text-muted',
            )}>
              {done ? <Check size={11} /> : i}
            </span>
            {label}
          </button>
        );
      })}
    </nav>
  );
}
