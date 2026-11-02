import type { LinkService } from './service';
import type { Analytics, ShortLink } from './types';
import { linkStatus } from './validation';

/** Fictional data. This service never sends requests or creates public short URLs. */
export function createDemoService(): LinkService {
  const now = new Date();
  const seeds = [
    ['My portfolio', 'portfolio', 'https://example.com/portfolio', 1284, ['Personal']],
    ['Summer collection', 'summer', 'https://example.com/collection/summer', 876, ['Campaign']],
    ['Latest project', 'project', 'https://example.com/projects/latest', 428, ['Work']],
    ['Download the guide', 'guide', 'https://example.com/resources/guide.pdf', 216, ['Resources']],
    ['Community invite', 'hello', 'https://example.com/community', 152, ['Community']],
  ] as const;
  let links: ShortLink[] = seeds.map((s, i) => ({ id: i + 1, title: s[0], shortCode: s[1], shortUrl: `https://lnkshrt.example/${s[1]}`, longUrl: s[2], totalClicks: s[3], tags: [...s[4]], isActive: true, is_password_protected: i === 3, createdAt: new Date(now.getTime() - i * 86400000).toISOString(), expiresAt: null }));
  let nextId = 6;
  function analytics(): Analytics {
    const clicks = links.reduce((n, l) => n + l.totalClicks, 0);
    return {
      totalLinks: links.length, activeLinks: links.filter(l => linkStatus(l) === 'Active').length, expiredLinks: links.filter(l => linkStatus(l) === 'Expired').length, pausedLinks: 0,
      totalClicks: clicks, uniqueVisitors: Math.round(clicks * .69), avgDailyClicks: Math.round(clicks / 7), countriesReached: clicks ? 12 : 0,
      clickTrend: [.08, .12, .09, .19, .13, .15, .24].map((v, i) => ({ name: new Date(now.getTime() - (6 - i) * 86400000).toLocaleDateString('en', { weekday: 'short' }), clicks: Math.round(clicks * v) })),
      countriesData: [{ name: 'India', value: Math.round(clicks * .58) }, { name: 'United States', value: Math.round(clicks * .23) }, { name: 'United Kingdom', value: Math.round(clicks * .12) }, { name: 'Other', value: Math.round(clicks * .07) }],
      devices: [{ name: 'Mobile', value: Math.round(clicks * .72) }, { name: 'Desktop', value: Math.round(clicks * .24) }, { name: 'Tablet', value: Math.round(clicks * .04) }],
      browsers: [{ name: 'Chrome', value: Math.round(clicks * .65) }, { name: 'Safari', value: Math.round(clicks * .35) }],
      referrers: [{ source: 'Direct', clicks: Math.round(clicks * .6) }, { source: 'Instagram', clicks: Math.round(clicks * .4) }],
      topLinks: [...links].sort((a, b) => b.totalClicks - a.totalClicks).slice(0, 5).map(l => ({ id: l.id, desc: l.title, shortLink: l.shortCode, shortUrl: l.shortUrl, clicks: l.totalClicks })),
      recentClicks: clicks ? [{ timestamp: now.toISOString(), country: 'India', city: 'Guwahati', browser: 'Chrome', device: 'Mobile', referrer: 'Direct' }] : [],
    };
  }
  return {
    links: async (page, search) => {
      const filtered = links.filter(l => `${l.title} ${l.longUrl} ${l.shortCode}`.toLowerCase().includes(search.toLowerCase()));
      return { links: filtered.slice((page - 1) * 20, page * 20), pagination: { page, limit: 20, total: filtered.length, totalPages: Math.ceil(filtered.length / 20) } };
    },
    stats: async () => ({ totalLinks: links.length, totalClicks: analytics().totalClicks, clicksToday: analytics().clickTrend[6].clicks, activeLinks: analytics().activeLinks }),
    // All demo ranges intentionally share the same sample snapshot; the UI labels it as sample data.
    analytics: async () => analytics(),
    detail: async id => {
      const link = links.find(l => l.id === id);
      if (!link) throw new Error('Link no longer exists.');
      const a = analytics();
      const share = a.totalClicks ? link.totalClicks / a.totalClicks : 0;
      return { ...link, analytics: { ...a, totalClicks: link.totalClicks, uniqueVisitors: Math.round(link.totalClicks * .69), avgDailyClicks: Math.round(link.totalClicks / 7), clickTrend: a.clickTrend.map(v => ({ ...v, clicks: Math.round(v.clicks * share) })), countriesData: a.countriesData.map(v => ({ ...v, value: Math.round(v.value * share) })), devices: a.devices.map(v => ({ ...v, value: Math.round(v.value * share) })), countriesReached: link.totalClicks ? 12 : 0 } };
    },
    create: async input => {
      const code = input.customCode || `demo-${nextId}`;
      if (links.some(l => l.shortCode === code)) throw new Error('This alias is already taken.');
      const shortUrl = `https://lnkshrt.example/${code}`;
      links.unshift({ ...input, id: nextId++, title: input.title || null, shortCode: code, shortUrl, tags: input.tags || [], totalClicks: 0, isActive: true, is_password_protected: !!input.password, expiresAt: input.expiresAt || null, createdAt: new Date().toISOString() });
      return { longUrl: input.longUrl, shortLink: shortUrl };
    },
    delete: async id => { links = links.filter(l => l.id !== id); },
    protect: async id => { links = links.map(l => l.id === id ? { ...l, is_password_protected: true } : l); },
  };
}
