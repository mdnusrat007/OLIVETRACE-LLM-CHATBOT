import { useState, useRef, useCallback } from 'react';

export function useStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');
  const [error, setError] = useState(null);
  const esRef = useRef(null);

  const startStream = useCallback(({ message, sessionId, provider, model, onStart, onDone }) => {
    setIsStreaming(true);
    setStreamedContent('');
    setError(null);

    const params = new URLSearchParams({ message, sessionId, provider, model });
    const es = new EventSource(`/api/chat/stream?${params}`);
    esRef.current = es;

    es.addEventListener('start', (e) => {
      const data = JSON.parse(e.data);
      onStart?.(data);
    });

    es.addEventListener('token', (e) => {
      const { token } = JSON.parse(e.data);
      setStreamedContent((prev) => prev + token);
    });

    es.addEventListener('done', (e) => {
      const data = JSON.parse(e.data);
      setIsStreaming(false);
      onDone?.(data);
      es.close();
    });

    es.addEventListener('error', (e) => {
      try {
        const data = JSON.parse(e.data || '{}');
        setError(data.message || 'Stream error');
      } catch {
        setError('Stream connection lost');
      }
      setIsStreaming(false);
      es.close();
    });
  }, []);

  const cancelStream = useCallback(() => {
    esRef.current?.close();
    setIsStreaming(false);
  }, []);

  return { isStreaming, streamedContent, error, startStream, cancelStream };
}
