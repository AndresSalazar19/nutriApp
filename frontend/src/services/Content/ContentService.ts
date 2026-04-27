import { API_URL } from "../../config/api";
import { tokenStorage } from "../../utils/tokenStorage";

export interface ContentItem {
  id: string;
  title: string;
  category: string;
  content_type: string;
  tags: string[] | null;
  media_url: string | null;
  is_premium: boolean;
  published_at: string | null;
  view_count: number;
}

export const ContentService = {
  async getAll(params: {
    content_type?: string;
    category?: string;
    q?: string;
    skip?: number;
    limit?: number;
  }): Promise<ContentItem[]> {
    const query = new URLSearchParams();
    if (params.content_type) query.append('content_type', params.content_type);
    if (params.category)     query.append('category',     params.category);
    if (params.q)            query.append('q',            params.q);
    if (params.skip  != null) query.append('skip',  String(params.skip));
    if (params.limit != null) query.append('limit', String(params.limit));

    const token = tokenStorage.get() ?? '';
    const response = await fetch(`${API_URL}/content?${query.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    return data.data ?? [];
  },
};