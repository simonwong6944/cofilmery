import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

// Drama Mode: S0-S9 correct labels (with Plan Overview as special pre-step)
const DRAMA_STEPS = [
  '系列設定',   // S0
  '資產庫',     // S1
  '角色設定',   // S2
  '故事框架',   // S3 (3a大綱→3b框架→3c分集)
  '分鏡',       // S4
  '關鍵幀',     // S5
  '影片生成',   // S6
  '粵語配音',   // S7
  '平台剪輯',   // S8
  '審批發佈',   // S9
];

// Legacy Mode: S0-S9 correct labels
const LEGACY_STEPS = [
  '專案設定',       // S0
  '素材庫',         // S1
  '人物設定',       // S2
  '訪談引導',       // S3
  '錄製',           // S4
  'AI轉錄校對',     // S5
  '執故事線',       // S6
  '字幕配樂',       // S7
  '平台剪輯',       // S8
  '授權發佈',       // S9
];

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
