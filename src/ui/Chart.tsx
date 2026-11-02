import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { c, s } from './theme';
import type { Analytics, Breakdown } from '../core/types';
import { compact } from '../core/validation';

export function TrendChart({ data, dark = false }: { data: Analytics['clickTrend']; dark?: boolean }) {
  if (!data.length) return <View style={{ height: 130, alignItems: 'center', justifyContent: 'center' }}><Text style={[s.muted, dark ? { color: '#B7C7B7' } : null]}>Your clicks will appear here.</Text></View>;
  const width = 320, height = 125, pad = 8;
  const max = Math.max(...data.map(x => Number(x.clicks) || 0), 1);
  const points = data.map((d, i) => ({ x: pad + i * (width - 2 * pad) / Math.max(data.length - 1, 1), y: height - pad - (Number(d.clicks) || 0) / max * (height - pad * 3) }));
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ');
  const last = points[points.length - 1];
  const stroke = dark ? c.lime : c.green;
  return <View accessible accessibilityLabel={`Click trend. ${data.map(d => `${d.name}: ${d.clicks}`).join(', ')}`}><Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}><Defs><LinearGradient id={dark ? 'darkFill' : 'lightFill'} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={stroke} stopOpacity={dark ? .24 : .18} /><Stop offset="1" stopColor={stroke} stopOpacity="0" /></LinearGradient></Defs>{[.25, .6, 1].map(v => <Path key={v} d={`M0,${height * v - 4} H${width}`} stroke={dark ? '#354C3E' : c.line} strokeWidth={1} strokeDasharray="3 5" />)}<Path d={`${line} L${last.x},${height} L${points[0].x},${height} Z`} fill={`url(#${dark ? 'darkFill' : 'lightFill'})`} /><Path d={line} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><Circle cx={last.x} cy={last.y} r={4} fill={stroke} /></Svg><View style={[s.between, { marginTop: 6 }]}>{[0, Math.floor((data.length - 1) / 2), data.length - 1].filter((v, i, a) => a.indexOf(v) === i).map(i => <Text key={i} style={[s.small, { color: dark ? '#B7C7B7' : c.muted }]}>{data[i].name}</Text>)}</View></View>;
}
export function BreakdownList({ data, total }: { data: Breakdown[]; total?: number }) {
  const sum = total || data.reduce((n, d) => n + Number(d.value), 0) || 1;
  return <View style={{ gap: 18 }}>{data.length ? data.slice(0, 5).map((item, i) => <View key={`${item.name}-${i}`} style={{ gap: 7 }}><View style={s.between}><Text style={[s.body, { fontSize: 14 }]}>{item.name || 'Unknown'}</Text><Text style={{ fontSize: 13, fontWeight: '600', color: c.ink }}>{compact(Number(item.value))} <Text style={{ color: c.muted, fontWeight: '400' }}>· {Math.round(Number(item.value) / sum * 100)}%</Text></Text></View><View style={{ height: 5, backgroundColor: c.pale, borderRadius: 4, overflow: 'hidden' }}><View style={{ height: 5, width: `${Math.min(100, Number(item.value) / sum * 100)}%`, backgroundColor: [c.green, '#92AE74', '#BED59E', c.lime, '#DCE7D1'][i], borderRadius: 4 }} /></View></View>) : <Text style={s.muted}>Share a link to start seeing your audience.</Text>}</View>;
}
