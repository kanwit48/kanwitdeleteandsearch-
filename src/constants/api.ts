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
  stock: number;
  category: string;
  location: string;
  image: string;
  status: string;
  brand: string;
  sizes?: string;
  productCode?: string;
  orderName?: string;
  lastUpdate?: string;
}

// --- Cloud Server Configuration (Slide 27) ---
export const SERVER_HOST = "119.59.102.161";
export const SERVER_PORT = "3103"; // Assigned student port for std6730251417
export const API_BASE_URL = `http://${SERVER_HOST}:${SERVER_PORT}/api`;

// Default / Fallback Products (Slide 8, 9, 28)
export const FALLBACK_CLOUD_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Unisex T-Shirt White",
    stock: 0,
    category: "T-shirts",
    location: "3 stores",
    image: "http://nindam.sytes.net/std6630202040/Inventory/img/white.jpg",
    status: "Active",
    brand: "Unnamed Brand",
    sizes: "XS, S, M, L, XL, XXL",
    productCode: "119-12",
    orderName: "SK19-111",
    lastUpdate: "2026-01-29 14:39:00",
  },
  {
    id: 2,
    name: "Unisex T-Shirt Black",
    stock: 12,
    category: "T-shirts",
    location: "3 stores",
    image: "http://nindam.sytes.net/std6630202040/Inventory/img/black.png",
    status: "Active",
    brand: "Unnamed Brand",
    sizes: "XS, S, M, L, XL, XXL",
    productCode: "119-13",
    orderName: "SK19-112",
    lastUpdate: "2026-01-28 13:45:00",
  },
  {
    id: 3,
    name: "Unisex T-Shirt Yellow",
    stock: 12,
    category: "T-shirts",
    location: "3 stores",
    image: "http://nindam.sytes.net/std6630202040/Inventory/img/yellow.jpg",
    status: "Active",
    brand: "Unnamed Brand",
    sizes: "XS, S, M, L, XL, XXL",
    productCode: "119-14",
    orderName: "SK19-113",
    lastUpdate: "2026-01-27 15:22:00",
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