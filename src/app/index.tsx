/**
 * ============================================================================
 * React Native + Cloud DB (Mobile Application Screen)
 * ============================================================================
 * Course: Internet Programming - Kasetsart University Sriracha Campus
 * Screen: Products List (Cloud Database Connected)
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as SplashScreen from "expo-splash-screen";
import {
  Product,
  fetchProductsApi,
  API_BASE_URL,
  DEFAULT_PRODUCT_IMAGE,
} from "@/constants/api";

const COLORS = {
  primary: "#7C3AED",       // Purple
  primaryDark: "#6D28D9",
  primaryLight: "#F3E8FF",
  background: "#F8F9FA",
  card: "#FFFFFF",
  border: "#EEEEEE",
  text: "#0F172A",
  textSecondary: "#64748B",
  badgeActive: "#10B981",    // Green (Active)
  badgeLow: "#F59E0B",
  danger: "#EF4444",
};

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("products");

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

  // Search filter
  const filteredProducts = products.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProductPress = (product: Product) => {
    Alert.alert(
      product.name,
      `Category: ${product.category}\nStock: ${product.stock} in stock\nLocation: ${product.location}\nBrand: ${product.brand || "Unnamed Brand"}\nStatus: ${product.status}\nSizes: ${product.sizes || "N/A"}\nProduct Code: ${product.productCode || "N/A"}`,
      [{ text: "Close", style: "cancel" }]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.card} />

      {/* ================================================================== */}
      {/* 1. TOP NAVIGATION HEADER (Slide 28) */}
      {/* ================================================================== */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconBtn}>
          <Ionicons name="menu-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Products</Text>

        <TouchableOpacity style={styles.profileBtn}>
          <Ionicons name="person" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* ================================================================== */}
      {/* SEARCH & QUICK ACTION BAR (Slide 28) */}
      {/* ================================================================== */}
      <View style={styles.actionRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => Alert.alert("Add Product", "Open add product modal")}
        >
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          <Text style={styles.refreshBtnText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* ================================================================== */}
      {/* 2. PRODUCT CARDS (FLATLIST - Slide 28) */}
      {/* ================================================================== */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading products from Cloud DB...</Text>
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
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => handleProductPress(item)}
            >
              {/* Product Image */}
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: item.image || DEFAULT_PRODUCT_IMAGE }}
                  style={styles.productImage}
                  resizeMode="contain"
                />
              </View>

              {/* Details (Stock, Category, Location, Brand, Name) */}
              <View style={styles.detailsContainer}>
                <Text style={styles.detailMeta}>Stock: {item.stock} in stock</Text>
                <Text style={styles.detailMeta}>Category: {item.category}</Text>
                <Text style={styles.detailMeta}>Location: {item.location}</Text>
                <Text style={styles.detailMeta}>Brand: {item.brand || "Unnamed Brand"}</Text>
                <Text style={styles.productName}>{item.name}</Text>
              </View>

              {/* Status Badge & Arrow Action */}
              <View style={styles.badgeColumn}>
                <View
                  style={[
                    styles.statusBadge,
                    item.status === "Active" ? styles.badgeActive : styles.badgeInactive,
                  ]}
                >
                  <Text style={styles.statusBadgeText}>{item.status || "Active"}</Text>
                </View>

                <View style={styles.arrowIcon}>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* ================================================================== */}
      {/* 3. BOTTOM NAVIGATION TAB BAR (Slide 28) */}
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
          onPress={() => {
            setActiveTab("add");
            Alert.alert("Add", "Create new product in Cloud Database");
          }}
        >
          <Ionicons
            name={activeTab === "add" ? "add-circle" : "add-circle-outline"}
            size={24}
            color={activeTab === "add" ? COLORS.primary : COLORS.textSecondary}
          />
          <Text style={[styles.navLabel, activeTab === "add" && styles.navLabelActive]}>
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
            setActiveTab("categories");
            Alert.alert("Categories", "View product categories");
          }}
        >
          <Ionicons
            name={activeTab === "categories" ? "folder" : "folder-outline"}
            size={22}
            color={activeTab === "categories" ? COLORS.primary : COLORS.textSecondary}
          />
          <Text style={[styles.navLabel, activeTab === "categories" && styles.navLabelActive]}>
            Categories
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

  /* --- Top Navigation Header --- */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.card,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerIconBtn: {
    width: 36,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  profileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  /* --- Search & Action Row --- */
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 6,
    fontSize: 13,
    color: COLORS.text,
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
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  refreshBtnText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },

  /* --- List Content & Cards --- */
  listContent: {
    padding: 16,
    gap: 12,
    maxWidth: 800,
    width: "100%",
    alignSelf: "center",
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
    backgroundColor: COLORS.badgeActive,
  },
  badgeInactive: {
    backgroundColor: COLORS.badgeLow,
  },
  statusBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  arrowIcon: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
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