/**
 * ============================================================================
 * Kanwit Gaming Gear Shop - React UI & Navigation + JSON + GitHub
 * ============================================================================
 * 1. ดึงข้อมูลสินค้าจาก GitHub Raw JSON URL (fetch GITHUB_JSON_URL)
 * 2. เมนูนำทางด้านบน (Top Navigation Header)
 * 3. แสดงรายการสินค้าอย่างน้อย 3 ชิ้นพร้อมรูปภาพออนไลน์
 * 4. เมนูนำทางด้านล่าง (Bottom Navigation Menu)
 * ============================================================================
 */

import React, { useState, useEffect } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as SplashScreen from "expo-splash-screen";

// 1. Interface ข้อมูลสินค้าตรงตามโครงสร้าง products.json
export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  stock_text: string;
  category: string;
  location_count: number;
  location_text: string;
  badge_status: string;
  rating?: number;
  image_url: string;
  description: string;
}

// 2. URL สำหรับดึงไฟล์ JSON จาก GitHub (repo: kanwit48/productjson)
const GITHUB_JSON_URL =
  "https://raw.githubusercontent.com/kanwit48/productjson/main/products.json";

// ข้อมูลสำรองเริ่มต้น (Fallback) หากยังไม่ได้ push ไฟล์ขึ้น GitHub หรือไม่มีอินเทอร์เน็ต
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "HyperX Cloud Alpha Wireless Gaming Headset",
    price: 4590,
    stock: 25,
    stock_text: "25 in stock",
    category: "Gaming Headset",
    location_count: 2,
    location_text: "Bangkok Store",
    badge_status: "In Stock",
    rating: 4.9,
    image_url: "https://row.hyperx.com/cdn/shop/files/hyperx_cloud_alpha_2_wireless_aj5c7aa_angle_4.jpg?v=1783627902",
    description: "หูฟังเกมมิ่งไร้สาย ไดรเวอร์ Dual Chamber แบตเตอรี่ใช้งานได้ยาวนานถึง 300 ชั่วโมง พร้อมระบบเสียง DTS Spatial Audio"
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
    badge_status: "In Stock",
    rating: 4.8,
    image_url: "https://media.sbdesignsquare.com/media/catalog/product/3/9/39023754-1.jpg",
    description: "คีย์บอร์ดเกมมิ่งไร้สาย Mechanical Full-size ไฟ RGB ปรับแต่งได้ 18 โหมด พร้อมปุ่ม Multi-function Knob"
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
    badge_status: "Low in stock",
    rating: 4.9,
    image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlBLsKuJ2lV6B1njgvLjTtkfApV4rfZusJbGmHKuebsw&s=10",
    description: "เมาส์เกมมิ่งไร้สายน้ำหนักเบาพิเศษ เซนเซอร์ HERO 25K ความแม่นยำสูงระดับโปรอีสปอร์ต"
  }
];

const COLORS = {
  primary: "#6366F1",
  primaryDark: "#4F46E5",
  primaryLight: "#EEF2FF",
  accent: "#EC4899",
  background: "#F8FAFC",
  card: "#FFFFFF",
  text: "#0F172A",
  textSecondary: "#64748B",
  border: "#E2E8F0",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
};

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [cartCount, setCartCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>("home");

  // ฟังก์ชัน Fetch ข้อมูลจาก GitHub Raw JSON
  const fetchProducts = async () => {
    try {
      const response = await fetch(GITHUB_JSON_URL);
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      const data: Product[] = await response.json();
      setProducts(data);
      setError(null);
    } catch (err) {
      console.log("GitHub Fetch Error (Using Fallback Data):", err);
      // กรณี GitHub ยังไม่มีไฟล์ ให้ใช้ Fallback เพื่อให้แอปทำงานได้ต่อเนื่อง
      setProducts(FALLBACK_PRODUCTS);
    } finally {
      setLoading(false);
      setRefreshing(false);
      SplashScreen.hideAsync().catch(() => {});
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((item) => item.category === selectedCategory);

  const categories = [
    { id: "All", label: "ทั้งหมด (All)", iconType: "ion", icon: "grid-outline" },
    { id: "Gaming Headset", label: "หูฟัง (Headset)", iconType: "ion", icon: "headset-outline" },
    { id: "Gaming Keyboard", label: "คีย์บอร์ด (Keyboard)", iconType: "mc", icon: "keyboard-outline" },
    { id: "Gaming Mouse", label: "เมาส์ (Mouse)", iconType: "mc", icon: "mouse" },
  ];

  const handleAddToCart = (product: Product) => {
    setCartCount((prev) => prev + 1);
    Alert.alert("เพิ่มสินค้าลงตะกร้าแล้ว", `เพิ่ม "${product.name}" จำนวน 1 ชิ้น เรียบร้อยแล้ว`);
  };

  const handleProductDetail = (product: Product) => {
    Alert.alert(
      product.name,
      `${product.description}\n\nราคา: ฿${product.price.toLocaleString()}\nสถานะสต็อก: ${product.stock_text} (${product.badge_status})\nสาขา: ${product.location_text}`,
      [
        { text: "ปิด", style: "cancel" },
        { text: "เพิ่มลงตะกร้า", onPress: () => handleAddToCart(product) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.card} />

      {/* ================================================================== */}
      {/* 1. เมนูนำทางด้านบน (TOP NAVIGATION BAR / HEADER) */}
      {/* ================================================================== */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="menu-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Ionicons name="game-controller" size={16} color="#FFF" />
          </View>
          <View>
            <Text style={styles.brandTitle}>KANWIT GAMING</Text>
            <Text style={styles.brandSub}>GitHub JSON Integration</Text>
          </View>
        </View>

        <View style={styles.topRightActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={onRefresh}>
            <Ionicons name="refresh-outline" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, styles.cartBtn]}
            onPress={() => Alert.alert("ตะกร้าสินค้า", `มีสินค้าทั้งหมด ${cartCount} ชิ้น`)}
          >
            <Ionicons name="cart-outline" size={20} color={COLORS.primary} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ================================================================== */}
      {/* 2. เนื้อหาหลัก และ แสดงรายการสินค้าจาก GitHub JSON */}
      {/* ================================================================== */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>กำลังโหลดข้อมูลสินค้าจาก GitHub JSON...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          ListHeaderComponent={
            <View>
              {/* แถบเลือกหมวดหมู่ (Category Navigation Pills) */}
              <View style={styles.categorySection}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catList}>
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[styles.catChip, isSelected && styles.catChipActive]}
                        onPress={() => setSelectedCategory(cat.id)}
                      >
                        {cat.iconType === "ion" ? (
                          <Ionicons
                            name={cat.icon as any}
                            size={15}
                            color={isSelected ? "#FFF" : COLORS.textSecondary}
                          />
                        ) : (
                          <MaterialCommunityIcons
                            name={cat.icon as any}
                            size={15}
                            color={isSelected ? "#FFF" : COLORS.textSecondary}
                          />
                        )}
                        <Text style={[styles.catChipText, isSelected && styles.catChipTextActive]}>
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  รายการสินค้าจาก GitHub JSON ({filteredProducts.length} รายการ)
                </Text>
                <View style={styles.apiBadge}>
                  <Text style={styles.apiBadgeText}>REST JSON API</Text>
                </View>
              </View>
            </View>
          }
          renderItem={({ item }) => {
            const isLowStock = item.badge_status === "Low in stock";
            return (
              <View style={styles.card}>
                {/* รูปภาพสินค้าดึงจาก image_url ของ GitHub JSON */}
                <TouchableOpacity style={styles.imgWrap} onPress={() => handleProductDetail(item)}>
                  <Image source={{ uri: item.image_url }} style={styles.productImg} resizeMode="contain" />
                  <View
                    style={[
                      styles.stockStatusBadge,
                      isLowStock ? styles.badgeLowStock : styles.badgeInStock,
                    ]}
                  >
                    <Text style={styles.stockStatusBadgeText}>{item.badge_status}</Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.cardBody}>
                  <View style={styles.metaRow}>
                    <View style={styles.catTag}>
                      <Text style={styles.catTagText}>{item.category}</Text>
                    </View>
                    <Text style={styles.locationText}>📍 {item.location_text}</Text>
                  </View>

                  <TouchableOpacity onPress={() => handleProductDetail(item)}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.descText} numberOfLines={2}>
                    {item.description}
                  </Text>

                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={13} color="#FBBF24" />
                    <Text style={styles.ratingScore}>{item.rating ? item.rating.toFixed(1) : "5.0"}</Text>
                    <Text style={styles.dot}>•</Text>
                    <Text style={styles.stockText}>คงเหลือ: {item.stock_text}</Text>
                  </View>

                  <View style={styles.priceActionRow}>
                    <View style={styles.priceWrap}>
                      <Text style={styles.currency}>฿</Text>
                      <Text style={styles.price}>{item.price.toLocaleString()}</Text>
                    </View>
                    <TouchableOpacity style={styles.addBtn} onPress={() => handleAddToCart(item)}>
                      <Ionicons name="bag-add" size={16} color="#FFF" />
                      <Text style={styles.addBtnText}>สั่งซื้อ</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* ================================================================== */}
      {/* 3. เมนูนำทางด้านล่าง (BOTTOM NAVIGATION MENU) */}
      {/* ================================================================== */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navTab} onPress={() => setActiveTab("home")}>
          <Ionicons
            name={activeTab === "home" ? "home" : "home-outline"}
            size={22}
            color={activeTab === "home" ? COLORS.primary : COLORS.textSecondary}
          />
          <Text style={[styles.navLabel, activeTab === "home" && styles.navLabelActive]}>หน้าหลัก</Text>
          {activeTab === "home" && <View style={styles.activeBar} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => {
            setActiveTab("products");
            setSelectedCategory("All");
          }}
        >
          <Ionicons
            name={activeTab === "products" ? "grid" : "grid-outline"}
            size={22}
            color={activeTab === "products" ? COLORS.primary : COLORS.textSecondary}
          />
          <Text style={[styles.navLabel, activeTab === "products" && styles.navLabelActive]}>สินค้า</Text>
          {activeTab === "products" && <View style={styles.activeBar} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => {
            setActiveTab("cart");
            Alert.alert("ตะกร้าสินค้า", `มีสินค้า ${cartCount} ชิ้น`);
          }}
        >
          <View>
            <Ionicons
              name={activeTab === "cart" ? "cart" : "cart-outline"}
              size={22}
              color={activeTab === "cart" ? COLORS.primary : COLORS.textSecondary}
            />
            {cartCount > 0 && (
              <View style={styles.navCartBadge}>
                <Text style={styles.navCartText}>{cartCount}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.navLabel, activeTab === "cart" && styles.navLabelActive]}>ตะกร้า</Text>
          {activeTab === "cart" && <View style={styles.activeBar} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => {
            setActiveTab("profile");
            Alert.alert("บัญชีผู้ใช้", "เข้าสู่ระบบในชื่อ: Kanwit Store");
          }}
        >
          <Ionicons
            name={activeTab === "profile" ? "person" : "person-outline"}
            size={22}
            color={activeTab === "profile" ? COLORS.primary : COLORS.textSecondary}
          />
          <Text style={[styles.navLabel, activeTab === "profile" && styles.navLabelActive]}>โปรไฟล์</Text>
          {activeTab === "profile" && <View style={styles.activeBar} />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  loadingText: { marginTop: 12, color: COLORS.textSecondary, fontSize: 14 },
  topNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    elevation: 3,
  },
  brandContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  brandTitle: { fontSize: 15, fontWeight: "800", color: COLORS.text, letterSpacing: 0.5 },
  brandSub: { fontSize: 10, color: COLORS.textSecondary, fontWeight: "500" },
  topRightActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  cartBtn: { backgroundColor: COLORS.primaryLight },
  cartBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: COLORS.accent,
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  cartBadgeText: { color: "#FFF", fontSize: 9, fontWeight: "700" },
  listContent: { padding: 16, maxWidth: 800, width: "100%", alignSelf: "center" },
  categorySection: { marginBottom: 12 },
  catList: { gap: 8, paddingBottom: 4 },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catChipText: { fontSize: 12, fontWeight: "600", color: COLORS.textSecondary },
  catChipTextActive: { color: "#FFF" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  apiBadge: { backgroundColor: "#EEF2FF", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  apiBadgeText: { color: COLORS.primaryDark, fontSize: 11, fontWeight: "700" },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    elevation: 2,
  },
  imgWrap: {
    width: "100%",
    height: 200,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    position: "relative",
  },
  productImg: { width: "100%", height: "100%" },
  stockStatusBadge: { position: "absolute", top: 10, right: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeInStock: { backgroundColor: "#10B981" },
  badgeLowStock: { backgroundColor: "#F59E0B" },
  stockStatusBadgeText: { color: "#FFF", fontSize: 11, fontWeight: "700" },
  cardBody: { padding: 14 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  catTag: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  catTagText: { color: COLORS.primaryDark, fontSize: 10, fontWeight: "700" },
  locationText: { fontSize: 11, color: COLORS.textSecondary },
  productName: { fontSize: 15, fontWeight: "700", color: COLORS.text, lineHeight: 20, marginBottom: 4 },
  descText: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 16, marginBottom: 8 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 10 },
  ratingScore: { fontSize: 12, fontWeight: "700", color: COLORS.text },
  dot: { color: COLORS.textSecondary, fontSize: 10 },
  stockText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: "600" },
  priceActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  priceWrap: { flexDirection: "row", alignItems: "baseline", gap: 2 },
  currency: { fontSize: 14, fontWeight: "700", color: COLORS.primary },
  price: { fontSize: 19, fontWeight: "800", color: COLORS.primary },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: { color: "#FFF", fontSize: 13, fontWeight: "700" },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 8,
    elevation: 8,
  },
  navTab: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 3, position: "relative" },
  navLabel: { fontSize: 10, marginTop: 3, color: COLORS.textSecondary, fontWeight: "500" },
  navLabelActive: { color: COLORS.primary, fontWeight: "700" },
  activeBar: { position: "absolute", bottom: -4, width: 18, height: 3, borderRadius: 2, backgroundColor: COLORS.primary },
  navCartBadge: {
    position: "absolute",
    top: -3,
    right: -6,
    backgroundColor: COLORS.accent,
    borderRadius: 7,
    minWidth: 14,
    height: 14,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 2,
  },
  navCartText: { color: "#FFF", fontSize: 8, fontWeight: "700" },
});