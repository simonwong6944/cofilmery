/**
 * useTts — TTS voiceover hook.
 * Returns an audio blob URL ready for <audio> playback.
 *
 * Usage:
 *   const { generate, loading, audioUrl, credits, error } = useTts();
 *   await generate({ text, language: 'cantonese' });
 *   return <audio src={audioUrl} controls />;
 */
import { useState, useCallback } from 'react';
import { generateTts, type TtsResult } from '@/adapters';

export interface TtsState {
  loading:  boolean;
  result:   TtsResult | null;
  error:    string | null;
}

export function useTts() {
  const [state, setState] = useState<TtsState>({ loading: false, result: null, error: null });

  const generate = useCallback(async (params: {
    text: string;
    voiceId?: string;
    language?: 'cantonese' | 'mandarin';
    userId?: string;
    episodeId?: string;
  }) => {
    setState({ loading: true, result: null, error: null });
    try {
      const result = await generateTts(params);
      setState({ loading: false, result, error: null });
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setState({ loading: false, result: null, error: msg });
      throw e;
    }
  }, []);

  return {
    loading:   state.loading,
    audioUrl:  state.result?.audioBlobUrl ?? null,
    duration:  state.result?.durationEstimate ?? 0,
    credits:   state.result?.creditsConsumed ?? 0,
    error:     state.error,
    generate,
  };
}
