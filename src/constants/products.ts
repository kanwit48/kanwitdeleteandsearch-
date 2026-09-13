/**
 * ============================================================================
 * ข้อมูลรายการสินค้า Hardcoded (products.ts)
 * ============================================================================
 */

export interface ProductItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  brand: string;
  rating: number;
  reviewsCount: number;
  stockStatus: string;
  description: string;
  image: any;
  features: string[];
}

export const PRODUCTS: ProductItem[] = [
  {
    id: "1",
    name: "Logitech G PRO X SUPERLIGHT Wireless Gaming Mouse",
    price: 4290,
    originalPrice: 4990,
    category: "Gaming Mouse",
    brand: "Logitech G",
    rating: 4.9,
    reviewsCount: 128,
    stockStatus: "มีสินค้าในสต็อก (In Stock)",
    description: "เมาส์เกมมิ่งไร้สายน้ำหนักเบาพิเศษไม่ถึง 63 กรัม เซนเซอร์ HERO 25K ความแม่นยำระดับ eSports",
    image: require("@/assets/images/mouse.jpg"),
    features: ["น้ำหนักเบาพิเศษ <63g", "เซนเซอร์ HERO 25K", "LIGHTSPEED Wireless", "แบตเตอรี่ 70 ชม."]
  },
  {
    id: "2",
    name: "HyperX Cloud III Wireless Gaming Headset",
    price: 3990,
    originalPrice: 4590,
    category: "Gaming Headset",
    brand: "HyperX",
    rating: 4.8,
    reviewsCount: 95,
    stockStatus: "มีสินค้าในสต็อก (In Stock)",
    description: "หูฟังเกมมิ่งไร้สาย ไดรเวอร์มุมเอียง 53 มม. ระบบเสียง DTS Spatial Audio แบตเตอรี่ยาวนานถึง 120 ชม.",
    image: require("@/assets/images/headset.webp"),
    features: ["แบตเตอรี่ยาวนาน 120 ชม.", "ไดรเวอร์ 53 มม.", "DTS Headphone:X Spatial Audio", "ไมโครโฟน 10 มม. ตัดเสียงรบกวน"]
  },
  {
    id: "3",
    name: "MEZZON Wireless RGB Mechanical Keyboard",
    price: 1890,
    originalPrice: 2290,
    category: "Gaming Keyboard",
    brand: "MEZZON",
    rating: 4.7,
    reviewsCount: 64,
    stockStatus: "มีสินค้าในสต็อก (In Stock)",
    description: "คีย์บอร์ดเกมมิ่งไร้สาย Mechanical Full-size ไฟ RGB สวยงาม พร้อมปุ่มหมุน Knob ควบคุมเสียง",
    image: require("@/assets/images/keyboard.jpg"),
    features: ["การเชื่อมต่อ 3 โหมด (2.4G / BT / Type-C)", "Mechanical Switches", "ไฟ RGB ปรับได้ 18 โหมด", "ปุ่ม Knob มัลติฟังก์ชัน"]
  }
];