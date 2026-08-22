import { cn } from '@/lib/utils';
import { Check, MapPin } from 'lucide-react';
import { useLocaleStore } from '@/store/localeStore';
import { t } from '@/i18n';

interface StepNavigationProps {
  mode: 'drama' | 'legacy';
  currentStep: number;
  onStepClick?: (step: number) => void;
  /** drama 模式：route 1 = PlanOverview（策劃案總覽）是否為當前 */
  isPlanOverview?: boolean;
  /** drama 模式：點擊 PlanOverview 標記的 callback */
  onPlanOverviewClick?: () => void;
  className?: string;
}

export function StepNavigation({ mode, currentStep, onStepClick, isPlanOverview, onPlanOverviewClick, className }: StepNavigationProps) {
  const { locale } = useLocaleStore();
  const tr = t();
  void locale;

  const dramaSteps = [
    tr.creator.dramaSteps.s0,
    tr.creator.dramaSteps.s1,
    tr.creator.dramaSteps.s2,
    tr.creator.dramaSteps.s3,
    tr.creator.dramaSteps.s4,
    tr.creator.dramaSteps.s5,
    tr.creator.dramaSteps.s6,
    tr.creator.dramaSteps.s7,
    tr.creator.dramaSteps.s8,
    tr.creator.dramaSteps.s9,
  ];

  const legacySteps = [
    tr.creator.legacySteps.s0,
    tr.creator.legacySteps.s1,
    tr.creator.legacySteps.s2,
    tr.creator.legacySteps.s3,
    tr.creator.legacySteps.s4,
    tr.creator.legacySteps.s5,
    tr.creator.legacySteps.s6,
    tr.creator.legacySteps.s7,
    tr.creator.legacySteps.s8,
    tr.creator.legacySteps.s9,
  ];

  const steps = mode === 'drama' ? dramaSteps : legacySteps;

  return (
    <nav className={cn('flex flex-col gap-1 py-4', className)}>
      {steps.map((label, i) => {
        const done = i < currentStep;
        const active = i === currentStep && !isPlanOverview;
        return (
          <>
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
            {/* PlanOverview 視覺標記：插在 S0（index 0）後面 */}
            {mode === 'drama' && i === 0 && (
              <button
                key="plan-overview"
                onClick={onPlanOverviewClick}
                className={cn(
                  'flex items-center gap-2 px-4 py-1.5 ml-2 rounded-lg text-xs text-left transition-colors border-l-2',
                  isPlanOverview
                    ? 'border-accent text-accent font-semibold bg-accent/5'
                    : currentStep > 0
                      ? 'border-green-400 text-green-600 hover:bg-green-50'
                      : 'border-line text-muted hover:bg-gray-50',
                )}
              >
                <MapPin size={11} className="shrink-0" />
                策劃案總覽
              </button>
            )}
          </>
        );
      })}
    </nav>
  );
}
