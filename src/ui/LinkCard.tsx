import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { ArrowUpRight, Copy, Link2, LockKeyhole, MousePointer2 } from 'lucide-react-native';
import type { ShortLink } from '../core/types';
import { compact, hostname, linkStatus, relativeDate } from '../core/validation';
import { copyLink, IconButton, useToast } from './components';
import { c, s } from './theme';

export function LinkCard({ link, onPress }: { link: ShortLink; onPress(): void }) {
  const toast = useToast();
  const status = linkStatus(link);
  return <View style={[s.card, { padding: 17, gap: 15 }]}><Pressable accessibilityRole="button" accessibilityLabel={`View ${link.title || link.shortCode}`} onPress={onPress} style={[s.row, { gap: 12, minHeight: 48 }]}><View style={{ backgroundColor: c.pale, width: 43, height: 43, alignItems: 'center', justifyContent: 'center', borderRadius: 13 }}><Link2 size={21} color={c.green} /></View><View style={{ flex: 1, gap: 4 }}><Text numberOfLines={1} style={{ fontSize: 16, fontWeight: '700', color: c.ink }}>{link.title || hostname(link.longUrl)}</Text><Text numberOfLines={1} style={[s.small, { fontSize: 12 }]}>{hostname(link.longUrl)}</Text></View><ArrowUpRight size={19} color={c.muted} /></Pressable><View style={[s.between, { backgroundColor: c.bg, borderRadius: 11, paddingLeft: 12, gap: 3 }]}><Pressable accessibilityRole="button" accessibilityLabel={`View details for ${link.shortCode}`} onPress={onPress} style={{ flex: 1, justifyContent: 'center', minHeight: 44 }}><Text numberOfLines={1} style={{ fontSize: 13, fontWeight: '600', color: c.green }}>{link.shortUrl.replace(/^https?:\/\//, '')}</Text></Pressable><IconButton icon={Copy} label={`Copy ${link.shortCode}`} onPress={() => { void copyLink(link.shortUrl).then(() => toast('Short link copied')).catch(() => toast('Could not copy the link.')); }} /></View><View style={s.between}><View style={[s.row, { gap: 7 }]}><MousePointer2 size={13} color={c.muted} /><Text style={{ color: c.ink, fontSize: 12, fontWeight: '600' }}>{compact(link.totalClicks)} <Text style={{ fontWeight: '400', color: c.muted }}>clicks</Text></Text>{link.is_password_protected ? <LockKeyhole size={12} color={c.muted} /> : null}</View><View style={[s.row, { gap: 8 }]}><Text style={s.small}>{relativeDate(link.createdAt)}</Text><View style={{ width: 4, height: 4, borderRadius: 4, backgroundColor: c.line }} /><Text style={{ fontSize: 11, color: status === 'Active' ? c.green : c.muted }}>{status}</Text></View></View></View>;
}
