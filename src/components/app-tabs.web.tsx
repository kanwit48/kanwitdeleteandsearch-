/**
 * ============================================================================
 * ระบบจัดการเส้นทางหน้าเว็บบนเบราว์เซอร์ (app-tabs.web.tsx)
 * ============================================================================
 * กำหนดรายชื่อหน้าจอ (Home, Explore, Login, SignUp) ให้กับ Expo Router บนเว็บ
 * โดยซ่อนแถบ TabList ไว้เพื่อให้หน้าเว็บแสดงผลแบบเต็มหน้าจอ (Full Screen) คลีนๆ
 */

import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';

export default function AppTabs() {
  return (
    <Tabs>
      {/* พื้นที่แสดงผลหน้าจอปัจจุบัน */}
      <TabSlot style={{ height: '100%' }} />

      {/* รายชื่อเส้นทางหน้าจอภายในระบบ (ซ่อนไว้ไม่ให้แสดงบน UI) */}
      <TabList style={{ display: 'none' }}>
        <TabTrigger name="home" href="/" />
        <TabTrigger name="explore" href="/explore" />
        <TabTrigger name="login" href={"/login" as any} />
        <TabTrigger name="signup" href={"/signup" as any} />
      </TabList>
    </Tabs>
  );
}
