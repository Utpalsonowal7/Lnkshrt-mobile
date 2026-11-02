export interface User { id: number; email: string; name?: string | null }
export interface Session { user: User; accessToken: string; refreshToken: string }
export interface Envelope<T> { data: T; success: boolean; message: string; statusCode: number }
export interface ShortLink {
  id: number;
  shortCode: string;
  shortUrl: string;
  longUrl: string;
  title: string | null;
  tags: string[];
  totalClicks: number;
  isActive: boolean;
  is_password_protected: boolean;
  createdAt: string;
  expiresAt: string | null;
  domain?: { domain: string } | null;
}
export interface LinkPage {
  links: ShortLink[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}
export interface CreateLink {
  longUrl: string;
  title?: string;
  customCode?: string;
  password?: string;
  tags?: string[];
  expiresAt?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}
export type Range = '7' | '30' | 'all';
export interface Breakdown { name: string; value: number }
export interface Analytics {
  totalLinks: number;
  activeLinks: number;
  expiredLinks: number;
  pausedLinks: number;
  totalClicks: number;
  uniqueVisitors: number;
  avgDailyClicks: number;
  countriesReached: number;
  clickTrend: { name: string; clicks: number }[];
  countriesData: Breakdown[];
  devices: Breakdown[];
  browsers: Breakdown[];
  referrers: { source: string; clicks: number }[];
  topLinks: { id: number; desc: string | null; shortLink: string; shortUrl?: string; clicks: number }[];
  recentClicks: { timestamp: string; country: string; city: string; browser: string; device: string; referrer: string }[];
}
export interface LinkDetail extends ShortLink { status?: string; passwordProtected?: boolean; analytics: Analytics }
export interface Stats { totalLinks: number; totalClicks: number; clicksToday: number; activeLinks: number }
