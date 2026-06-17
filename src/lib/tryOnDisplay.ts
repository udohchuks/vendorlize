import type { TryOnDisplayStatus } from './tryOnResponse';

export function formatProcessingMessage(elapsedSec: number): string {
  if (elapsedSec < 15) {
    return 'Aligning shoulder points and waist contours...';
  }
  if (elapsedSec < 45) {
    return 'AI generation in progress — this can take up to 90 seconds.';
  }
  return 'Still processing — please wait, the AI server may be busy.';
}

export function nextDisplayStatusAfterApi(
  parsedOk: boolean,
  mode?: 'ai' | 'fallback'
): TryOnDisplayStatus {
  if (!parsedOk) return 'failed';
  return 'success';
}

export function shouldShowAiResult(mode: 'ai' | 'fallback' | null, fitResult: string | null): boolean {
  return mode === 'ai' && !!fitResult;
}

export function shouldShowFallbackOverlay(
  mode: 'ai' | 'fallback' | null,
  fitResult: string | null
): boolean {
  return mode === 'fallback' && !!fitResult;
}
