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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as SplashScreen from "expo-splash-screen";
import { PRODUCTS, ProductItem } from "@/constants/products";

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
  danger: "#EF4444",
};

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [cartCount, setCartCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>("home");

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  const filteredProducts =
    selectedCategory === "All"
      ? PRODUCTS
      : PRODUCTS.filter((item) => item.category === selectedCategory);

  const categories = [
    { id: "All", label: "ทั้งหมด (All)", iconType: "ion", icon: "grid-outline" },
    { id: "Gaming Mouse", label: "เมาส์", iconType: "mc", icon: "mouse" },
    { id: "Gaming Headset", label: "หูฟัง", iconType: "ion", icon: "headset-outline" },
    { id: "Gaming Keyboard", label: "คีย์บอร์ด", iconType: "mc", icon: "keyboard-outline" },
  ];

  const handleAddToCart = (product: ProductItem) => {
    setCartCount((prev) => prev + 1);
    Alert.alert("เพิ่มสินค้าลงตะกร้าแล้ว", `เพิ่ม "${product.name}" เรียบร้อยแล้ว`);
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

      {/* 1. TOP NAVIGATION HEADER */}
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
            <Text style={styles.brandSub}>Official Gear Store</Text>
          </View>
        </View>

        <View style={styles.topRightActions}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.text} />
            <View style={styles.notifDot} />
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

      {/* 2. PRODUCT CATALOGUE */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            {/* Category Filter Pills */}
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
                        <Ionicons name={cat.icon as any} size={15} color={isSelected ? "#FFF" : COLORS.textSecondary} />
                      ) : (
                        <MaterialCommunityIcons name={cat.icon as any} size={15} color={isSelected ? "#FFF" : COLORS.textSecondary} />
                      )}
                      <Text style={[styles.catChipText, isSelected && styles.catChipTextActive]}>{cat.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>รายการสินค้าแนะนำ ({filteredProducts.length})</Text>
              <View style={styles.stockBadge}>
                <Text style={styles.stockBadgeText}>แท้ 100% ประกันศูนย์</Text>
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity style={styles.imgWrap} onPress={() => handleProductDetail(item)}>
              <Image source={item.image} style={styles.productImg} resizeMode="contain" />
              {item.originalPrice && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>
                    ลด {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.cardBody}>
              <View style={styles.metaRow}>
                <View style={styles.catTag}>
                  <Text style={styles.catTagText}>{item.category}</Text>
                </View>
                <Text style={styles.brandText}>{item.brand}</Text>
              </View>

              <TouchableOpacity onPress={() => handleProductDetail(item)}>
                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
              </TouchableOpacity>

              <Text style={styles.descText} numberOfLines={2}>{item.description}</Text>

              <View style={styles.ratingRow}>
                <Ionicons name="star" size={13} color="#FBBF24" />
                <Text style={styles.ratingScore}>{item.rating.toFixed(1)}</Text>
                <Text style={styles.reviewCount}>({item.reviewsCount} รีวิว)</Text>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.stockText}>{item.stockStatus}</Text>
              </View>

              <View style={styles.priceActionRow}>
                <View style={styles.priceWrap}>
                  <Text style={styles.currency}>฿</Text>
                  <Text style={styles.price}>{item.price.toLocaleString()}</Text>
                  {item.originalPrice && (
                    <Text style={styles.oldPrice}>฿{item.originalPrice.toLocaleString()}</Text>
                  )}
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={() => handleAddToCart(item)}>
                  <Ionicons name="bag-add" size={16} color="#FFF" />
                  <Text style={styles.addBtnText}>สั่งซื้อ</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      {/* 3. BOTTOM NAVIGATION BAR */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navTab} onPress={() => setActiveTab("home")}>
          <Ionicons name={activeTab === "home" ? "home" : "home-outline"} size={22} color={activeTab === "home" ? COLORS.primary : COLORS.textSecondary} />
          <Text style={[styles.navLabel, activeTab === "home" && styles.navLabelActive]}>หน้าหลัก</Text>
          {activeTab === "home" && <View style={styles.activeBar} />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.navTab} onPress={() => { setActiveTab("products"); setSelectedCategory("All"); }}>
          <Ionicons name={activeTab === "products" ? "grid" : "grid-outline"} size={22} color={activeTab === "products" ? COLORS.primary : COLORS.textSecondary} />
          <Text style={[styles.navLabel, activeTab === "products" && styles.navLabelActive]}>สินค้า</Text>
          {activeTab === "products" && <View style={styles.activeBar} />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.navTab} onPress={() => { setActiveTab("cart"); Alert.alert("ตะกร้าสินค้า", `มีสินค้า ${cartCount} ชิ้น`); }}>
          <View>
            <Ionicons name={activeTab === "cart" ? "cart" : "cart-outline"} size={22} color={activeTab === "cart" ? COLORS.primary : COLORS.textSecondary} />
            {cartCount > 0 && (
              <View style={styles.navCartBadge}><Text style={styles.navCartText}>{cartCount}</Text></View>
            )}
          </View>
          <Text style={[styles.navLabel, activeTab === "cart" && styles.navLabelActive]}>ตะกร้า</Text>
          {activeTab === "cart" && <View style={styles.activeBar} />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.navTab} onPress={() => { setActiveTab("profile"); Alert.alert("บัญชีผู้ใช้", "เข้าสู่ระบบในชื่อ: Kanwit Store"); }}>
          <Ionicons name={activeTab === "profile" ? "person" : "person-outline"} size={22} color={activeTab === "profile" ? COLORS.primary : COLORS.textSecondary} />
          <Text style={[styles.navLabel, activeTab === "profile" && styles.navLabelActive]}>โปรไฟล์</Text>
          {activeTab === "profile" && <View style={styles.activeBar} />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topNav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: COLORS.card, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border, elevation: 3 },
  brandContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoBadge: { width: 32, height: 32, borderRadius: 8, backgroundColor: COLORS.primary, justifyContent: "center", alignItems: "center" },
  brandTitle: { fontSize: 15, fontWeight: "800", color: COLORS.text, letterSpacing: 0.5 },
  brandSub: { fontSize: 10, color: COLORS.textSecondary, fontWeight: "500" },
  topRightActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.background, justifyContent: "center", alignItems: "center", position: "relative" },
  cartBtn: { backgroundColor: COLORS.primaryLight },
  notifDot: { position: "absolute", top: 7, right: 7, width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.accent },
  cartBadge: { position: "absolute", top: -2, right: -2, backgroundColor: COLORS.accent, borderRadius: 9, minWidth: 16, height: 16, justifyContent: "center", alignItems: "center", paddingHorizontal: 3 },
  cartBadgeText: { color: "#FFF", fontSize: 9, fontWeight: "700" },
  listContent: { padding: 16, maxWidth: 800, width: "100%", alignSelf: "center" },
  categorySection: { marginBottom: 12 },
  catList: { gap: 8, paddingBottom: 4 },
  catChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 18, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catChipText: { fontSize: 12, fontWeight: "600", color: COLORS.textSecondary },
  catChipTextActive: { color: "#FFF" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  stockBadge: { backgroundColor: "#DCFCE7", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  stockBadgeText: { color: "#15803D", fontSize: 11, fontWeight: "700" },
  card: { backgroundColor: COLORS.card, borderRadius: 14, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border, overflow: "hidden", elevation: 2 },
  imgWrap: { width: "100%", height: 180, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center", padding: 12, position: "relative" },
  productImg: { width: "100%", height: "100%" },
  discountBadge: { position: "absolute", top: 10, right: 10, backgroundColor: COLORS.danger, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5 },
  discountText: { color: "#FFF", fontSize: 10, fontWeight: "800" },
  cardBody: { padding: 14 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  catTag: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  catTagText: { color: COLORS.primaryDark, fontSize: 10, fontWeight: "700" },
  brandText: { fontSize: 11, fontWeight: "600", color: COLORS.textSecondary },
  productName: { fontSize: 15, fontWeight: "700", color: COLORS.text, lineHeight: 20, marginBottom: 4 },
  descText: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 16, marginBottom: 8 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 10 },
  ratingScore: { fontSize: 12, fontWeight: "700", color: COLORS.text },
  reviewCount: { fontSize: 11, color: COLORS.textSecondary },
  dot: { color: COLORS.textSecondary, fontSize: 10 },
  stockText: { fontSize: 11, color: COLORS.success, fontWeight: "600" },
  priceActionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  priceWrap: { flexDirection: "row", alignItems: "baseline", gap: 2 },
  currency: { fontSize: 14, fontWeight: "700", color: COLORS.primary },
  price: { fontSize: 19, fontWeight: "800", color: COLORS.primary },
  oldPrice: { fontSize: 12, color: COLORS.textSecondary, textDecorationLine: "line-through", marginLeft: 5 },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: "#FFF", fontSize: 13, fontWeight: "700" },
  bottomNav: { flexDirection: "row", backgroundColor: COLORS.card, borderTopWidth: 1, borderTopColor: COLORS.border, paddingVertical: 8, elevation: 8 },
  navTab: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 3, position: "relative" },
  navLabel: { fontSize: 10, marginTop: 3, color: COLORS.textSecondary, fontWeight: "500" },
  navLabelActive: { color: COLORS.primary, fontWeight: "700" },
  activeBar: { position: "absolute", bottom: -4, width: 18, height: 3, borderRadius: 2, backgroundColor: COLORS.primary },
  navCartBadge: { position: "absolute", top: -3, right: -6, backgroundColor: COLORS.accent, borderRadius: 7, minWidth: 14, height: 14, justifyContent: "center", alignItems: "center", paddingHorizontal: 2 },
  navCartText: { color: "#FFF", fontSize: 8, fontWeight: "700" },
});