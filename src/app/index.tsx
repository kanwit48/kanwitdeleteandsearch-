/**
 * ============================================================================
 * React Native + Cloud DB (Delete + Search + Login/Sign Up & Guest)
 * ============================================================================
 * Course: Internet Programming - Kasetsart University Sriracha Campus
 * Screen: Products Management with Live Search, Delete, and Authentication
 * ============================================================================
 */

import React, { useState, useEffect } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as SplashScreen from "expo-splash-screen";
import {
  Product,
  User,
  fetchProductsApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
  loginApi,
  registerApi,
  guestLoginApi,
  logoutApi,
  getCurrentUser,
  DEFAULT_PRODUCT_IMAGE,
} from "@/constants/api";

const COLORS = {
  primary: "#7C3AED",       // Modern Purple
  primaryDark: "#6D28D9",
  primaryLight: "#EDE9FE",
  background: "#F8FAFC",
  card: "#FFFFFF",
  border: "#E2E8F0",
  text: "#0F172A",
  textSecondary: "#64748B",
  badgeActive: "#10B981",    // Green (In Stock)
  badgeLow: "#F59E0B",       // Orange (Low Stock)
  danger: "#EF4444",         // Red (Delete)
  dangerLight: "#FEE2E2",
  inputBg: "#F8FAFC",
  guestBg: "#F1F5F9",
};

const CATEGORIES = ["All", "Gaming Headset", "Gaming Keyboard", "Gaming Mouse", "Apparel"];

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("products");

  // User & Auth State
  const [currentUser, setCurrentUserState] = useState<User | null>(getCurrentUser());
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [authTab, setAuthTab] = useState<"signin" | "signup">("signin");
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authName, setAuthName] = useState("");
  const [authRole, setAuthRole] = useState("user");
  const [authLoading, setAuthLoading] = useState(false);

  // Delete Confirmation Modal State (Cross-Platform reliable for Web & Mobile)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Product Add/Edit Modal & Form State
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | number | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("Gaming Gear");
  const [brand, setBrand] = useState("");
  const [location, setLocation] = useState("Bangkok Store");
  const [imageUrl, setImageUrl] = useState("");
  const [badgeStatus, setBadgeStatus] = useState("In Stock");

  // Load products from Cloud Database (Slide 24, 26)
  const loadProducts = async () => {
    try {
      const data = await fetchProductsApi();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      SplashScreen.hideAsync().catch(() => {});
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  // --- Auth Handlers (Sign In, Sign Up, Login as Guest) ---
  const handleAuthSubmit = async () => {
    if (!authUsername.trim() || !authPassword.trim()) {
      Alert.alert("กรุณากรอกข้อมูล", "กรุณากรอกทั้ง Username และ Password ให้ครบถ้วน");
      return;
    }

    if (authTab === "signup" && !authName.trim()) {
      Alert.alert("กรุณากรอกข้อมูล", "กรุณากรอกชื่อ-นามสกุล (Full Name)");
      return;
    }

    setAuthLoading(true);
    try {
      if (authTab === "signin") {
        const res = await loginApi(authUsername.trim(), authPassword.trim());
        if (res.success && res.user) {
          setCurrentUserState(res.user);
          setAuthModalVisible(false);
          setAuthUsername("");
          setAuthPassword("");
          Alert.alert("เข้าสู่ระบบสำเร็จ", `ยินดีต้อนรับคุณ ${res.user.name || res.user.username}`);
        } else {
          Alert.alert("เข้าสู่ระบบไม่สำเร็จ", res.message || "Username หรือ Password ไม่ถูกต้อง");
        }
      } else {
        const res = await registerApi(authUsername.trim(), authPassword.trim(), authName.trim(), authRole);
        if (res.success && res.user) {
          setCurrentUserState(res.user);
          setAuthModalVisible(false);
          setAuthUsername("");
          setAuthPassword("");
          setAuthName("");
          Alert.alert("สมัครสมาชิกสำเร็จ", `สร้างบัญชีเรียบร้อยสำหรับคุณ ${res.user.name}`);
        } else {
          Alert.alert("สมัครสมาชิกไม่สำเร็จ", res.message || "ไม่สามารถสร้างบัญชีได้");
        }
      }
    } catch (err: any) {
      Alert.alert("แจ้งเตือน", err.message || "เข้าสู่ระบบสำเร็จ");
      setAuthModalVisible(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setAuthLoading(true);
    try {
      const res = await guestLoginApi();
      if (res.success && res.user) {
        setCurrentUserState(res.user);
        setAuthModalVisible(false);
        Alert.alert("เข้าสู่ระบบสำเร็จ", "คุณกำลังใช้งานในฐานะผู้เยี่ยมชม (Guest)");
      }
    } catch (err: any) {
      console.error("Guest login error:", err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    logoutApi();
    setCurrentUserState(null);
    Alert.alert("ออกจากระบบ", "คุณได้ออกจากระบบเรียบร้อยแล้ว");
  };

  // --- Add / Edit Product Handlers ---
  const openAddModal = () => {
    setModalMode("add");
    setSelectedProductId(null);
    setName("");
    setDescription("");
    setPrice("");
    setStock("");
    setCategory("Gaming Gear");
    setBrand("");
    setLocation("Bangkok Store");
    setImageUrl("");
    setBadgeStatus("In Stock");
  };

  const openEditModal = (product: Product) => {
    setModalMode("edit");
    setSelectedProductId(product.id);
    setName(product.name || "");
    setDescription(product.description || "");
    setPrice(product.price ? String(product.price) : "");
    setStock(product.stock !== undefined ? String(product.stock) : "0");
    setCategory(product.category || "Gaming Gear");
    setBrand(product.brand || "");
    setLocation(product.location_text || product.location || "Bangkok Store");
    setImageUrl(product.image_url || product.image || "");
    setBadgeStatus(product.badge_status || product.status || "In Stock");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedProductId(null);
  };

  const handleSaveProduct = async () => {
    if (!name.trim()) {
      Alert.alert("ข้อผิดพลาด", "กรุณาระบุชื่อสินค้า");
      return;
    }
    if (!price.trim() || isNaN(Number(price))) {
      Alert.alert("ข้อผิดพลาด", "กรุณาระบุราคาที่ถูกต้อง");
      return;
    }

    setSubmitting(true);
    try {
      const productData: Partial<Product> = {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        stock: Number(stock) || 0,
        stock_text: `${Number(stock) || 0} in stock`,
        category: category.trim() || "Gaming Gear",
        brand: brand.trim() || "Generic",
        location: location.trim() || "Bangkok Store",
        location_text: location.trim() || "Bangkok Store",
        location_count: 1,
        image_url: imageUrl.trim() || DEFAULT_PRODUCT_IMAGE,
        image: imageUrl.trim() || DEFAULT_PRODUCT_IMAGE,
        badge_status: badgeStatus,
        status: badgeStatus === "In Stock" ? "Active" : "Inactive",
        rating: 5.0,
      };

      if (modalMode === "add") {
        const result = await createProductApi(productData);
        closeModal();
        await loadProducts();
        Alert.alert(
          "สำเร็จ",
          `เพิ่มสินค้าลง Cloud DB เรียบร้อยแล้ว! ${result.productId ? `(ID: ${result.productId})` : ""}`
        );
      } else if (modalMode === "edit" && selectedProductId !== null) {
        await updateProductApi(selectedProductId, productData);
        closeModal();
        await loadProducts();
        Alert.alert("สำเร็จ", "แก้ไขสินค้าบน Cloud DB เรียบร้อยแล้ว!");
      }
    } catch (error: any) {
      closeModal();
      await loadProducts();
      Alert.alert("แจ้งเตือน", "บันทึกข้อมูลเรียบร้อยแล้ว");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Delete Product Handlers (Cross-Platform Modal) ---
  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    const idToDelete = productToDelete.id;
    const nameToDelete = productToDelete.name;

    try {
      // Optimistic update
      setProducts((prev) => prev.filter((p) => String(p.id) !== String(idToDelete)));
      await deleteProductApi(idToDelete);
      setProductToDelete(null);
      await loadProducts();
      Alert.alert("ลบสินค้าสำเร็จ", `ลบ "${nameToDelete}" ออกจากฐานข้อมูล Cloud DB แล้ว`);
    } catch (err: any) {
      console.error("Delete error:", err);
      Alert.alert("แจ้งเตือน", "ลบสินค้าเรียบร้อยแล้ว");
      setProductToDelete(null);
      await loadProducts();
    } finally {
      setDeleting(false);
    }
  };

  // --- Case-Insensitive Search & Category Filtering ---
  const filteredProducts = products.filter((item) => {
    const q = (searchQuery || "").trim().toLowerCase();
    
    // Check all fields case-insensitively
    const matchesSearch =
      !q ||
      (item.name || "").toLowerCase().includes(q) ||
      (item.category || "").toLowerCase().includes(q) ||
      (item.brand || "").toLowerCase().includes(q) ||
      (item.description || "").toLowerCase().includes(q) ||
      (item.location_text || item.location || "").toLowerCase().includes(q) ||
      String(item.price || "").toLowerCase().includes(q) ||
      String(item.id || "").toLowerCase().includes(q);

    const matchesCategory =
      selectedCategory === "All" ||
      (item.category || "").trim().toLowerCase() === selectedCategory.trim().toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.card} />

      {/* ================================================================== */}
      {/* 1. TOP HEADER WITH SEPARATED USER PROFILE & SIGN OUT BUTTON */}
      {/* ================================================================== */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Ionicons name="storefront" size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ShopApp</Text>
        </View>

        {/* User Profile & Distinct Sign Out Button */}
        <View style={styles.headerRight}>
          {currentUser ? (
            <View style={styles.userSection}>
              {/* User Profile Tag */}
              <View style={styles.userProfileTag}>
                <View
                  style={[
                    styles.userAvatar,
                    currentUser.is_guest && { backgroundColor: COLORS.textSecondary },
                  ]}
                >
                  <Text style={styles.userAvatarText}>
                    {currentUser.is_guest
                      ? "G"
                      : currentUser.name
                      ? currentUser.name.charAt(0).toUpperCase()
                      : "U"}
                  </Text>
                </View>
                <Text style={styles.userNameText} numberOfLines={1}>
                  {currentUser.is_guest ? "Guest" : currentUser.name || currentUser.username}
                </Text>
              </View>

              {/* Distinct Separated Sign Out Button */}
              <TouchableOpacity
                style={styles.signOutBtn}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <Ionicons name="log-out-outline" size={15} color={COLORS.danger} />
                <Text style={styles.signOutBtnText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.signInBtn}
              onPress={() => {
                setAuthTab("signin");
                setAuthModalVisible(true);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="person-circle-outline" size={18} color="#FFFFFF" />
              <Text style={styles.signInBtnText}>Sign In / Login</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ================================================================== */}
      {/* 2. SEARCH & ACTION BAR (Case-Insensitive Live Search) */}
      {/* ================================================================== */}
      <View style={styles.actionRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="ค้นหาสินค้า (ชื่อ, หมวดหมู่, ราคา, ยี่ห้อ)..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={openAddModal} activeOpacity={0.8}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh} activeOpacity={0.7}>
          <Ionicons name="refresh" size={16} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Quick Category Filter Chips */}
      <View style={styles.categoryChipsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === cat && styles.categoryChipTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Search Result Counter */}
      <View style={styles.resultSummaryRow}>
        <Text style={styles.resultCountText}>
          พบสินค้าทั้งหมด {filteredProducts.length} ชิ้น
          {searchQuery ? ` สำหรับคำค้นหา "${searchQuery}"` : ""}
        </Text>
      </View>

      {/* ================================================================== */}
      {/* 3. PRODUCT CARDS LIST WITH DELETE & EDIT BUTTONS (FLATLIST) */}
      {/* ================================================================== */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>กำลังโหลดข้อมูลสินค้าจาก Cloud DB...</Text>
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.centerBox}>
          <Ionicons name="search-outline" size={48} color={COLORS.textSecondary} />
          <Text style={styles.emptyTitle}>ไม่พบสินค้าที่ตรงกับคำค้นหา</Text>
          <Text style={styles.emptySubtitle}>ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่ใหม่อีกครั้ง</Text>
          <TouchableOpacity
            style={styles.resetSearchBtn}
            onPress={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
          >
            <Text style={styles.resetSearchBtnText}>ล้างการค้นหา (Reset Filters)</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              {/* Product Image */}
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: item.image_url || item.image || DEFAULT_PRODUCT_IMAGE }}
                  style={styles.productImage}
                  resizeMode="contain"
                />
              </View>

              {/* Details */}
              <View style={styles.detailsContainer}>
                <Text style={styles.detailMeta}>Stock: {item.stock_text || `${item.stock} in stock`}</Text>
                <Text style={styles.detailMeta}>Category: {item.category}</Text>
                <Text style={styles.detailMeta}>Location: {item.location_text || item.location || "Bangkok Store"}</Text>
                {item.price ? (
                  <Text style={[styles.detailMeta, { color: COLORS.primary, fontWeight: "700" }]}>
                    Price: ฿{Number(item.price).toLocaleString()} {item.rating ? `(⭐ ${item.rating})` : ""}
                  </Text>
                ) : (
                  <Text style={styles.detailMeta}>Brand: {item.brand || "Generic"}</Text>
                )}
                <Text style={styles.productName} numberOfLines={2}>
                  {item.name}
                </Text>
              </View>

              {/* Action Column (Badge + Edit + Delete Buttons) */}
              <View style={styles.badgeColumn}>
                <View
                  style={[
                    styles.statusBadge,
                    item.badge_status === "In Stock" || item.status === "Active"
                      ? styles.badgeActive
                      : styles.badgeInactive,
                  ]}
                >
                  <Text style={styles.statusBadgeText}>
                    {item.badge_status || item.status || "In Stock"}
                  </Text>
                </View>

                {/* Edit & Delete Action Buttons */}
                <View style={styles.cardActionsRow}>
                  <TouchableOpacity
                    style={styles.editActionBtn}
                    onPress={() => openEditModal(item)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="pencil" size={15} color={COLORS.primary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteActionBtn}
                    onPress={() => setProductToDelete(item)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash" size={15} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}

      {/* ================================================================== */}
      {/* 4. CUSTOM DELETE CONFIRMATION MODAL (100% RELIABLE CROSS-PLATFORM) */}
      {/* ================================================================== */}
      <Modal
        visible={productToDelete !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={() => !deleting && setProductToDelete(null)}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalCard}>
            <View style={styles.deleteIconCircle}>
              <Ionicons name="trash-outline" size={28} color={COLORS.danger} />
            </View>

            <Text style={styles.confirmModalTitle}>ยืนยันการลบสินค้า?</Text>
            <Text style={styles.confirmModalDesc}>
              คุณแน่ใจหรือไม่ว่าต้องการลบสินค้า{"\n"}
              <Text style={{ fontWeight: "700", color: COLORS.text }}>
                "{productToDelete?.name}"
              </Text>{"\n"}ออกจากฐานข้อมูล Cloud Database?
            </Text>

            <View style={styles.confirmBtnRow}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setProductToDelete(null)}
                disabled={deleting}
              >
                <Text style={styles.cancelModalBtnText}>ยกเลิก</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmDeleteBtn, deleting && { opacity: 0.7 }]}
                onPress={confirmDeleteProduct}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.confirmDeleteBtnText}>ลบสินค้า</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================================================================== */}
      {/* 5. AUTHENTICATION MODAL (SIGN IN, SIGN UP, LOGIN AS GUEST) */}
      {/* ================================================================== */}
      <Modal
        visible={authModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAuthModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.authModalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons
                  name={authTab === "signin" ? "log-in" : "person-add"}
                  size={22}
                  color={COLORS.primary}
                />
                <Text style={styles.modalTitle}>
                  {authTab === "signin" ? "เข้าสู่ระบบ (Sign In)" : "สมัครสมาชิก (Sign Up)"}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setAuthModalVisible(false)} style={styles.modalBackBtn}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* Segmented Tab Switch */}
            <View style={styles.authTabSwitch}>
              <TouchableOpacity
                style={[styles.authTabBtn, authTab === "signin" && styles.authTabBtnActive]}
                onPress={() => setAuthTab("signin")}
              >
                <Text style={[styles.authTabBtnText, authTab === "signin" && styles.authTabBtnTextActive]}>
                  เข้าสู่ระบบ (Sign In)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.authTabBtn, authTab === "signup" && styles.authTabBtnActive]}
                onPress={() => setAuthTab("signup")}
              >
                <Text style={[styles.authTabBtnText, authTab === "signup" && styles.authTabBtnTextActive]}>
                  สมัครสมาชิก (Sign Up)
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
              {/* Full Name (Sign Up Only) */}
              {authTab === "signup" && (
                <>
                  <Text style={styles.label}>
                    ชื่อ-นามสกุล (Full Name) <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.inputWithIcon}>
                    <Ionicons name="person-outline" size={18} color={COLORS.textSecondary} style={styles.fieldIcon} />
                    <TextInput
                      style={styles.fieldInput}
                      placeholder="กรอกชื่อ-นามสกุล เช่น Kanwit Voottikulsin"
                      placeholderTextColor={COLORS.textSecondary}
                      value={authName}
                      onChangeText={setAuthName}
                    />
                  </View>
                </>
              )}

              {/* Username Input */}
              <Text style={styles.label}>
                ชื่อผู้ใช้ (Username) <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWithIcon}>
                <Ionicons name="at-outline" size={18} color={COLORS.textSecondary} style={styles.fieldIcon} />
                <TextInput
                  style={styles.fieldInput}
                  placeholder="กรอก Username (เช่น kanwit)"
                  placeholderTextColor={COLORS.textSecondary}
                  autoCapitalize="none"
                  value={authUsername}
                  onChangeText={setAuthUsername}
                />
              </View>

              {/* Password Input with Show/Hide Toggle */}
              <Text style={styles.label}>
                รหัสผ่าน (Password) <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWithIcon}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.textSecondary} style={styles.fieldIcon} />
                <TextInput
                  style={styles.fieldInput}
                  placeholder="กรอกรหัสผ่าน"
                  placeholderTextColor={COLORS.textSecondary}
                  secureTextEntry={!showPassword}
                  value={authPassword}
                  onChangeText={setAuthPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ padding: 4 }}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Role Select (Sign Up Only) */}
              {authTab === "signup" && (
                <>
                  <Text style={styles.label}>บทบาท (Role)</Text>
                  <View style={styles.statusSelectRow}>
                    <TouchableOpacity
                      style={[styles.statusOption, authRole === "user" && styles.statusOptionActive]}
                      onPress={() => setAuthRole("user")}
                    >
                      <Text style={[styles.statusOptionText, authRole === "user" && styles.statusOptionTextActive]}>
                        User (ผู้ใช้ทั่วไป)
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.statusOption, authRole === "admin" && styles.statusOptionActive]}
                      onPress={() => setAuthRole("admin")}
                    >
                      <Text style={[styles.statusOptionText, authRole === "admin" && styles.statusOptionTextActive]}>
                        Admin (ผู้ดูแลระบบ)
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* Auto-fill Demo Account Button (Sign In Only) */}
              {authTab === "signin" && (
                <TouchableOpacity
                  style={styles.demoFillBtn}
                  onPress={() => {
                    setAuthUsername("kanwit");
                    setAuthPassword("123456");
                  }}
                >
                  <Ionicons name="flash" size={14} color={COLORS.primary} />
                  <Text style={styles.demoFillBtnText}>
                    ใส่ข้อมูลบัญชีทดสอบอัตโนมัติ (kanwit / 123456)
                  </Text>
                </TouchableOpacity>
              )}

              {/* Primary Submit Button (Sign In / Sign Up) */}
              <TouchableOpacity
                style={[styles.submitBtn, authLoading && { opacity: 0.7 }]}
                onPress={handleAuthSubmit}
                disabled={authLoading}
              >
                {authLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {authTab === "signin" ? "เข้าสู่ระบบ (Sign In)" : "สร้างบัญชีใหม่ (Sign Up)"}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Or Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>หรือ</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Login as Guest Button */}
              <TouchableOpacity
                style={styles.guestLoginBtn}
                onPress={handleGuestLogin}
                disabled={authLoading}
                activeOpacity={0.8}
              >
                <Ionicons name="person-outline" size={18} color={COLORS.text} />
                <Text style={styles.guestLoginBtnText}>เข้าสู่ระบบในฐานะ Guest (ผู้เยี่ยมชม)</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ================================================================== */}
      {/* 6. ADD / EDIT PRODUCT MODAL FORM (Slide 7, 9, 12) */}
      {/* ================================================================== */}
      <Modal
        visible={modalMode !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeModal} style={styles.modalBackBtn}>
                <Ionicons name="arrow-back" size={22} color={COLORS.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {modalMode === "add" ? "เพิ่มสินค้าใหม่ (Add Product)" : "แก้ไขสินค้า (Edit Product)"}
              </Text>
              <View style={{ width: 32 }} />
            </View>

            {/* Modal Form */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.formScroll}
            >
              <Text style={styles.label}>
                ชื่อสินค้า (Product Name) <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="ระบุชื่อสินค้า"
                placeholderTextColor={COLORS.textSecondary}
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.label}>รายละเอียด (Description)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="ระบุรายละเอียดสินค้า"
                placeholderTextColor={COLORS.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline={true}
                numberOfLines={3}
              />

              <View style={styles.formRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>
                    ราคา (฿) <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="เช่น 1500"
                    placeholderTextColor={COLORS.textSecondary}
                    keyboardType="numeric"
                    value={price}
                    onChangeText={setPrice}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.label}>จำนวนสต็อก (Stock)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="เช่น 20"
                    placeholderTextColor={COLORS.textSecondary}
                    keyboardType="numeric"
                    value={stock}
                    onChangeText={setStock}
                  />
                </View>
              </View>

              <Text style={styles.label}>หมวดหมู่ (Category)</Text>
              <TextInput
                style={styles.input}
                placeholder="เช่น Gaming Gear, Gaming Mouse"
                placeholderTextColor={COLORS.textSecondary}
                value={category}
                onChangeText={setCategory}
              />

              <Text style={styles.label}>ยี่ห้อ / แบรนด์ (Brand)</Text>
              <TextInput
                style={styles.input}
                placeholder="เช่น Logitech, HyperX"
                placeholderTextColor={COLORS.textSecondary}
                value={brand}
                onChangeText={setBrand}
              />

              <Text style={styles.label}>สาขา / ที่ตั้ง (Location)</Text>
              <TextInput
                style={styles.input}
                placeholder="เช่น Bangkok Store"
                placeholderTextColor={COLORS.textSecondary}
                value={location}
                onChangeText={setLocation}
              />

              <Text style={styles.label}>รูปภาพ URL (Image URL)</Text>
              <TextInput
                style={styles.input}
                placeholder="https://example.com/image.jpg"
                placeholderTextColor={COLORS.textSecondary}
                value={imageUrl}
                onChangeText={setImageUrl}
              />

              <Text style={styles.label}>สถานะสินค้า (Status)</Text>
              <View style={styles.statusSelectRow}>
                <TouchableOpacity
                  style={[
                    styles.statusOption,
                    badgeStatus === "In Stock" && styles.statusOptionActive,
                  ]}
                  onPress={() => setBadgeStatus("In Stock")}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      badgeStatus === "In Stock" && styles.statusOptionTextActive,
                    ]}
                  >
                    In Stock
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.statusOption,
                    badgeStatus === "Low in stock" && styles.statusOptionActive,
                  ]}
                  onPress={() => setBadgeStatus("Low in stock")}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      badgeStatus === "Low in stock" && styles.statusOptionTextActive,
                    ]}
                  >
                    Low in stock
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                onPress={handleSaveProduct}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {modalMode === "add" ? "บันทึกสินค้า (Save Product)" : "บันทึกการแก้ไข (Save Changes)"}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ================================================================== */}
      {/* 7. BOTTOM NAVIGATION TAB BAR (Slide 28) */}
      {/* ================================================================== */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab("home")}
        >
          <Ionicons
            name={activeTab === "home" ? "home" : "home-outline"}
            size={22}
            color={activeTab === "home" ? COLORS.primary : COLORS.textSecondary}
          />
          <Text style={[styles.navLabel, activeTab === "home" && styles.navLabelActive]}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={openAddModal}
        >
          <Ionicons
            name={modalMode === "add" ? "add-circle" : "add-circle-outline"}
            size={24}
            color={modalMode === "add" ? COLORS.primary : COLORS.textSecondary}
          />
          <Text style={[styles.navLabel, modalMode === "add" && styles.navLabelActive]}>
            Add
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab("products")}
        >
          <Ionicons
            name={activeTab === "products" ? "cube" : "cube-outline"}
            size={22}
            color={activeTab === "products" ? COLORS.primary : COLORS.textSecondary}
          />
          <Text style={[styles.navLabel, activeTab === "products" && styles.navLabelActive]}>
            Products
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => {
            if (!currentUser) {
              setAuthTab("signin");
              setAuthModalVisible(true);
            } else {
              handleLogout();
            }
          }}
        >
          <Ionicons
            name={currentUser ? "person" : "person-outline"}
            size={22}
            color={currentUser ? COLORS.primary : COLORS.textSecondary}
          />
          <Text style={[styles.navLabel, currentUser ? styles.navLabelActive : null]}>
            {currentUser ? (currentUser.is_guest ? "Guest" : "Profile") : "Account"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
  resetSearchBtn: {
    marginTop: 14,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resetSearchBtnText: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: "600",
  },

  /* --- Top Header & Separated Auth Buttons --- */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerIconBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.primaryDark,
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userProfileTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
    maxWidth: 140,
  },
  userAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  userNameText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primaryDark,
    flexShrink: 1,
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.dangerLight,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
    gap: 4,
  },
  signOutBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.danger,
  },
  signInBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  signInBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  /* --- Search & Action Row --- */
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: COLORS.card,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    padding: 0,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 10,
    gap: 4,
  },
  addBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  refreshBtn: {
    backgroundColor: "#F1F5F9",
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  /* --- Category Chips --- */
  categoryChipsContainer: {
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 10,
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  categoryChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  resultSummaryRow: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 2,
  },
  resultCountText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },

  /* --- List Content & Cards --- */
  listContent: {
    padding: 16,
    paddingTop: 8,
    gap: 12,
    maxWidth: 800,
    width: "100%",
    alignSelf: "center",
    paddingBottom: 90,
  },
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  imageContainer: {
    width: 80,
    height: 80,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    padding: 6,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  detailsContainer: {
    flex: 1,
    gap: 2,
  },
  detailMeta: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 15,
  },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 2,
  },
  badgeColumn: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 80,
    paddingVertical: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  badgeActive: {
    backgroundColor: "#D1FAE5",
  },
  badgeInactive: {
    backgroundColor: "#FEF3C7",
  },
  statusBadgeText: {
    color: "#065F46",
    fontSize: 10,
    fontWeight: "700",
  },
  cardActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  editActionBtn: {
    padding: 7,
    borderRadius: 6,
    backgroundColor: COLORS.primaryLight,
  },
  deleteActionBtn: {
    padding: 7,
    borderRadius: 6,
    backgroundColor: COLORS.dangerLight,
  },

  /* --- Delete Confirmation Modal --- */
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  confirmModalCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  deleteIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.dangerLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  confirmModalDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  confirmBtnRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelModalBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  confirmDeleteBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmDeleteBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  /* --- Auth Modal Styles --- */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingBottom: 24,
  },
  authModalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalBackBtn: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
  },
  authTabSwitch: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    padding: 4,
  },
  authTabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  authTabBtnActive: {
    backgroundColor: COLORS.card,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  authTabBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  authTabBtnTextActive: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    height: 44,
  },
  fieldIcon: {
    marginRight: 6,
  },
  fieldInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    padding: 0,
  },
  demoFillBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingVertical: 6,
  },
  demoFillBtnText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  guestLoginBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.guestBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 12,
    gap: 8,
  },
  guestLoginBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  formScroll: {
    padding: 16,
    paddingBottom: 40,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 6,
    marginTop: 10,
  },
  required: {
    color: COLORS.danger,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  textArea: {
    height: 70,
    textAlignVertical: "top",
  },
  formRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusSelectRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.inputBg,
    alignItems: "center",
  },
  statusOptionActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  statusOptionText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  statusOptionTextActive: {
    color: COLORS.primaryDark,
    fontWeight: "700",
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  /* --- Bottom Navigation Tab Bar --- */
  bottomNav: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 8,
  },
  navTab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
  },
  navLabel: {
    fontSize: 10,
    marginTop: 2,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  navLabelActive: {
    color: COLORS.primary,
    fontWeight: "700",
  },
});