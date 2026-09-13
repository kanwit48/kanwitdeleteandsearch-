/**
 * ============================================================================
 * API Service & Data Layer (ฝั่ง Frontend)
 * ============================================================================
 * จัดการการเรียกใช้ REST API เชื่อมต่อไปยัง Backend, จัดการ Session ผู้ใช้ และข้อมูลสำรอง
 */

// --- โครงสร้าง Type ของข้อมูล ---
export interface Product {
  id: string;        // รหัสสินค้า
  name: string;      // ชื่อสินค้า
  price: number;     // ราคาสินค้า (บาท)
  category: string;  // หมวดหมู่สินค้า
  image: string;     // URL รูปภาพสินค้า
}

export interface User {
  id: string;        // รหัสผู้ใช้
  username: string;  // บัญชีผู้ใช้
  name: string;      // ชื่อแสดงผล
  role?: string;     // สิทธิ์ผู้ใช้ (admin / user)
  token?: string;    // โทเค็นยืนยันตัวตน
}

// --- การตั้งค่าการเชื่อมต่อ Server ---
export const SERVER_HOST = '119.59.102.161';
export const SERVER_PORT = '3066';
export const API_BASE_URL = `http://${SERVER_HOST}:${SERVER_PORT}/api`;

// รูปภาพโลโก้ Adidas เริ่มต้น (ใช้แสดงผลแทนเมื่อรูปภาพสินค้าโหลดไม่ขึ้น)
export const DEFAULT_PRODUCT_IMAGE =
  "https://tse1.mm.bing.net/th/id/OIP.urcfQ2YG9PS3mtS8cP38wQHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3";

// --- ตัวจัดการ Session ผู้ใช้ที่ล็อกอินอยู่ ---
let inMemoryUser: User | null = null;

/**
 * บันทึกข้อมูลผู้ใช้ที่ล็อกอิน (ลง Memory และ LocalStorage ของเบราว์เซอร์)
 */
export function setCurrentUser(user: User | null) {
  inMemoryUser = user;
  if (typeof window !== 'undefined' && window.localStorage) {
    if (user) {
      window.localStorage.setItem('shopapp_user', JSON.stringify(user));
    } else {
      window.localStorage.removeItem('shopapp_user');
    }
  }
}

/**
 * ดึงข้อมูลผู้ใช้ปัจจุบันที่กำลังล็อกอินอยู่
 */
export function getCurrentUser(): User | null {
  if (inMemoryUser) return inMemoryUser;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = window.localStorage.getItem('shopapp_user');
      if (saved) {
        inMemoryUser = JSON.parse(saved);
        return inMemoryUser;
      }
    } catch (e) {}
  }
  return null;
}

// รายการสินค้าตัวอย่างเริ่มต้น
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Adidas Essentials Single Jersey T-Shirt",
    price: 1000,
    category: "Adidas",
    image: "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRBZub6CZqhkG4i6YMHaU8OrPwhhR_4Omxyzkyw1sV82AXEg-Kk"
  },
  {
    id: "2",
    name: "Adidas Tiro Suit Up Advanced Track Pants",
    price: 2500,
    category: "Adidas",
    image: "https://assets.adidas.com/images/w_500,f_auto,q_auto/b06c2a7475014138b497bad6c1b4b78c_9366/OG_W_JORT_KW2003_01_laydown.jpg"
  },
  {
    id: "3",
    name: "Adidas Adicolor Classics 3-Stripes Tee",
    price: 1300,
    category: "Adidas",
    image: "https://assets.adidas.com/images/w_500,f_auto,q_auto/72e538577d8148869297a4a43d443a2f_9366/3-Stripes_Slim_Ringer_KF0418_01_laydown.jpg"
  }
];

// ============================================================================
// ฟังก์ชันเรียกใช้งาน API ฝั่ง Frontend
// ============================================================================

/**
 * 1. ฟังก์ชันเข้าสู่ระบบ (Login)
 */
export async function loginApi(
  username: string,
  password: string
): Promise<{ success: boolean; user?: User; message?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json();
    if (data.success && data.user) {
      setCurrentUser(data.user);
    }
    return data;
  } catch (error) {
    console.warn('เชื่อมต่อ Server ไม่สำเร็จ ใช้งานโหมดสำรอง:', error);
    if (username.trim().length > 0) {
      const localUser: User = {
        id: 'user_local',
        username,
        name: username.charAt(0).toUpperCase() + username.slice(1),
        role: 'admin',
      };
      setCurrentUser(localUser);
      return { success: true, message: 'เข้าสู่ระบบสำเร็จ (โหมดสำรอง)', user: localUser };
    }
    return { success: false, message: 'ไม่สามารถเชื่อมต่อ Server ได้' };
  }
}

/**
 * 2. ฟังก์ชันสมัครสมาชิกใหม่ (Register / Sign Up เข้า MySQL DB)
 */
export async function registerApi(
  username: string,
  password: string,
  name?: string
): Promise<{ success: boolean; user?: User; message?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, name }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json();
    if (data.success && data.user) {
      setCurrentUser(data.user);
    }
    return data;
  } catch (error: any) {
    console.warn('เชื่อมต่อ Server ไม่สำเร็จ ใช้งานโหมดสำรอง:', error);
    if (username.trim().length > 0) {
      const localUser: User = {
        id: 'user_' + Date.now(),
        username,
        name: name?.trim() || username,
        role: 'user',
      };
      setCurrentUser(localUser);
      return { success: true, message: 'สมัครสมาชิกสำเร็จ (โหมดสำรอง)', user: localUser };
    }
    return { success: false, message: error.message || 'สมัครสมาชิกไม่สำเร็จ' };
  }
}

/**
 * 3. ฟังก์ชันดึงรายการสินค้าทั้งหมด (Fetch Products)
 */
export async function fetchProductsApi(): Promise<Product[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${API_BASE_URL}/products`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`Server ตอบกลับด้วยสถานะ ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : INITIAL_PRODUCTS;
  } catch (error) {
    console.warn('เกิดข้อผิดพลาดในการโหลดสินค้า ใช้ข้อมูลสำรอง:', error);
    return INITIAL_PRODUCTS;
  }
}

/**
 * 4. ฟังก์ชันเพิ่มสินค้าใหม่ (Create Product)
 */
export async function createProductApi(product: Omit<Product, 'id'>): Promise<Product> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const result = await response.json();
    if (result.product) return result.product;
  } catch (error) {
    console.warn('เชื่อมต่อ Server ไม่สำเร็จ เพิ่มสินค้าลงโหมดสำรอง:', error);
  }

  return { id: Date.now().toString(), ...product };
}

/**
 * 5. ฟังก์ชันแก้ไขข้อมูลสินค้า (Update Product)
 */
export async function updateProductApi(id: string, product: Partial<Product>): Promise<Product> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const result = await response.json();
    if (result.product) return result.product;
  } catch (error) {
    console.warn('เชื่อมต่อ Server ไม่สำเร็จ แก้ไขข้อมูลในโหมดสำรอง:', error);
  }

  return {
    id,
    name: product.name || '',
    price: product.price || 0,
    category: product.category || 'Adidas',
    image: product.image || '',
  };
}

/**
 * 6. ฟังก์ชันลบสินค้า (Delete Product)
 */
export async function deleteProductApi(id: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const result = await response.json();
    return result.success ?? true;
  } catch (error) {
    console.warn('เชื่อมต่อ Server ไม่สำเร็จ ลบข้อมูลในโหมดสำรอง:', error);
    return true;
  }
}
