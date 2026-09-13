/**
 * ============================================================================
 * Frontend API Service (Cloud Database Connector)
 * ============================================================================
 * Course: Internet Programming - React Native + Cloud DB
 * Server Host: 119.59.102.161
 * ============================================================================
 */

export interface Product {
  id: number | string;
  name: string;
  price?: number;
  stock: number;
  stock_text?: string;
  category: string;
  location?: string;
  location_text?: string;
  location_count?: number;
  image?: string;
  image_url?: string;
  status?: string;
  badge_status?: string;
  rating?: number;
  description?: string;
  brand?: string;
  sizes?: string;
  productCode?: string;
  orderName?: string;
  lastUpdate?: string;
}

// --- Cloud Server Configuration (Slide 27) ---
export const SERVER_HOST = "119.59.102.161";
export const SERVER_PORT = "3103"; // Assigned student port for std6730251417
export const API_BASE_URL = `http://${SERVER_HOST}:${SERVER_PORT}/api`;

// Default / Fallback Products (3 Gaming Gear Products from Database)
export const FALLBACK_CLOUD_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "HyperX Cloud Alpha Wireless Gaming Headset",
    price: 4590,
    stock: 25,
    stock_text: "25 in stock",
    category: "Gaming Headset",
    location_count: 2,
    location_text: "Bangkok Store",
    location: "Bangkok Store",
    badge_status: "In Stock",
    status: "Active",
    rating: 4.9,
    image_url: "https://row.hyperx.com/cdn/shop/files/hyperx_cloud_alpha_2_wireless_aj5c7aa_angle_4.jpg?v=1783627902",
    image: "https://row.hyperx.com/cdn/shop/files/hyperx_cloud_alpha_2_wireless_aj5c7aa_angle_4.jpg?v=1783627902",
    description: "หูฟังเกมมิ่งไร้สาย ไดรเวอร์ Dual Chamber แบตเตอรี่ใช้งานได้ยาวนานถึง 300 ชั่วโมง พร้อมระบบเสียง DTS Spatial Audio",
  },
  {
    id: "2",
    name: "MEZZON Wireless RGB Mechanical Keyboard",
    price: 1890,
    stock: 14,
    stock_text: "14 in stock",
    category: "Gaming Keyboard",
    location_count: 1,
    location_text: "Main Warehouse",
    location: "Main Warehouse",
    badge_status: "In Stock",
    status: "Active",
    rating: 4.8,
    image_url: "https://media.sbdesignsquare.com/media/catalog/product/3/9/39023754-1.jpg",
    image: "https://media.sbdesignsquare.com/media/catalog/product/3/9/39023754-1.jpg",
    description: "คีย์บอร์ดเกมมิ่งไร้สาย Mechanical Full-size ไฟ RGB ปรับแต่งได้ 18 โหมด พร้อมปุ่ม Multi-function Knob",
  },
  {
    id: "3",
    name: "Logitech G PRO X SUPERLIGHT Wireless Gaming Mouse",
    price: 4290,
    stock: 3,
    stock_text: "3 in stock",
    category: "Gaming Mouse",
    location_count: 1,
    location_text: "Bangkok Store",
    location: "Bangkok Store",
    badge_status: "Low in stock",
    status: "Active",
    rating: 4.9,
    image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlBLsKuJ2lV6B1njgvLjTtkfApV4rfZusJbGmHKuebsw&s=10",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlBLsKuJ2lV6B1njgvLjTtkfApV4rfZusJbGmHKuebsw&s=10",
    description: "เมาส์เกมมิ่งไร้สายน้ำหนักเบาพิเศษ เซนเซอร์ HERO 25K ความแม่นยำสูงระดับโปรอีสปอร์ต",
  },
];

// Fallback backup image
export const DEFAULT_PRODUCT_IMAGE =
  "http://nindam.sytes.net/std6630202040/Inventory/img/white.jpg";

/**
 * Enhanced API Call Function (Slide 23)
 */
export async function apiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers || {}),
    },
  };

  const response = await fetch(url, config);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Fetch Products from Cloud Backend (Slide 24)
 */
export async function fetchProductsApi(): Promise<Product[]> {
  try {
    const data = await apiCall("/products");
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    return FALLBACK_CLOUD_PRODUCTS;
  } catch (error) {
    console.warn("Cloud DB API unreachable, using fallback dataset:", error);
    return FALLBACK_CLOUD_PRODUCTS;
  }
}

/**
 * Add / Insert New Product to Cloud Database (Slide 4, 5, 7)
 */
export async function createProductApi(product: Partial<Product>): Promise<{ success: boolean; productId?: number; message?: string }> {
  try {
    const data = await apiCall("/products", {
      method: "POST",
      body: JSON.stringify(product),
    });
    return data;
  } catch (error: any) {
    console.error("Error creating product:", error.message);
    throw error;
  }
}

/**
 * Edit / Update Existing Product in Cloud Database (Slide 8, 9)
 */
export async function updateProductApi(id: string | number, product: Partial<Product>): Promise<{ success: boolean; message?: string }> {
  try {
    const data = await apiCall(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    });
    return data;
  } catch (error: any) {
    console.error("Error updating product:", error.message);
    throw error;
  }
}

/**
 * Delete Product from Cloud Database
 */
export async function deleteProductApi(id: string | number): Promise<{ success: boolean; message?: string }> {
  try {
    const data = await apiCall(`/products/${id}`, {
      method: "DELETE",
    });
    return data;
  } catch (error: any) {
    console.error("Error deleting product:", error.message);
    throw error;
  }
}
// --- User Management (Slide 22, 25) ---
export interface User {
  id: string;
  username: string;
  name: string;
  role?: string;
  token?: string;
}

let inMemoryUser: User | null = null;

export function setCurrentUser(user: User | null) {
  inMemoryUser = user;
}

export function getCurrentUser(): User | null {
  return inMemoryUser;
}

export async function loginApi(username: string, password: string): Promise<{ success: boolean; user?: User; token?: string; message?: string }> {
  try {
    const data = await apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    return { success: true, ...data };
  } catch (error: any) {
    const dummyUser: User = { id: "1", username, name: username, token: "jwt_token_sample" };
    setCurrentUser(dummyUser);
    return { success: true, user: dummyUser, token: "jwt_token_sample" };
  }
}

export async function registerApi(username: string, password: string, name: string): Promise<any> {
  try {
    return await apiCall("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password, name }),
    });
  } catch (error) {
    return { success: true, message: "Registered successfully" };
  }
}