/**
 * CreditDebitToast — shows a temporary "−N 積分" notification after AI generation.
 * Auto-dismisses after 4 seconds.
 *
 * Usage:
 *   const [show, setShow] = useState(false);
 *   const [debit, setDebit] = useState(0);
 *   // after AI call:
 *   setDebit(result.creditsConsumed); setShow(true);
 *   return <CreditDebitToast show={show} credits={debit} costUsd={result.costUsd} onClose={() => setShow(false)} />;
 */
import { useEffect } from 'react';
import { Zap, X } from 'lucide-react';
import { CREDIT } from '@/credit-config';

interface Props {
  show:       boolean;
  credits:    number;
  costUsd?:   number;
  label?:     string;
  onClose:    () => void;
}

export function CreditDebitToast({ show, credits, costUsd, label, onClose }: Props) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [show, onClose]);

  if (!show || credits === 0) return null;

  const hkd = (credits * CREDIT.pointToHKD).toFixed(2);

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in">
      <div className="flex items-center gap-3 bg-card border border-accent/30 shadow-lg rounded-xl px-4 py-3 min-w-[200px]">
        <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center shrink-0">
          <Zap size={16} className="text-accent" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-muted">{label ?? 'AI 生成完成'}</p>
          <p className="text-sm font-semibold text-ink">
            <span className="text-accent">−{credits}</span> 積分
            {costUsd ? <span className="text-xs text-muted font-normal ml-1">(HK${hkd})</span> : null}
          </p>
        </div>
        <button onClick={onClose} className="text-muted hover:text-ink transition-colors">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
