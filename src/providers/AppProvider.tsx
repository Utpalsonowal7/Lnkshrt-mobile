import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { focusManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiClient, ApiError } from '../core/client';
import { API_URL } from '../core/config';
import { sessionStorage } from '../core/storage';
import { createDemoService } from '../core/demo';
import { liveService, type LinkService } from '../core/service';
import type { Session, User } from '../core/types';

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30000, retry: (count, error) => count < 1 && (!(error instanceof ApiError) || error.status >= 500), refetchOnWindowFocus: true }, mutations: { retry: false } } });
const api = new ApiClient(API_URL, sessionStorage);
type Mode = 'guest' | 'live' | 'demo';
interface AppContextValue {
  mode: Mode; user: User | null; loading: boolean; service: LinkService; api: ApiClient;
  notice: string; login(email: string, password: string): Promise<void>; demo(): void; logout(): Promise<void>;
}
const AppContext = createContext<AppContextValue | null>(null);
export function AppProvider({ children }: React.PropsWithChildren) {
  const [mode, setMode] = useState<Mode>('guest');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [demoService, setDemoService] = useState(() => createDemoService());
  useEffect(() => {
    let active = true;
    api.onAuthLost = () => {
      if (!active) return;
      queryClient.clear(); setUser(null); setMode('guest'); setNotice('Your session expired. Please sign in again.');
    };
    api.restore().then(session => { if (session && active) { setUser(session.user); setMode('live'); } }).catch(() => { if (active) setNotice('Could not restore your session. Please sign in again.'); }).finally(() => { if (active) setLoading(false); });
    const sub = AppState.addEventListener('change', state => { if (Platform.OS !== 'web') focusManager.setFocused(state === 'active'); });
    return () => { active = false; sub.remove(); };
  }, []);
  const value = useMemo<AppContextValue>(() => ({
    mode, user, loading, api, notice, service: mode === 'demo' ? demoService : liveService(api),
    login: async (email, password) => {
      const session = await api.publicRequest<Session>('/auth/login', 'POST', { email: email.trim().toLowerCase(), password });
      await api.setSession(session); queryClient.clear(); setUser(session.user); setNotice(''); setMode('live');
    },
    demo: () => { queryClient.clear(); setDemoService(createDemoService()); setUser({ id: -1, email: 'hello@example.com', name: 'Alex' }); setMode('demo'); setNotice(''); },
    logout: async () => {
      // The current backend invalidates all sessions for the user. This is disclosed in the confirmation.
      if (mode === 'live') await api.request('/auth/logout', 'POST');
      await api.clearSession(); queryClient.clear(); setUser(null); setMode('guest'); setNotice('');
    },
  }), [mode, user, loading, demoService, notice]);
  return <QueryClientProvider client={queryClient}><AppContext.Provider value={value}>{children}</AppContext.Provider></QueryClientProvider>;
}
export function useApp() { const value = useContext(AppContext); if (!value) throw new Error('AppProvider is missing.'); return value; }
