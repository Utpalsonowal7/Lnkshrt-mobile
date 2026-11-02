import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { ArrowRight, ArrowUpRight, ChartNoAxesCombined, Check, Copy, Link2, LockKeyhole, ShieldCheck } from 'lucide-react-native';
import { useApp } from '../providers/AppProvider';
import { ENABLE_DEMO } from '../core/config';
import { validateEmail, validatePassword } from '../core/validation';
import { BackTitle, Brand, Button, Field, InlineError, useToast } from '../ui/components';
import { c, s } from '../ui/theme';

type Step = 'welcome' | 'login' | 'register' | 'verify' | 'forgot' | 'reset';
export function AuthScreen() {
  const app = useApp();
  const toast = useToast();
  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => { if (!cooldown) return; const t = setTimeout(() => setCooldown(v => v - 1), 1000); return () => clearTimeout(t); }, [cooldown]);
  const go = (next: Step) => { setStep(next); setError(''); setPassword(''); setOtp(''); setShow(false); };
  async function submit() {
    setError('');
    if (!validateEmail(email)) return setError('Enter a valid email address.');
    if (['login', 'register', 'reset'].includes(step) && !password) return setError('Enter your password.');
    if (step === 'register' && !validatePassword(password)) return setError('Use 8–100 characters with an uppercase letter, a number and a special character.');
    if (step === 'reset' && (password.length < 8 || password.length > 100)) return setError('Use a password with 8–100 characters.');
    if (['verify', 'reset'].includes(step) && !/^[1-9]\d{3}$/.test(otp)) return setError('Enter the 4-digit code from your email.');
    setBusy(true);
    const normalizedEmail = email.trim().toLowerCase();
    try {
      if (step === 'login') await app.login(normalizedEmail, password);
      if (step === 'register') { await app.api.publicRequest('/auth/register', 'POST', { name: name.trim(), email: normalizedEmail, password }); go('verify'); setCooldown(45); }
      if (step === 'verify') { await app.api.publicRequest('/auth/verify-otp', 'POST', { email: normalizedEmail, otp: Number(otp) }); go('login'); toast('Email verified. You can sign in now.'); }
      if (step === 'forgot') { await app.api.publicRequest('/auth/forgot-password', 'POST', { email: normalizedEmail }); go('reset'); toast('Check your email for a reset code.'); }
      if (step === 'reset') { await app.api.publicRequest('/auth/reset-password', 'POST', { email: normalizedEmail, otp: Number(otp), password }); go('login'); toast('Password reset. Sign in with your new password.'); }
    } catch (e) { setError(e instanceof Error ? e.message : 'Please try again.'); }
    finally { setBusy(false); }
  }
  async function resend() {
    setBusy(true); setError('');
    try { await app.api.publicRequest('/auth/resend-otp', 'POST', { email: email.trim().toLowerCase() }); setCooldown(45); toast('A new code is on its way.'); }
    catch (e) { setError(e instanceof Error ? e.message : 'Please try again.'); }
    finally { setBusy(false); }
  }
  if (step === 'welcome') return <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.page, { gap: 28, paddingTop: 26, flexGrow: 1 }]}><View style={s.between}><Brand /><View style={[s.chip, { borderRadius: 20, backgroundColor: c.paper, borderWidth: 1, borderColor: c.line }]}><Text style={[s.small, { color: c.green, fontWeight: '600' }]}>Made for your everyday</Text></View></View><View style={{ paddingTop: 26, gap: 18 }}><Text style={{ fontSize: 11, letterSpacing: 2, color: c.green, fontWeight: '700' }}>YOUR LINKS, WITH YOU</Text><Text style={{ fontSize: 48, lineHeight: 53, letterSpacing: -2, color: c.ink, fontWeight: '700' }}>Small links.<Text style={{ color: c.green }}>{'\n'}Big possibilities.</Text></Text><Text style={[s.body, { color: c.muted, maxWidth: 340 }]}>Shorten it. Share it. See where it goes.{ '\n' }Your whole link workspace, in your pocket.</Text></View><View style={{ backgroundColor: c.dark, borderRadius: 28, padding: 23, gap: 22, overflow: 'hidden' }}><View style={s.between}><View><Text style={{ color: '#B9CABB', fontSize: 12 }}>A little link. A bigger story.</Text><Text style={{ color: c.lime, fontSize: 25, fontWeight: '600', marginTop: 6 }}>Make every click count.</Text></View><ArrowUpRight size={29} color={c.lime} /></View><View style={{ backgroundColor: '#FFFFFF', borderRadius: 17, padding: 16, gap: 12, transform: [{ rotate: '-2deg' }] }}><View style={[s.row, { gap: 11 }]}><View style={{ backgroundColor: c.pale, padding: 11, borderRadius: 12 }}><Link2 size={21} color={c.green} /></View><View style={{ flex: 1 }}><Text style={{ fontWeight: '700', fontSize: 15, color: c.ink }}>Your next big thing</Text><Text style={s.small}>A short link with a long story.</Text></View><Copy size={17} color={c.muted} /></View><View style={[s.between, { borderTopWidth: 1, borderColor: c.line, paddingTop: 12 }]}><Text style={{ color: c.green, fontSize: 14, fontWeight: '600' }}>lnkshrt.example/hello</Text><View style={[s.row, { gap: 5 }]}><Check size={14} color={c.green} /><Text style={{ color: c.green, fontSize: 11 }}>Ready to share</Text></View></View></View><View style={s.between}>{[[Link2, 'Create'], [ChartNoAxesCombined, 'Track'], [LockKeyhole, 'Protect']].map(([Icon, label]) => { const I = Icon as typeof Link2; return <View key={String(label)} style={[s.row, { gap: 7 }]}><I size={16} color="#BDCFBE" /><Text style={{ color: '#BDCFBE', fontSize: 12 }}>{String(label)}</Text></View>; })}</View></View><InlineError message={app.notice} /><View style={{ gap: 12 }}><Button title="Sign in to LnkShrt" onPress={() => go('login')} icon={ArrowRight} />{ENABLE_DEMO ? <Button title="Take a look around" variant="secondary" onPress={app.demo} /> : null}<View style={[s.row, { justifyContent: 'center', gap: 5, flexWrap: 'wrap' }]}><Text style={s.muted}>New here?</Text><Pressable accessibilityRole="button" onPress={() => go('register')} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: c.green, fontWeight: '700', fontSize: 14 }}>Create an account</Text></Pressable></View></View><View style={[s.row, { justifyContent: 'center', gap: 7, paddingBottom: 5 }]}><ShieldCheck size={15} color={c.muted} /><Text style={s.small}>Your links. Your insights. Your space.</Text></View></ScrollView>;
  const titles: Record<Exclude<Step, 'welcome'>, string> = { login: 'Welcome back.', register: 'Make it yours.', verify: 'Check your inbox.', forgot: 'Let’s get you back in.', reset: 'A fresh start.' };
  const subtitles: Record<Exclude<Step, 'welcome'>, string> = { login: 'Your links are right where you left them.', register: 'One account for your links, on every device.', verify: `Enter the 4-digit code sent to ${email}.`, forgot: 'We’ll email you a code to reset your password.', reset: 'Enter your email code and choose a new password.' };
  const labels: Record<Exclude<Step, 'welcome'>, string> = { login: 'Sign in', register: 'Create account', verify: 'Verify email', forgot: 'Send reset code', reset: 'Reset password' };
  return <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[s.page, { gap: 26, paddingTop: 18 }]}><BackTitle title="LnkShrt" onBack={() => go('welcome')} /><View style={{ gap: 12, paddingVertical: 20 }}><Brand small /><Text style={[s.title, { marginTop: 15 }]}>{titles[step]}</Text><Text style={s.muted}>{subtitles[step]}</Text></View><View style={{ gap: 19 }}>{step === 'register' ? <Field label="Your name" placeholder="What should we call you?" value={name} onChangeText={setName} autoComplete="name" maxLength={100} /> : null}<Field label="Email address" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" editable={!busy} />{['verify', 'reset'].includes(step) ? <Field label="Email code" placeholder="4-digit code" value={otp} onChangeText={v => setOtp(v.replace(/\D/g, ''))} keyboardType="number-pad" autoComplete="one-time-code" maxLength={4} /> : null}{['login', 'register', 'reset'].includes(step) ? <View style={{ gap: 4 }}><Field label={step === 'reset' ? 'New password' : 'Password'} value={password} onChangeText={setPassword} placeholder={step === 'register' ? 'Create a strong password' : 'Enter your password'} secureTextEntry={!show} autoCapitalize="none" autoComplete={step === 'login' ? 'current-password' : 'new-password'} maxLength={100} onSubmitEditing={() => void submit()} hint={step === 'register' ? '8+ characters, an uppercase letter, number and special character.' : undefined} /><View style={s.between}><Pressable accessibilityRole="button" onPress={() => setShow(v => !v)} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={s.small}>{show ? 'Hide password' : 'Show password'}</Text></Pressable>{step === 'login' ? <Pressable accessibilityRole="button" onPress={() => go('forgot')} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: c.green, fontSize: 13, fontWeight: '600' }}>Forgot password?</Text></Pressable> : null}</View></View> : null}<InlineError message={error} /><Button title={labels[step]} loading={busy} onPress={() => void submit()} icon={ArrowRight} />{step === 'verify' ? <Button title={cooldown ? `Resend code in ${cooldown}s` : 'Resend code'} variant="secondary" onPress={() => void resend()} disabled={!!cooldown || busy} /> : null}{step === 'login' || step === 'register' ? <Button title={step === 'login' ? 'Create an account instead' : 'I already have an account'} variant="secondary" onPress={() => go(step === 'login' ? 'register' : 'login')} disabled={busy} /> : null}</View></ScrollView></KeyboardAvoidingView>;
}
