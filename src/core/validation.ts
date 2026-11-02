import type { CreateLink, ShortLink } from './types';

export function validateLink(input: CreateLink): string | null {
  try {
    const url = new URL(input.longUrl.trim());
    if (!['https:', 'http:'].includes(url.protocol) || !url.hostname) return 'Enter an HTTP or HTTPS website address.';
  } catch { return 'Enter a valid website address, including https://.'; }
  if (input.longUrl.trim().length > 2048) return 'The destination URL must be under 2,048 characters.';
  if ((input.title?.trim().length ?? 0) > 120) return 'Keep the title within 120 characters.';
  if (input.customCode && !/^[a-zA-Z0-9_-]{3,15}$/.test(input.customCode)) return 'Use 3–15 letters, numbers, hyphens or underscores for your alias.';
  if (input.password && (input.password.length < 5 || input.password.length > 100)) return 'The link password must be 5–100 characters.';
  if (input.tags && (input.tags.length > 10 || input.tags.some(tag => tag.length > 30))) return 'Use up to 10 tags with at most 30 characters each.';
  if (input.expiresAt && (!Number.isFinite(Date.parse(input.expiresAt)) || Date.parse(input.expiresAt) <= Date.now())) return 'Choose an expiry time in the future.';
  if ((input.utmSource?.length ?? 0) > 100 || (input.utmMedium?.length ?? 0) > 100 || (input.utmCampaign?.length ?? 0) > 150) return 'Campaign fields are too long.';
  return null;
}
export function validateEmail(value: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()); }
export function validatePassword(value: string) {
  return value.length >= 8 && value.length <= 100 && /[A-Z]/.test(value) && /[0-9]/.test(value) && /[^a-zA-Z0-9]/.test(value);
}
export function linkStatus(link: Pick<ShortLink, 'expiresAt' | 'isActive'>): 'Active' | 'Expired' | 'Paused' {
  if (link.expiresAt && Date.parse(link.expiresAt) <= Date.now()) return 'Expired';
  return link.isActive ? 'Active' : 'Paused';
}
export function hostname(value: string) { try { return new URL(value).hostname.replace(/^www\./, ''); } catch { return value; } }
export function compact(value: number) { return new Intl.NumberFormat('en', { notation: value >= 10000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(value); }
export function relativeDate(value: string) {
  const days = Math.floor((Date.now() - Date.parse(value)) / 86400000);
  return days <= 0 ? 'Today' : days === 1 ? 'Yesterday' : days < 7 ? `${days} days ago` : new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
