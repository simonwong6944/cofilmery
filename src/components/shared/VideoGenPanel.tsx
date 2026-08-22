/**
 * VideoGenPanel — video generation submit + progress + result UI.
 * Wraps useVideoGen hook and exposes a complete self-contained UI.
 *
 * Usage in S6VideoGen step:
 *   <VideoGenPanel
 *     prompt={buildVideoPrompt(episode, characters, aestheticLock)}
 *     frameImages={aestheticRefImages}
 *     inputReferences={charRefImages}
 *     aspectRatio="9:16"
 *     userId={user?.id}
 *     episodeId={episodeId}
 *     onComplete={(videoUrl, credits) => { ... }}
 *   />
 */
import { useState } from 'react';
import { Film, Play, RefreshCw, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useVideoGen, type VideoGenPhase } from '@/hooks/useVideoGen';
import { CreditDebitToast } from './CreditDebitToast';

interface Props {
  prompt:           string;
  frameImages?:     string[];
  inputReferences?: string[];
  aspectRatio?:     string;
  duration?:        number;
  resolution?:      string;
  userId?:          string;
  episodeId?:       string;
  onComplete?:      (videoUrl: string, credits: number) => void;
}

const PHASE_LABEL: Record<VideoGenPhase, string> = {
  idle:       '準備就緒',
  submitting: '正在提交任務…',
  polling:    '生成中…',
  completed:  '生成完成',
  failed:     '生成失敗',
};

export function VideoGenPanel({
  prompt, frameImages, inputReferences,
  aspectRatio = '9:16', duration = 5, resolution = '720p',
  userId, episodeId, onComplete,
}: Props) {
  const { phase, progress, videoUrl, credits, costUsd, error, submit, reset } = useVideoGen();
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = async () => {
    try {
      await submit({ prompt, frameImages, inputReferences, aspectRatio, duration, resolution, userId, episodeId });
      setShowToast(true);
      if (videoUrl && onComplete) onComplete(videoUrl, credits);
    } catch { /* error shown in UI */ }
  };

  const isActive = phase === 'submitting' || phase === 'polling';

  return (
    <div className="space-y-4">
      {/* Prompt preview */}
      <div className="bg-bg-soft rounded-xl border border-line p-4">
        <p className="text-xs font-semibold text-muted mb-1.5 flex items-center gap-1.5">
          <Film size={12} /> 生成指令預覽
        </p>
        <p className="text-sm text-ink leading-relaxed line-clamp-4">{prompt}</p>
        <div className="flex gap-2 mt-2 flex-wrap">
          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{aspectRatio}</span>
          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{duration}秒</span>
          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{resolution}</span>
          {frameImages?.length ? (
            <span className="text-[10px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">首格圖 ×{frameImages.length}</span>
          ) : null}
          {inputReferences?.length ? (
            <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">參考圖 ×{inputReferences.length}</span>
          ) : null}
        </div>
      </div>

      {/* Progress bar (during polling) */}
      {(phase === 'polling' || phase === 'submitting') && (
        <div className="bg-card rounded-xl border border-line p-4">
          <div className="flex items-center gap-3 mb-3">
            <Loader2 size={16} className="animate-spin text-primary" />
            <span className="text-sm text-ink font-medium">{PHASE_LABEL[phase]}</span>
          </div>
          <div className="w-full bg-line rounded-full h-2 overflow-hidden">
            <div
              className="h-2 bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
              style={{ width: `${progress !== null ? Math.max(progress, 5) : 30}%` }}
            />
          </div>
          {progress !== null && (
            <p className="text-xs text-muted mt-1.5 text-right">{progress}%</p>
          )}
          <p className="text-xs text-muted mt-2">影片生成需時 1–3 分鐘，請耐心等候…</p>
        </div>
      )}

      {/* Completed: video player */}
      {phase === 'completed' && videoUrl && (
        <div className="bg-card rounded-xl border border-green-200 overflow-hidden shadow-card">
          <div className="px-4 py-2.5 bg-green-50 border-b border-green-200 flex items-center gap-2">
            <CheckCircle size={14} className="text-green-600" />
            <span className="text-sm font-medium text-green-800">影片生成成功</span>
            <span className="ml-auto text-xs text-green-600">−{credits} 積分</span>
          </div>
          <video
            src={videoUrl}
            controls
            className="w-full"
            style={{ aspectRatio: aspectRatio.replace(':', '/') }}
          />
          <div className="px-4 py-2.5 flex gap-2">
            <a
              href={videoUrl}
              download={`episode-${episodeId ?? 'video'}.mp4`}
              className="flex-1 text-center text-sm text-primary border border-primary rounded-lg py-2 hover:bg-primary/5 transition-colors"
            >
              下載影片
            </a>
            <button
              onClick={reset}
              className="text-sm text-muted border border-line rounded-lg px-4 py-2 hover:bg-bg-soft transition-colors flex items-center gap-1.5"
            >
              <RefreshCw size={13} /> 重新生成
            </button>
          </div>
        </div>
      )}

      {/* Failed */}
      {phase === 'failed' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">生成失敗</p>
            <p className="text-xs text-red-600 mt-0.5">{error}</p>
          </div>
          <button onClick={reset} className="text-xs text-red-600 border border-red-300 rounded-lg px-3 py-1.5 hover:bg-red-100 transition-colors">
            重試
          </button>
        </div>
      )}

      {/* Submit button */}
      {(phase === 'idle' || phase === 'failed') && (
        <button
          onClick={handleSubmit}
          className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <Play size={16} />
          開始生成影片
        </button>
      )}

      {/* Cancel (during generation) */}
      {isActive && (
        <button
          onClick={reset}
          className="w-full text-muted border border-line py-2.5 rounded-xl text-sm hover:bg-bg-soft transition-colors"
        >
          取消
        </button>
      )}

      <CreditDebitToast
        show={showToast}
        credits={credits}
        costUsd={costUsd}
        label="影片生成"
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
