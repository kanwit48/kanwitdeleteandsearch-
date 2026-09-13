/**
 * ============================================================================
 * Adidas Shop - หน้าเข้าสู่ระบบ (Login Screen)
 * ============================================================================
 * ฟังก์ชันการทำงาน:
 * 1. ตรวจสอบข้อมูลชื่อผู้ใช้และรหัสผ่านจากฐานข้อมูล MySQL (ตาราง users)
 * 2. มีระบบเปิด/ปิดการมองเห็นรหัสผ่าน (Eye-toggle)
 * 3. มีลิงก์สำหรับสลับไปหน้าสมัครสมาชิก (Sign Up) หรือเข้าชมร้านค้าแบบ Guest
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { loginApi, setCurrentUser, DEFAULT_PRODUCT_IMAGE } from '@/constants/api';

// --- ชุดสีสำหรับตกแต่ง UI ---
const COLORS = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  background: '#FFFFFF',
  surface: '#F8FAFC',
  border: '#E2E8F0',
  text: '#0F172A',
  textSecondary: '#64748B',
  error: '#EF4444',
  success: '#10B981',
};

export default function LoginScreen() {
  const router = useRouter();

  // --- ตัวแปร State สำหรับเก็บข้อมูลฟอร์ม ---
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // --- ฟังก์ชันกดปุ่มเข้าสู่ระบบ ---
  const handleLogin = async () => {
    if (!username.trim()) {
      setErrorMessage('กรุณากรอกชื่อผู้ใช้');
      return;
    }
    if (!password) {
      setErrorMessage('กรุณากรอกรหัสผ่าน');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      // เรียก API ตรวจสอบการ Login กับ MySQL Backend
      const result = await loginApi(username.trim(), password);

      if (result.success) {
        if (result.user) {
          setCurrentUser(result.user);
        }
        if (Platform.OS === 'web') {
          router.replace('/' as any);
        } else {
          Alert.alert('สำเร็จ', `ยินดีต้อนรับคุณ ${result.user?.name || username}!`, [
            { text: 'ไปที่หน้าร้านค้า', onPress: () => router.replace('/' as any) },
          ]);
        }
      } else {
        setErrorMessage(result.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* 1. โลโก้และชื่อแบรนด์ส่วนหัว */}
          <View style={styles.brandContainer}>
            <Image
              source={{ uri: DEFAULT_PRODUCT_IMAGE }}
              style={styles.brandLogo}
            />
            <Text style={styles.brandTitle}>Adidas Shop</Text>
            <Text style={styles.brandSubtitle}>ระบบจัดการร้านค้าและคลังสินค้า</Text>
          </View>

          {/* 2. การ์ดฟอร์มเข้าสู่ระบบ */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>เข้าสู่ระบบ (Sign In)</Text>
            <Text style={styles.cardSubtitle}>
              ลงชื่อเข้าใช้เพื่อจัดการแก้ไขและเพิ่มสินค้าในระบบ
            </Text>

            {/* กล่องแสดงข้อความแจ้งเตือนเมื่อเกิดข้อผิดพลาด */}
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* ช่องกรอก Username */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>ชื่อผู้ใช้ (Username)</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="กรอกชื่อผู้ใช้"
                  placeholderTextColor={COLORS.textSecondary}
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    setErrorMessage('');
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* ช่องกรอก Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>รหัสผ่าน (Password)</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="กรอกรหัสผ่าน"
                  placeholderTextColor={COLORS.textSecondary}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setErrorMessage('');
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                {/* ปุ่มเปิด-ปิดการมองเห็นรหัสผ่าน */}
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* ปุ่มกดเข้าสู่ระบบ */}
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <View style={styles.buttonInner}>
                  <Text style={styles.buttonText}>เข้าสู่ระบบ</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>

            {/* 3. ลิงก์สลับไปหน้าสมัครสมาชิก (Sign Up) */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>ยังไม่มีบัญชีใช่หรือไม่? </Text>
              <TouchableOpacity onPress={() => router.push('/signup' as any)}>
                <Text style={styles.linkText}>สมัครสมาชิก (Sign Up)</Text>
              </TouchableOpacity>
            </View>

            {/* 4. ลิงก์เข้าชมสินค้าแบบผู้เยี่ยมชมทั่วไป */}
            <TouchableOpacity
              style={styles.guestLink}
              onPress={() => router.replace('/' as any)}
            >
              <Text style={styles.guestText}>เข้าชมสินค้าแบบทั่วไป →</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ============================================================================
// STYLES (การตกแต่ง CSS-in-JS)
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  brandLogo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    color: COLORS.text,
    fontSize: 15,
  },
  eyeButton: {
    padding: 6,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    marginTop: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  linkText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  guestLink: {
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 8,
  },
  guestText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
});
