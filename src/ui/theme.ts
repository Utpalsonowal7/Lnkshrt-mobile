import { StyleSheet } from 'react-native';
export const c = { bg: '#F4F5F0', paper: '#FFFFFF', ink: '#1D2625', muted: '#747D79', line: '#E4E8DF', lime: '#DAFCA2', green: '#356546', pale: '#EDF3E8', red: '#B44040', redBg: '#FFF0EF', dark: '#1D3027' };
export const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  title: { fontSize: 32, lineHeight: 39, letterSpacing: -1.1, fontWeight: '700', color: c.ink },
  h2: { fontSize: 21, fontWeight: '700', letterSpacing: -.5, color: c.ink },
  body: { fontSize: 15, lineHeight: 23, color: c.ink },
  muted: { fontSize: 14, lineHeight: 21, color: c.muted },
  small: { fontSize: 12, lineHeight: 18, color: c.muted },
  card: { backgroundColor: c.paper, borderRadius: 22, borderWidth: 1, borderColor: c.line, padding: 20 },
  stack: { gap: 20 },
  page: { paddingHorizontal: 22, paddingTop: 20, paddingBottom: 30, gap: 24, width: '100%', maxWidth: 620, alignSelf: 'center' },
  chip: { backgroundColor: c.pale, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 },
});
