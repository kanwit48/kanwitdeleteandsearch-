/**
 * ============================================================================
 * Adidas Shop - หน้าสมัครสมาชิกใหม่ (Sign Up Screen)
 * ============================================================================
 * ฟังก์ชันการทำงาน:
 * 1. รับข้อมูลสมัครสมาชิกใหม่ (ชื่อ, Username, Password, ยืนยัน Password)
 * 2. มีระบบตรวจสอบ Validation (เช็คความยาว, รหัสผ่านตรงกันหรือไม่)
 * 3. บันทึกข้อมูลลงตาราง users ในฐานข้อมูล MySQL ทันที
 * 4. ล็อกอินให้อัตโนมัติเมื่อสมัครสมาชิกสำเร็จ
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
import { registerApi, DEFAULT_PRODUCT_IMAGE } from '@/constants/api';

// --- ชุดสีสำหรับตกแต่ง UI ---
const COLORS = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  background: '#F1F5F9',
  card: '#FFFFFF',
  surface: '#F8FAFC',
  border: '#E2E8F0',
  text: '#0F172A',
  textSecondary: '#64748B',
  error: '#EF4444',
  success: '#10B981',
};

export default function SignUpScreen() {
  const router = useRouter();

  // --- ตัวแปร State เก็บข้อมูลฟอร์มสมัครสมาชิก ---
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State สถานะการโหลดและข้อความแจ้งเตือน
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // --- ฟังก์ชันกดปุ่มสมัครสมาชิก ---
  const handleSignUp = async () => {
    // 1. ตรวจสอบความถูกต้องของข้อมูล (Validation)
    if (!name.trim()) {
      setErrorMessage('กรุณากรอกชื่อ-นามสกุล หรือชื่อแสดงผล');
      return;
    }
    if (!username.trim()) {
      setErrorMessage('กรุณากรอกชื่อผู้ใช้ (Username)');
      return;
    }
    if (username.trim().length < 3) {
      setErrorMessage('ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 3 ตัวอักษร');
      return;
    }
    if (!password) {
      setErrorMessage('กรุณากรอกรหัสผ่าน');
      return;
    }
    if (password.length < 4) {
      setErrorMessage('รหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัวอักษร');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('รหัสผ่านทั้งสองช่องไม่ตรงกัน');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      // 2. เรียก API บันทึกข้อมูลสมาชิกลง MySQL Database
      const result = await registerApi(username.trim(), password, name.trim());

      if (result.success) {
        if (Platform.OS === 'web') {
          alert(`สมัครสมาชิกสำเร็จ! ยินดีต้อนรับคุณ ${result.user?.name || username}!`);
          router.replace('/' as any);
        } else {
          Alert.alert('สมัครสมาชิกสำเร็จ!', `ยินดีต้อนรับสู่ Adidas Shop, คุณ ${result.user?.name || username}!`, [
            { text: 'เริ่มใช้งาน', onPress: () => router.replace('/' as any) },
          ]);
        }
      } else {
        setErrorMessage(result.message || 'การสมัครสมาชิกล้มเหลว กรุณาลองใช้ชื่ออื่น');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
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
            <Text style={styles.brandSubtitle}>สร้างบัญชีใหม่เพื่อเริ่มต้นใช้งาน</Text>
          </View>

          {/* 2. การ์ดฟอร์มสมัครสมาชิก */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>สมัครสมาชิก (Sign Up)</Text>
            <Text style={styles.cardSubtitle}>
              ลงทะเบียนเพื่อจัดการคลังสินค้าและระบบของร้าน
            </Text>

            {/* กล่องแสดงข้อความแจ้งเตือน Error */}
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* ช่องกรอกชื่อเต็ม / ชื่อแสดงผล */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>ชื่อ-นามสกุล / ชื่อแสดงผล *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="เช่น สมชาย ใจดี"
                  placeholderTextColor={COLORS.textSecondary}
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    setErrorMessage('');
                  }}
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* ช่องกรอก Username */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>ชื่อผู้ใช้ (Username) *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="at-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="อย่างน้อย 3 ตัวอักษร"
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
              <Text style={styles.label}>รหัสผ่าน (Password) *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="อย่างน้อย 4 ตัวอักษร"
                  placeholderTextColor={COLORS.textSecondary}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setErrorMessage('');
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
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

            {/* ช่องกรอกยืนยัน Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>ยืนยันรหัสผ่าน (Confirm Password) *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="กรอกรหัสผ่านซ้ำอีกครั้ง"
                  placeholderTextColor={COLORS.textSecondary}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setErrorMessage('');
                  }}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* ปุ่มกดยืนยันสมัครสมาชิก */}
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <View style={styles.buttonInner}>
                  <Text style={styles.buttonText}>สร้างบัญชีผู้ใช้</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>

            {/* 3. ลิงก์สลับกลับไปหน้า Login */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>มีบัญชีอยู่แล้วใช่หรือไม่? </Text>
              <TouchableOpacity onPress={() => router.push('/login' as any)}>
                <Text style={styles.linkText}>เข้าสู่ระบบ (Sign In)</Text>
              </TouchableOpacity>
            </View>

            {/* 4. ลิงก์เข้าชมสินค้าแบบ Guest */}
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
    paddingVertical: 32,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  brandLogo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.card,
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
    marginBottom: 18,
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
    marginBottom: 14,
    gap: 8,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 14,
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
    paddingVertical: 6,
  },
  guestText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
});
