# Individual Assignment - Kanwit Gaming Gear Shop App

A React Native mobile application built with Expo and Expo Router showcasing gaming gear products.

## Assignment Objectives
1. **Display Top and Bottom Navigation Menus**
   - Top navigation header with store branding, status, and action icons.
   - Category filtering pills navigation.
   - Bottom navigation menu bar with tab items (Home, Products, Cart, Profile).
2. **Display at least 3 Products**
   - Hardcoded product data with local assets located in `assets/images/`:
     1. **Logitech G PRO X SUPERLIGHT Wireless Gaming Mouse** (`mouse.jpg`)
     2. **HyperX Cloud III Wireless Gaming Headset** (`headset.webp`)
     3. **MEZZON Wireless RGB Mechanical Keyboard** (`keyboard.jpg`)
   - Product details: image, badge, name, features, rating, price (฿), and order action.
3. **Cleaned Architecture**
   - Without search, edit product, or add product features as specified in the assignment prompt.

## Project Structure
```
kanwit/
├── assets/
│   └── images/
│       ├── mouse.jpg       # Product 1
│       ├── headset.webp    # Product 2
│       └── keyboard.jpg    # Product 3
├── src/
│   ├── app/
│   │   ├── _layout.tsx     # Root Layout & Theme
│   │   ├── index.tsx       # Main Screen (Top/Bottom Nav & 3 Products)
│   │   ├── explore.tsx
│   │   └── products.json   # Hardcoded JSON data
│   ├── components/
│   │   ├── app-tabs.tsx    # Bottom navigation triggers
│   │   └── themed-text.tsx
│   └── constants/
│       ├── products.ts     # Products data model & items
│       └── theme.ts        # Colors & Spacing
├── app.json
└── package.json
```

## How to Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the Expo development server:
   ```bash
   npx expo start
   ```

3. Press `w` to open on Web, or scan the QR code with Expo Go on Android / iOS.