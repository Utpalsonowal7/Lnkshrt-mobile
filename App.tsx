import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/providers/AppProvider';
import { ToastProvider, Loading } from './src/ui/components';
import { c } from './src/ui/theme';
import { AuthScreen } from './src/screens/AuthScreen';
import { Workspace } from './src/screens/Workspace';
function Root(){const app=useApp();return <SafeAreaView style={{flex:1,backgroundColor:c.bg}}><StatusBar style="dark"/>{app.loading?<Loading label="Opening your workspace…"/>:app.mode==='guest'?<AuthScreen/>:<Workspace/>}</SafeAreaView>;}
export default function App(){return <SafeAreaProvider><AppProvider><ToastProvider><Root/></ToastProvider></AppProvider></SafeAreaProvider>;}
