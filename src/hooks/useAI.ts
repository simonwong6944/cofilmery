/**
 * useAI — central hook for all AI interactions.
 * Wraps openRouterAdapter / mockAdapter (selected via VITE_AI_MODE).
 * Provides loading, error, creditsConsumed state per call.
 */
import { useState, useCallback } from 'react';
import { aiAdapter } from '@/adapters';
import type {
  AITextRequest, AITextResponse,
  AIScriptRequest, AIScriptResponse,
  ArchitectRequest, ArchitectResponse,
  AIVoiceRequest, AIVoiceResponse,
} from '@/adapters/types';

interface AIState<T> {
  data:      T | null;
  loading:   boolean;
  error:     string | null;
  credits:   number;          // credits consumed in last call
  costUsd:   number;          // USD cost in last call (0 for mock)
}

function useAIState<T>() {
  return useState<AIState<T>>({ data: null, loading: false, error: null, credits: 0, costUsd: 0 });
}

// ── Text generation ───────────────────────────────────────────────────────────
export function useTextGen() {
  const [state, setState] = useAIState<AITextResponse>();

  const generate = useCallback(async (req: AITextRequest) => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const data = await aiAdapter.generateText(req);
      setState({ data, loading: false, error: null, credits: data.creditsConsumed, costUsd: (data as AITextResponse & { costUsd?: number }).costUsd ?? 0 });
      return data;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setState(s => ({ ...s, loading: false, error: msg }));
      throw e;
    }
  }, []);

  return { ...state, generate };
}

// ── Script generation ─────────────────────────────────────────────────────────
export function useScriptGen() {
  const [state, setState] = useAIState<AIScriptResponse>();

  const generate = useCallback(async (req: AIScriptRequest) => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const data = await aiAdapter.generateScript(req);
      setState({ data, loading: false, error: null, credits: data.creditsConsumed, costUsd: 0 });
      return data;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setState(s => ({ ...s, loading: false, error: msg }));
      throw e;
    }
  }, []);

  return { ...state, generate };
}

// ── Story Architect ───────────────────────────────────────────────────────────
export function useArchitect() {
  const [state, setState] = useAIState<ArchitectResponse>();

  const generate = useCallback(async (req: ArchitectRequest) => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const data = await aiAdapter.generateArchitect(req);
      setState({
        data,
        loading: false,
        error: null,
        credits: data.creditsConsumed,
        costUsd: (data as ArchitectResponse & { costUsd?: number }).costUsd ?? 0,
      });
      return data;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setState(s => ({ ...s, loading: false, error: msg }));
      throw e;
    }
  }, []);

  return { ...state, generate };
}

// ── TTS voice generation ──────────────────────────────────────────────────────
export function useVoiceGen() {
  const [state, setState] = useAIState<AIVoiceResponse>();

  const generate = useCallback(async (req: AIVoiceRequest) => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const data = await aiAdapter.generateVoice(req);
      setState({ data, loading: false, error: null, credits: data.creditsConsumed, costUsd: 0 });
      return data;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setState(s => ({ ...s, loading: false, error: msg }));
      throw e;
    }
  }, []);

  return { ...state, generate };
}
