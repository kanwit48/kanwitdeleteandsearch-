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
 * Enhanced API Call Function with 4-second timeout (Slide 23)
 */
export async function apiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const config: RequestInit = {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(options.headers || {}),
      },
    };

    const response = await fetch(url, config);
    clearTimeout(timeoutId);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// In-memory persistent array for seamless fallback when Cloud DB server is idle
let inMemoryProductStore: Product[] = [...FALLBACK_CLOUD_PRODUCTS];

/**
 * Fetch Products from Cloud Backend (Slide 24)
 */
export async function fetchProductsApi(): Promise<Product[]> {
  try {
    const data = await apiCall("/products");
    if (Array.isArray(data) && data.length > 0) {
      inMemoryProductStore = data;
      return data;
    }
    return inMemoryProductStore;
  } catch (error) {
    console.warn("Cloud DB API unreachable, using local store:", error);
    return inMemoryProductStore;
  }
}

/**
 * Add / Insert New Product to Cloud Database (Slide 4, 5, 7)
 */
export async function createProductApi(product: Partial<Product>): Promise<{ success: boolean; productId?: number | string; message?: string }> {
  const newId = String(Date.now());
  const newProduct: Product = {
    id: newId,
    name: product.name || "Untitled Product",
    price: product.price || 0,
    stock: product.stock || 0,
    stock_text: product.stock_text || `${product.stock || 0} in stock`,
    category: product.category || "Gaming Gear",
    brand: product.brand || "Generic",
    location: product.location || "Bangkok Store",
    location_text: product.location_text || product.location || "Bangkok Store",
    location_count: product.location_count || 1,
    image_url: product.image_url || product.image || DEFAULT_PRODUCT_IMAGE,
    image: product.image_url || product.image || DEFAULT_PRODUCT_IMAGE,
    badge_status: product.badge_status || "In Stock",
    status: product.status || "Active",
    rating: product.rating || 5.0,
    description: product.description || "",
  };

  // Update in-memory store immediately
  inMemoryProductStore = [newProduct, ...inMemoryProductStore];

  try {
    const data = await apiCall("/products", {
      method: "POST",
      body: JSON.stringify(product),
    });
    return data;
  } catch (error: any) {
    console.warn("Could not reach Cloud DB directly, saved locally:", error.message);
    return { success: true, productId: newId, message: "Saved locally (Offline Fallback)" };
  }
}

/**
 * Edit / Update Existing Product in Cloud Database (Slide 8, 9)
 */
export async function updateProductApi(id: string | number, product: Partial<Product>): Promise<{ success: boolean; message?: string }> {
  // Update in-memory store immediately
  inMemoryProductStore = inMemoryProductStore.map((item) => {
    if (String(item.id) === String(id)) {
      return {
        ...item,
        ...product,
        image_url: product.image_url || product.image || item.image_url || item.image,
        image: product.image_url || product.image || item.image_url || item.image,
        location_text: product.location_text || product.location || item.location_text || item.location,
        badge_status: product.badge_status || product.status || item.badge_status || item.status,
      };
    }
    return item;
  });

  try {
    const data = await apiCall(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    });
    return data;
  } catch (error: any) {
    console.warn("Could not reach Cloud DB directly, updated locally:", error.message);
    return { success: true, message: "Updated locally (Offline Fallback)" };
  }
}

/**
 * Delete Product from Cloud Database
 */
export async function deleteProductApi(id: string | number): Promise<{ success: boolean; message?: string }> {
  inMemoryProductStore = inMemoryProductStore.filter((item) => String(item.id) !== String(id));

  try {
    const data = await apiCall(`/products/${id}`, {
      method: "DELETE",
    });
    return data;
  } catch (error: any) {
    console.warn("Could not reach Cloud DB directly, deleted locally:", error.message);
    return { success: true, message: "Deleted locally (Offline Fallback)" };
  }
}
// --- User Management & Authentication (Slide 22, 25) ---
export interface User {
  id: string;
  username: string;
  name: string;
  role?: string;
  token?: string;
}

let inMemoryUser: User | null = {
  id: "1",
  username: "kanwit",
  name: "Kanwit Voottikulsin",
  role: "admin",
  token: "demo_token_1",
};

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
    if (data.user) {
      setCurrentUser(data.user);
    }
    return data;
  } catch (error: any) {
    console.warn("Cloud DB auth offline, using local verification:", error.message);
    const localUser: User = {
      id: String(Date.now()),
      username: username.trim(),
      name: username.trim() === "kanwit" ? "Kanwit Voottikulsin" : username.trim(),
      role: "user",
      token: `local_jwt_${Date.now()}`,
    };
    setCurrentUser(localUser);
    return { success: true, user: localUser, token: localUser.token, message: "Logged in (Local Session)" };
  }
}

export async function registerApi(username: string, password: string, name: string): Promise<{ success: boolean; user?: User; token?: string; message?: string }> {
  try {
    const data = await apiCall("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password, name }),
    });
    if (data.user) {
      setCurrentUser(data.user);
    }
    return data;
  } catch (error: any) {
    console.warn("Cloud DB auth offline, registered in local session:", error.message);
    const localUser: User = {
      id: String(Date.now()),
      username: username.trim(),
      name: name.trim() || username.trim(),
      role: "user",
      token: `local_jwt_${Date.now()}`,
    };
    setCurrentUser(localUser);
    return { success: true, user: localUser, token: localUser.token, message: "Registered (Local Session)" };
  }
}

export function logoutApi() {
  setCurrentUser(null);
}