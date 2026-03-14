import { useCallback, useRef } from 'react';

interface SSEStreamOptions<T> {
  url: string;
  body: unknown;
  onChunk: (data: T) => void;
  onDone?: () => void;
  onError?: (error: string) => void;
}

// Derive API base URL using the same logic as api-client.ts
function getSSEBaseUrl(): string {
  if (import.meta.env.MODE === 'development') return '';
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() !== '') return envUrl;
  return 'https://sqordia-production-api.proudwater-90136d2c.canadacentral.azurecontainerapps.io';
}

/**
 * Reusable hook for consuming SSE (Server-Sent Events) streams.
 * Uses fetch + ReadableStream instead of axios (which doesn't support SSE).
 */
export function useSSEStream() {
  const abortRef = useRef<AbortController | null>(null);

  const startStream = useCallback(async <T>(options: SSEStreamOptions<T>) => {
    const { url, body, onChunk, onDone, onError } = options;

    // Cancel any existing stream
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const baseUrl = getSSEBaseUrl();

      const response = await fetch(`${baseUrl}${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Send HttpOnly cookies
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        onError?.(`HTTP ${response.status}: ${response.statusText}`);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        onError?.('No response body');
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          const data = trimmed.slice(6);
          if (data === '[DONE]') {
            onDone?.();
            reader.cancel();
            return;
          }

          try {
            const parsed = JSON.parse(data) as T;
            onChunk(parsed);
          } catch {
            // Skip malformed JSON lines
          }
        }
      }

      // Stream ended naturally (no [DONE] received) — only call onDone if not already called
      onDone?.();
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      onError?.(err instanceof Error ? err.message : 'Stream failed');
    }
  }, []);

  const stopStream = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  return { startStream, stopStream };
}
