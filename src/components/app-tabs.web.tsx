/**
 * ============================================================================
 * ระบบจัดการเส้นทางหน้าเว็บบนเบราว์เซอร์ (app-tabs.web.tsx)
 * ============================================================================
 */

import { Slot } from 'expo-router';
import { View, StyleSheet } from 'react-native';

export default function AppTabs() {
  return (
    <View style={styles.container}>
      <Slot />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    minHeight: '100%',
  },
});