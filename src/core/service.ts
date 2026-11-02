import { ApiClient } from './client';
import type { Analytics, CreateLink, LinkDetail, LinkPage, Range, Stats } from './types';

export interface LinkService {
  links(page: number, search: string): Promise<LinkPage>;
  stats(): Promise<Stats>;
  analytics(range: Range): Promise<Analytics>;
  detail(id: number, range: Range): Promise<LinkDetail>;
  create(input: CreateLink): Promise<{ longUrl: string; shortLink: string }>;
  delete(id: number): Promise<void>;
  protect(id: number, password: string): Promise<void>;
}
export function liveService(api: ApiClient): LinkService {
  return {
    links: (page, search) => api.request(`/links?page=${page}&limit=20&search=${encodeURIComponent(search)}`),
    stats: () => api.request('/links/stats'),
    analytics: async range => (await api.request<{ analytcs: Analytics }>(`/links/overall-analytcs?range=${range}`)).analytcs,
    detail: (id, range) => api.request(`/links/${id}?range=${range}`),
    create: input => api.request('/links', 'POST', input),
    delete: async id => { await api.request(`/links/${id}`, 'DELETE'); },
    protect: async (id, password) => { await api.request(`/links/${id}`, 'POST', { password }); },
  };
}
