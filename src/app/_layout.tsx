/**
 * ============================================================================
 * โครงสร้างหน้าจอหลัก (_layout.tsx)
 * ============================================================================
 * จัดการ ThemeProvider (โหมดมืด/สว่าง) และภาพเคลื่อนไหวตอนเปิดแอป (Splash Screen)
 */

import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';

// ป้องกันไม่ให้หน้า Splash ซ่อนอัตโนมัติจนกว่าแอปจะพร้อม
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* ภาพเคลื่อนไหว Splash Overlay ตอนเปิดแอป */}
      <AnimatedSplashOverlay />
      {/* ระบบจัดการเส้นทางและหน้าจอ (Navigator) */}
      <AppTabs />
    </ThemeProvider>
  );
}
