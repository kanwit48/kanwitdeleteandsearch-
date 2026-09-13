/**
 * ============================================================================
 * Kanwit Gaming Gear Shop - หน้าหลัก (Home Screen)
 * ============================================================================
 * โครงสร้างหน้าจอตามโจทย์:
 * 1. เมนูนำทางด้านบน (Top Navigation Header)
 * 2. แสดงรายการสินค้าอย่างน้อย 3 ชิ้น (Hardcoded Product List + Local Assets)
 * 3. เมนูนำทางด้านล่าง (Bottom Navigation Menu)
 * ============================================================================
 */

import React, { useState } from "react";
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
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { PRODUCTS, ProductItem } from "@/constants/products";

// --- ชุดสีธีม Gaming Modern ---
const COLORS = {
  primary: "#6366F1",        // Indigo
  primaryDark: "#4F46E5",
  primaryLight: "#EEF2FF",
  accent: "#EC4899",         // Pink/Rose Accent
  background: "#F8FAFC",     // Light gray background
  card: "#FFFFFF",
  text: "#0F172A",           // Slate 900
  textSecondary: "#64748B",  // Slate 500
  border: "#E2E8F0",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
};

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [cartCount, setCartCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>("home");

  // กรองสินค้าตามหมวดหมู่ (ถ้าเลือก All จะแสดงทั้งหมด)
  const filteredProducts =
    selectedCategory === "All"
      ? PRODUCTS
      : PRODUCTS.filter((item) => item.category === selectedCategory);

  const categories = [
    { id: "All", label: "ทั้งหมด (All)", icon: "apps-outline" },
    { id: "Gaming Mouse", label: "เมาส์ (Mouse)", icon: "mouse" },
    { id: "Gaming Headset", label: "หูฟัง (Headset)", icon: "headset" },
    { id: "Gaming Keyboard", label: "คีย์บอร์ด (Keyboard)", icon: "keyboard-outline" },
  ];

  const handleAddToCart = (product: ProductItem) => {
    setCartCount((prev) => prev + 1);
    Alert.alert(
      "เพิ่มสินค้าลงตะกร้าแล้ว",
      `เพิ่ม "${product.name}" จำนวน 1 ชิ้น เข้าสู่ตะกร้าเรียบร้อยแล้ว`,
      [{ text: "ตกลง" }]
    );
  };

  const handleProductDetail = (product: ProductItem) => {
    Alert.alert(
      product.name,
      `${product.description}\n\nราคา: ฿${product.price.toLocaleString()}\nสถานะ: ${product.stockStatus}`,
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
        {/* เมนูปุ่มด้านซ้าย */}
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
          <Ionicons name="menu-outline" size={26} color={COLORS.text} />
        </TouchableOpacity>

        {/* ชื่อร้านค้า / โลโก้ */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Ionicons name="game-controller" size={18} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.brandTitle}>KANWIT GAMING</Text>
            <Text style={styles.brandSubtitle}>Official Gear Store</Text>
          </View>
        </View>

        {/* ไอคอนแจ้งเตือนและตะกร้าสินค้าด้านขวา */}
        <View style={styles.topRightActions}>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, styles.cartButton]}
            activeOpacity={0.7}
            onPress={() =>
              Alert.alert("ตะกร้าสินค้า", `มีสินค้าในตะกร้าทั้งหมด ${cartCount} ชิ้น`)
            }
          >
            <Ionicons name="cart-outline" size={22} color={COLORS.primary} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ================================================================== */}
      {/* 2. เนื้อหาหลัก และ รายการสินค้า (PRODUCTS DISPLAY) */}
      {/* ================================================================== */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            {/* แบนเนอร์โปรโมชัน */}
            <View style={styles.heroBanner}>
              <View style={styles.heroLeft}>
                <View style={styles.hotTag}>
                  <Ionicons name="flame" size={14} color="#FFFFFF" />
                  <Text style={styles.hotTagText}>PROMOTION</Text>
                </View>
                <Text style={styles.heroTitle}>Top Gaming Gears</Text>
                <Text style={styles.heroSubtitle}>
                  ยกระดับการเล่นเกมด้วยอุปกรณ์เกมมิ่งเกียร์คุณภาพสูง
                </Text>
              </View>
              <View style={styles.heroRight}>
                <MaterialCommunityIcons name="lightning-bolt" size={48} color="#FDE047" />
              </View>
            </View>

            {/* แถบเมนูเลือกหมวดหมู่สินค้า (Category Navigation Pills) */}
            <View style={styles.categorySection}>
              <Text style={styles.sectionHeaderTitle}>หมวดหมู่สินค้า (Categories)</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryList}
              >
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryChip,
                        isSelected && styles.categoryChipActive,
                      ]}
                      onPress={() => setSelectedCategory(cat.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={cat.icon as any}
                        size={16}
                        color={isSelected ? "#FFFFFF" : COLORS.textSecondary}
                      />
                      <Text
                        style={[
                          styles.categoryChipText,
                          isSelected && styles.categoryChipTextActive,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* หัวข้อรายการสินค้า */}
            <View style={styles.productsHeaderRow}>
              <Text style={styles.sectionHeaderTitle}>
                รายการสินค้าแนะนำ ({filteredProducts.length} รายการ)
              </Text>
              <View style={styles.stockBadge}>
                <Text style={styles.stockBadgeText}>แท้ 100% ประกันศูนย์</Text>
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            {/* รูปภาพสินค้า */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => handleProductDetail(item)}
              style={styles.imageWrapper}
            >
              <Image source={item.image} style={styles.productImage} resizeMode="contain" />
              {item.originalPrice && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountBadgeText}>
                    ลด {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* รายละเอียดสินค้า */}
            <View style={styles.productInfo}>
              {/* แบรนด์ & หมวดหมู่ */}
              <View style={styles.metaRow}>
                <View style={styles.categoryTag}>
                  <Text style={styles.categoryTagText}>{item.category}</Text>
                </View>
                <Text style={styles.brandText}>{item.brand}</Text>
              </View>

              {/* ชื่อสินค้า */}
              <TouchableOpacity onPress={() => handleProductDetail(item)}>
                <Text style={styles.productName} numberOfLines={2}>
                  {item.name}
                </Text>
              </TouchableOpacity>

              {/* คำอธิบายสั้น */}
              <Text style={styles.productDescription} numberOfLines={2}>
                {item.description}
              </Text>

              {/* จุดเด่น (Feature Badges) */}
              <View style={styles.featureRow}>
                {item.features.slice(0, 2).map((feat, idx) => (
                  <View key={idx} style={styles.featurePill}>
                    <Ionicons name="checkmark-circle" size={12} color={COLORS.success} />
                    <Text style={styles.featurePillText} numberOfLines={1}>
                      {feat}
                    </Text>
                  </View>
                ))}
              </View>

              {/* เรตติ้งดาวและรีวิว */}
              <View style={styles.ratingRow}>
                <View style={styles.stars}>
                  <Ionicons name="star" size={14} color="#FBBF24" />
                  <Text style={styles.ratingScore}>{item.rating.toFixed(1)}</Text>
                </View>
                <Text style={styles.reviewCount}>({item.reviewsCount} รีวิว)</Text>
                <Text style={styles.dotSeparator}>•</Text>
                <Text style={styles.stockStatusText}>{item.stockStatus}</Text>
              </View>

              {/* แถวราคาและปุ่มสั่งซื้อ */}
              <View style={styles.priceAndActionRow}>
                <View style={styles.priceContainer}>
                  <Text style={styles.currencySymbol}>฿</Text>
                  <Text style={styles.priceText}>{item.price.toLocaleString()}</Text>
                  {item.originalPrice && (
                    <Text style={styles.originalPriceText}>
                      ฿{item.originalPrice.toLocaleString()}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.addToCartBtn}
                  activeOpacity={0.8}
                  onPress={() => handleAddToCart(item)}
                >
                  <Ionicons name="bag-add" size={18} color="#FFFFFF" />
                  <Text style={styles.addToCartBtnText}>สั่งซื้อ</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      {/* ================================================================== */}
      {/* 3. เมนูนำทางด้านล่าง (BOTTOM NAVIGATION MENU) */}
      {/* ================================================================== */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab("home")}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === "home" ? "home" : "home-outline"}
            size={22}
            color={activeTab === "home" ? COLORS.primary : COLORS.textSecondary}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === "home" && styles.navLabelActive,
            ]}
          >
            หน้าหลัก
          </Text>
          {activeTab === "home" && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => {
            setActiveTab("products");
            setSelectedCategory("All");
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === "products" ? "grid" : "grid-outline"}
            size={22}
            color={activeTab === "products" ? COLORS.primary : COLORS.textSecondary}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === "products" && styles.navLabelActive,
            ]}
          >
            สินค้าทั้งหมด
          </Text>
          {activeTab === "products" && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => {
            setActiveTab("cart");
            Alert.alert("ตะกร้าสินค้า", `รายการสินค้าในตะกร้า: ${cartCount} ชิ้น`);
          }}
          activeOpacity={0.7}
        >
          <View>
            <Ionicons
              name={activeTab === "cart" ? "cart" : "cart-outline"}
              size={22}
              color={activeTab === "cart" ? COLORS.primary : COLORS.textSecondary}
            />
            {cartCount > 0 && (
              <View style={styles.navCartBadge}>
                <Text style={styles.navCartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.navLabel,
              activeTab === "cart" && styles.navLabelActive,
            ]}
          >
            ตะกร้า
          </Text>
          {activeTab === "cart" && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => {
            setActiveTab("profile");
            Alert.alert("บัญชีผู้ใช้", "เข้าสู่ระบบในชื่อ: Kanwit Store");
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === "profile" ? "person" : "person-outline"}
            size={22}
            color={activeTab === "profile" ? COLORS.primary : COLORS.textSecondary}
          />
          <Text
            style={[
              styles.navLabel,
              activeTab === "profile" && styles.navLabelActive,
            ]}
          >
            โปรไฟล์
          </Text>
          {activeTab === "profile" && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  /* --- Top Navigation Bar --- */
  topNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      },
    }),
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  topRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  cartButton: {
    backgroundColor: COLORS.primaryLight,
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  cartBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },

  /* --- List Content --- */
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },

  /* --- Hero Banner --- */
  heroBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1E1B4B", // Deep Indigo
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  heroLeft: {
    flex: 1,
  },
  hotTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(236, 72, 153, 0.9)",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  hotTagText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
  },
  heroSubtitle: {
    color: "#C7D2FE",
    fontSize: 12,
    lineHeight: 16,
  },
  heroRight: {
    paddingLeft: 12,
  },

  /* --- Category Section --- */
  categorySection: {
    marginBottom: 16,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 10,
  },
  categoryList: {
    gap: 8,
    paddingBottom: 4,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  categoryChipTextActive: {
    color: "#FFFFFF",
  },

  /* --- Products Header --- */
  productsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  stockBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stockBadgeText: {
    color: "#15803D",
    fontSize: 11,
    fontWeight: "700",
  },

  /* --- Product Card --- */
  productCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      },
    }),
  },
  imageWrapper: {
    width: "100%",
    height: 220,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  discountBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: COLORS.danger,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },

  productInfo: {
    padding: 16,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryTag: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryTagText: {
    color: COLORS.primaryDark,
    fontSize: 11,
    fontWeight: "700",
  },
  brandText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  productName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: 6,
  },
  productDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  featureRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  featurePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  featurePillText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
  },
  stars: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingScore: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
  },
  reviewCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  dotSeparator: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  stockStatusText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: "600",
  },

  priceAndActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
  },
  priceText: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.primary,
  },
  originalPriceText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textDecorationLine: "line-through",
    marginLeft: 6,
  },
  addToCartBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addToCartBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  /* --- Bottom Navigation Bar --- */
  bottomNav: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 8,
    paddingHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: "0 -2px 8px rgba(0,0,0,0.04)",
      },
    }),
  },
  navTab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    position: "relative",
  },
  navLabel: {
    fontSize: 11,
    marginTop: 3,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  navLabelActive: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  activeTabIndicator: {
    position: "absolute",
    bottom: -4,
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  navCartBadge: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  navCartBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
  },
});