/**
 * useVideoGen — video generation with full submit→poll→download flow.
 *
 * Usage:
 *   const { submit, status, progress, videoUrl, credits, error } = useVideoGen();
 *   await submit({ prompt, frameImages, inputReferences, aspectRatio: '9:16' });
 *   // component re-renders on each progress tick
 */
import { useState, useCallback, useRef } from 'react';
import {
  submitVideoJob,
  pollVideoUntilDone,
  type VideoJobStatus,
} from '@/adapters';

// ── Config constants ─────────────────────────────────────────────────────────
export const VIDEO_POLL_INTERVAL_MS  = 3000;
export const VIDEO_POLL_MAX_ATTEMPTS = 120;

export type VideoGenPhase = 'idle' | 'submitting' | 'polling' | 'completed' | 'failed';

export interface VideoGenState {
  phase:      VideoGenPhase;
  jobId:      string | null;
  progress:   number | null;   // 0-100 or null if not provided by API
  videoUrl:   string | null;
  credits:    number;
  costUsd:    number;
  error:      string | null;
}

const INITIAL_STATE: VideoGenState = {
  phase: 'idle', jobId: null, progress: null,
  videoUrl: null, credits: 0, costUsd: 0, error: null,
};

export interface VideoSubmitParams {
  prompt: string;
  duration?: number;
  resolution?: string;
  aspectRatio?: string;
  frameImages?: string[];
  inputReferences?: string[];
  userId?: string;
  episodeId?: string;
  model?: string;
  pollIntervalMs?: number;
}

export function useVideoGen() {
  const [state, setState] = useState<VideoGenState>(INITIAL_STATE);
  const abortRef = useRef(false);

  const submit = useCallback(async (params: VideoSubmitParams): Promise<{ jobId: string; videoUrl: string | null }> => {
    abortRef.current = false;
    setState({ ...INITIAL_STATE, phase: 'submitting' });

    try {
      // 1. Submit job
      const { jobId } = await submitVideoJob({
        prompt:          params.prompt,
        duration:        params.duration,
        resolution:      params.resolution,
        aspectRatio:     params.aspectRatio ?? '9:16',
        frameImages:     params.frameImages,
        inputReferences: params.inputReferences,
        userId:          params.userId,
        episodeId:       params.episodeId,
        model:           params.model,
      });

      setState(s => ({ ...s, phase: 'polling', jobId, progress: 0 }));

      // 2. Poll until done
      const final: VideoJobStatus = await pollVideoUntilDone(
        jobId,
        (tick) => {
          if (abortRef.current) return;
          setState(s => ({
            ...s,
            progress: tick.progress ?? s.progress,
            phase: 'polling',
          }));
        },
        params.pollIntervalMs ?? VIDEO_POLL_INTERVAL_MS
      );

      if (abortRef.current) return { jobId, videoUrl: null };

      if (final.status === 'completed') {
        const videoUrl = final.videoUrl ?? null;
        setState({
          phase: 'completed',
          jobId,
          progress: 100,
          videoUrl,
          credits: final.creditsConsumed ?? 0,
          costUsd: final.costUsd ?? 0,
          error: null,
        });
        return { jobId, videoUrl };
      } else {
        setState(s => ({ ...s, phase: 'failed', error: 'Video generation failed on server' }));
        return { jobId, videoUrl: null };
      }
    } catch (e) {
      if (!abortRef.current) {
        const msg = e instanceof Error ? e.message : String(e);
        setState(s => ({ ...s, phase: 'failed', error: msg }));
      }
      throw e; // re-throw so VideoGenPanel catch block can handle
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current = true;
    setState(INITIAL_STATE);
  }, []);

  return { ...state, submit, reset };
}
