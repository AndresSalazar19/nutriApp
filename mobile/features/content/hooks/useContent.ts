import { useState, useEffect, useCallback } from 'react';
import { ContentService, ContentItem, ContentDetail } from '../services/contentService';

export function useContent() {
  const [items, setItems]     = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    ContentService.getApproved({ limit: 50 })
      .then(setItems)
      .catch((e) => setError(e?.message ?? 'Error al cargar'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { items, loading, error, refresh };
}

export function useContentDetail(id: string) {
  const [content, setContent] = useState<ContentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    ContentService.getById(id)
      .then(setContent)
      .catch((e) => setError(e?.message ?? 'Error al cargar'))
      .finally(() => setLoading(false));
  }, [id]);

  return { content, loading, error };
}
