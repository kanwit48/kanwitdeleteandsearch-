# React Native + Cloud DB Application

A complete Full-Stack Mobile Application integrating React Native (Frontend) with an Express.js & Cloud MySQL Database (Backend).

## 🚀 Course & Project Information
- **Course:** Internet Programming, Kasetsart University Sriracha Campus
- **Topic:** React Native + Cloud DB
- **Student Name:** Kanwit Voottikulsin
- **Student ID:** 6730251417
- **Section:** 870
- **Cloud Server Host:** `119.59.102.161`
- **phpMyAdmin:** `http://119.59.102.161/nindamdb`

---

## 📂 Project Architecture

```
kanwit/
├── backend/
│   ├── .env.example          # Environment variables template
│   ├── .env                  # Backend credentials (PORT, DB_USER, DB_NAME, etc.)
│   ├── package.json          # Express, cors, mysql2, dotenv dependencies
│   ├── schema.sql            # MySQL schema & 3 seed products
│   ├── server.js             # REST API server (endpoints: /api, /api/products)
│   └── README.md             # Backend deployment & SSH instructions
├── src/
│   ├── app/
│   │   ├── _layout.tsx       # Root layout & Navigation provider
│   │   ├── index.tsx         # Main Products Screen (Slide 28 UI)
│   │   ├── explore.tsx       # Explore Screen
│   │   ├── login.tsx         # User login screen
│   │   └── signup.tsx        # User registration screen
│   ├── components/
│   │   └── app-tabs.tsx      # Native & Web Tabs Navigator
│   └── constants/
│       ├── api.ts            # Cloud DB API connector & fetch functions
│       └── theme.ts          # Colors & design system
├── app.json
└── package.json
```

---

## ⚙️ Backend Setup & Deployment (Slide 10-21)

1. **Connect to Cloud Server via SSH / PuTTY:**
   - **Host:** `119.59.102.161`
   - **Port:** `2222`
   - **Username:** `std6730251417`

2. **Upload Backend Files via FileZilla (SFTP):**
   - Upload `server.js`, `package.json`, `.env` to `/app` or `/home/std6730251417`

3. **Install Dependencies & Start Server:**
   ```bash
   npm ci
   node server.js
   ```

4. **API Endpoints:**
   - **Health Check:** `http://119.59.102.161:<PORT>/api`
   - **Get Products:** `http://119.59.102.161:<PORT>/api/products`

---

## 📱 Frontend React Native Setup (Slide 23-28)

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start the Mobile Application:**
   ```bash
   npx expo start
   ```

3. **UI Features:**
   - **Top Navigation Header:** Screen Title ("Products"), Side-menu icon, and Profile button
   - **Search & Quick Action Bar:** Search filter input, `+ Add` button, and `Refresh` button
   - **Product List (`FlatList`):** Displays products from Cloud MySQL DB with product image, stock quantity, category, store location, brand, product title, and `Active` status badge
   - **Bottom Navigation Tab Bar:** 4 tabs (Home, Add, Products, Categories)