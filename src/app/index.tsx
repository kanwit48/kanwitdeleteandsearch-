/**
 * ============================================================================
 * React Native + Cloud DB (Delete + Search + Login/Sign Up)
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
  logoutApi,
  getCurrentUser,
  DEFAULT_PRODUCT_IMAGE,
} from "@/constants/api";

const COLORS = {
  primary: "#7C3AED",       // Purple
  primaryDark: "#6D28D9",
  primaryLight: "#F3E8FF",
  background: "#F8F9FA",
  card: "#FFFFFF",
  border: "#E2E8F0",
  text: "#0F172A",
  textSecondary: "#64748B",
  badgeActive: "#10B981",    // Green (Active / In Stock)
  badgeLow: "#F59E0B",       // Orange (Low Stock)
  danger: "#EF4444",         // Red (Delete)
  inputBg: "#F8FAFC",
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
  const [authName, setAuthName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Product Add/Edit Modal & Form State
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | number | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [location, setLocation] = useState("");
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

  // --- Auth Handlers (Sign In & Sign Up) ---
  const handleAuthSubmit = async () => {
    if (!authUsername.trim() || !authPassword.trim()) {
      Alert.alert("Validation Error", "Please enter both username and password.");
      return;
    }

    if (authTab === "signup" && !authName.trim()) {
      Alert.alert("Validation Error", "Please enter your full name.");
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
          Alert.alert("Welcome Back!", `Signed in as ${res.user.name || res.user.username}`);
        } else {
          Alert.alert("Sign In Failed", res.message || "Invalid username or password.");
        }
      } else {
        const res = await registerApi(authUsername.trim(), authPassword.trim(), authName.trim());
        if (res.success && res.user) {
          setCurrentUserState(res.user);
          setAuthModalVisible(false);
          setAuthUsername("");
          setAuthPassword("");
          setAuthName("");
          Alert.alert("Welcome!", `Account created successfully for ${res.user.name}`);
        } else {
          Alert.alert("Sign Up Failed", res.message || "Could not register account.");
        }
      }
    } catch (err: any) {
      Alert.alert("Authentication Notice", err.message || "Auth completed in local session.");
      setAuthModalVisible(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          logoutApi();
          setCurrentUserState(null);
          Alert.alert("Signed Out", "You have been signed out.");
        },
      },
    ]);
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
      Alert.alert("Validation Error", "Please enter a product name.");
      return;
    }
    if (!price.trim() || isNaN(Number(price))) {
      Alert.alert("Validation Error", "Please enter a valid price.");
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
          "Success",
          `Product created successfully in Cloud DB! ${result.productId ? `(ID: ${result.productId})` : ""}`
        );
      } else if (modalMode === "edit" && selectedProductId !== null) {
        await updateProductApi(selectedProductId, productData);
        closeModal();
        await loadProducts();
        Alert.alert("Success", "Product updated successfully in Cloud DB!");
      }
    } catch (error: any) {
      closeModal();
      await loadProducts();
      Alert.alert("Notice", "Saved to local store (Cloud DB offline).");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Delete Product Handler (Slide & Requirements) ---
  const handleDeleteProduct = (product: Product) => {
    Alert.alert(
      "Delete Product",
      `Are you sure you want to delete "${product.name}" from Cloud Database?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProductApi(product.id);
              await loadProducts();
              Alert.alert("Deleted", `"${product.name}" has been removed from database.`);
            } catch (err: any) {
              Alert.alert("Error", err.message || "Could not delete product.");
            }
          },
        },
      ]
    );
  };

  // --- Search & Category Filtering ---
  const filteredProducts = products.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "All" || item.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.card} />

      {/* ================================================================== */}
      {/* 1. TOP NAVIGATION HEADER WITH USER PROFILE & AUTH (Slide 28) */}
      {/* ================================================================== */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Ionicons name="menu-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Products</Text>
        </View>

        {/* User Profile / Login Button */}
        <View style={styles.headerRight}>
          {currentUser ? (
            <TouchableOpacity
              style={styles.userBadgeBtn}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                </Text>
              </View>
              <View style={styles.userInfoBox}>
                <Text style={styles.userNameText} numberOfLines={1}>
                  {currentUser.name || currentUser.username}
                </Text>
                <Text style={styles.userRoleText}>Sign out</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.signInBtn}
              onPress={() => {
                setAuthTab("signin");
                setAuthModalVisible(true);
              }}
            >
              <Ionicons name="log-in-outline" size={16} color="#FFFFFF" />
              <Text style={styles.signInBtnText}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ================================================================== */}
      {/* 2. SEARCH & ACTION BAR (Live Search Filter) */}
      {/* ================================================================== */}
      <View style={styles.actionRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products by name, category, brand..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
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

      {/* Search Result Summary */}
      <View style={styles.resultSummaryRow}>
        <Text style={styles.resultCountText}>
          Found {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
          {searchQuery ? ` for "${searchQuery}"` : ""}
        </Text>
      </View>

      {/* ================================================================== */}
      {/* 3. PRODUCT CARDS LIST WITH DELETE & EDIT BUTTONS (FLATLIST) */}
      {/* ================================================================== */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading products from Cloud DB...</Text>
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.centerBox}>
          <Ionicons name="search-outline" size={48} color={COLORS.textSecondary} />
          <Text style={styles.emptyTitle}>No products found</Text>
          <Text style={styles.emptySubtitle}>Try adjusting your search query or category filter</Text>
          <TouchableOpacity style={styles.resetSearchBtn} onPress={() => { setSearchQuery(""); setSelectedCategory("All"); }}>
            <Text style={styles.resetSearchBtnText}>Reset Filters</Text>
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
                  <Text style={styles.detailMeta}>Brand: {item.brand || "Unnamed Brand"}</Text>
                )}
                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
              </View>

              {/* Action Column (Badge + Edit/Delete Buttons) */}
              <View style={styles.badgeColumn}>
                <View
                  style={[
                    styles.statusBadge,
                    (item.badge_status === "In Stock" || item.status === "Active")
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
                    onPress={() => handleDeleteProduct(item)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={15} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}

      {/* ================================================================== */}
      {/* 4. AUTHENTICATION MODAL (SIGN IN & SIGN UP) */}
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
              <Text style={styles.modalTitle}>
                {authTab === "signin" ? "Sign In to Account" : "Create New Account"}
              </Text>
              <TouchableOpacity onPress={() => setAuthModalVisible(false)} style={styles.modalBackBtn}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* Auth Segmented Tab Control */}
            <View style={styles.authTabSwitch}>
              <TouchableOpacity
                style={[styles.authTabBtn, authTab === "signin" && styles.authTabBtnActive]}
                onPress={() => setAuthTab("signin")}
              >
                <Text style={[styles.authTabBtnText, authTab === "signin" && styles.authTabBtnTextActive]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.authTabBtn, authTab === "signup" && styles.authTabBtnActive]}
                onPress={() => setAuthTab("signup")}
              >
                <Text style={[styles.authTabBtnText, authTab === "signup" && styles.authTabBtnTextActive]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
              {/* Full Name (Only for Sign Up) */}
              {authTab === "signup" && (
                <>
                  <Text style={styles.label}>Full Name <Text style={styles.required}>*</Text></Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your name (e.g. Kanwit)"
                    placeholderTextColor={COLORS.textSecondary}
                    value={authName}
                    onChangeText={setAuthName}
                  />
                </>
              )}

              {/* Username */}
              <Text style={styles.label}>Username <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="Enter username (e.g. kanwit)"
                placeholderTextColor={COLORS.textSecondary}
                autoCapitalize="none"
                value={authUsername}
                onChangeText={setAuthUsername}
              />

              {/* Password */}
              <Text style={styles.label}>Password <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor={COLORS.textSecondary}
                secureTextEntry={true}
                value={authPassword}
                onChangeText={setAuthPassword}
              />

              {/* Quick Demo Credentials Info */}
              {authTab === "signin" && (
                <TouchableOpacity
                  style={styles.demoFillBtn}
                  onPress={() => {
                    setAuthUsername("kanwit");
                    setAuthPassword("123456");
                  }}
                >
                  <Ionicons name="key-outline" size={14} color={COLORS.primary} />
                  <Text style={styles.demoFillBtnText}>Auto-fill Demo Credentials (kanwit / 123456)</Text>
                </TouchableOpacity>
              )}

              {/* Submit Auth Button */}
              <TouchableOpacity
                style={[styles.submitBtn, authLoading && { opacity: 0.7 }]}
                onPress={handleAuthSubmit}
                disabled={authLoading}
              >
                {authLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {authTab === "signin" ? "Sign In" : "Create Account"}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ================================================================== */}
      {/* 5. ADD / EDIT PRODUCT MODAL FORM (Slide 7, 9, 12) */}
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
                {modalMode === "add" ? "Add Product" : "Edit Product"}
              </Text>
              <View style={{ width: 32 }} />
            </View>

            {/* Modal Form ScrollView */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.formScroll}
            >
              {/* Product Name */}
              <Text style={styles.label}>Name <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="Enter product name"
                placeholderTextColor={COLORS.textSecondary}
                value={name}
                onChangeText={setName}
              />

              {/* Description */}
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter description"
                placeholderTextColor={COLORS.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline={true}
                numberOfLines={3}
              />

              {/* Price & Stock Row */}
              <View style={styles.formRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>Price <Text style={styles.required}>*</Text></Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter price"
                    placeholderTextColor={COLORS.textSecondary}
                    keyboardType="numeric"
                    value={price}
                    onChangeText={setPrice}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.label}>Stock</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter stock quantity"
                    placeholderTextColor={COLORS.textSecondary}
                    keyboardType="numeric"
                    value={stock}
                    onChangeText={setStock}
                  />
                </View>
              </View>

              {/* Category */}
              <Text style={styles.label}>Category</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter category"
                placeholderTextColor={COLORS.textSecondary}
                value={category}
                onChangeText={setCategory}
              />

              {/* Brand */}
              <Text style={styles.label}>Brand</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter brand"
                placeholderTextColor={COLORS.textSecondary}
                value={brand}
                onChangeText={setBrand}
              />

              {/* Location */}
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter location"
                placeholderTextColor={COLORS.textSecondary}
                value={location}
                onChangeText={setLocation}
              />

              {/* Image URL */}
              <Text style={styles.label}>Image URL</Text>
              <TextInput
                style={styles.input}
                placeholder="https://example.com/image.jpg"
                placeholderTextColor={COLORS.textSecondary}
                value={imageUrl}
                onChangeText={setImageUrl}
              />

              {/* Status Selector */}
              <Text style={styles.label}>Status</Text>
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

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                onPress={handleSaveProduct}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {modalMode === "add" ? "Save Product" : "Save Changes"}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ================================================================== */}
      {/* 6. BOTTOM NAVIGATION TAB BAR (Slide 28) */}
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
            {currentUser ? "Profile" : "Account"}
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

  /* --- Top Navigation Header --- */
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
    fontWeight: "700",
    color: COLORS.text,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  userBadgeBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  userAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  userInfoBox: {
    maxWidth: 90,
  },
  userNameText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  userRoleText: {
    fontSize: 9,
    color: COLORS.textSecondary,
  },
  signInBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
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
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
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
    padding: 6,
    borderRadius: 6,
    backgroundColor: COLORS.primaryLight,
  },
  deleteActionBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: "#FEE2E2",
  },

  /* --- Modal Styles --- */
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
    maxHeight: "85%",
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
    marginTop: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
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