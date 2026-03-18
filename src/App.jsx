// src/App.jsx

import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation
} from "react-router-dom";

import "./App.css";

/* HELPERS */
const getSellerName = (item) => {
  if (item.realSellerName) return item.realSellerName;
  if (item.adminName && item.adminName !== "admin") return item.adminName;
  if (item.sellerName) return item.sellerName;
  if (item.adminEmail) return item.adminEmail.split("@")[0];
  return "Unknown Seller";
};

/* COMPONENTS */

import Nav from "./components/Navbar/Nav";
import ImageSlider from "./components/Home/Home";
import Categories from "./components/Category/CategoryItem";
import Offer from "./components/Offer/Offer";
import SellerMenu from "./components/FoodItem/SellerMenu";
import GifExample from "./components/Page/Page";

import AiSlider from "./components/AiSlider/AiPage";
import About from "./components/About/About";
import MiniCategories from "./components/Category/MiniCategories";
import Footer from "./components/Footer/Footer";

import Menu from "./components/FoodItem/Menu";
import FoodGallery1 from "./components/FoodItem/Food";
import CategoryMenu from "./components/FoodItem/CategoryMenu";
import SearchPage from "./components/FoodItem/Search";

import Cart from "./components/Cart/Cart";
import OrderTracking from "./components/OrderTracking/OrderTracking";
import UserPage from "./components/UserPage/UserPage";

import Login from "./components/Login/Login";
import Signup from "./components/Login/Signup";

import PageLoader from "./components/Loader/PageLoader";

/* FIREBASE */

import { collection, onSnapshot, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import AIChatPage from "./components/AiChat/AiChat";
import { SalertProvider, useSalert } from "./components/Salert/Salert";


function App() {

  const navigate = useNavigate();
  const location = useLocation();

  /* NAV VISIBILITY */

  const showStandardNav =
    location.pathname !== "/login" &&
    location.pathname !== "/signup" &&
    location.pathname !== "/AdminLogin" &&
    location.pathname !== "/AdminSignup";

  /* STATE */

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("currentUser")) || null
  );

  const [admin, setAdmin] = useState(
    localStorage.getItem("isAdmin") === "true"
  );

  const [orders, setOrders] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [admins, setAdmins] = useState([]);
  
  const { showSalert } = useSalert();

  /* SYNC ADMINS (For real canteen names) */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "admins"), (snap) => {
      setAdmins(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  /* SYNC PRODUCTS */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      const prodData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Enrich with real seller name
      const enriched = prodData.map(p => {
        const adminDoc = admins.find(a => a.id === p.adminId || a.id === p.hotelId);
        return {
          ...p,
          realSellerName: adminDoc ? (adminDoc.canteen || adminDoc.name) : null
        };
      });

      setProducts(enriched);
    });
    return () => unsub();
  }, [admins]);

  /* REACTIVE CART STOCK SYNC */
  useEffect(() => {
    if (products.length === 0 || cartItems.length === 0) return;

    setCartItems(prev => {
      let changed = false;
      const updated = prev.map(item => {
        const fresh = products.find(p => p.id === item.id);
        if (fresh && fresh.quantity !== item.quantity) {
          changed = true;
          return { ...item, quantity: fresh.quantity };
        }
        return item;
      });
      return changed ? updated : prev;
    });
  }, [products]);

  /* LOAD CART ON USER CHANGE */
  useEffect(() => {
    if (user && user.uid) {
      const key = `cart_items_${user.uid}`;
      const stored = localStorage.getItem(key);
      setCartItems(stored ? JSON.parse(stored) : []);
    } else {
      setCartItems([]);
    }
  }, [user]);

  /* SYNC CART TO STORAGE */
  useEffect(() => {
    if (user && user.uid) {
      const key = `cart_items_${user.uid}`;
      localStorage.setItem(key, JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  /* CART ACTIONS */

  const addToCart = (item, qtyToAdd = 1) => {
    setCartItems((prev) => {
      // 1. Single Seller Rule
      if (prev.length > 0) {
        const currentSeller = getSellerName(prev[0]);
        const newItemSeller = getSellerName(item);
        
        if (currentSeller !== newItemSeller) {
          showSalert(`You can only order from one seller at a time. Current: ${currentSeller}. Please clear your cart first.`, "warning");
          return prev;
        }
      }

      const existing = prev.find((i) => i.id === item.id);
      
      // Stock Check (Latest from global state)
      const freshProduct = products.find(p => p.id === item.id) || item;
      const availableStock = Number(freshProduct.quantity) || 0;
      const currentQtyInCart = existing ? (existing.qty || 0) : 0;

      if (currentQtyInCart + qtyToAdd > availableStock) {
        showSalert(`Only ${availableStock} units available in stock.`, "warning");
        return prev;
      }

      showSalert(`${item.name} added to cart! 🛒`, "success");

      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, qty: (i.qty || 0) + qtyToAdd, quantity: availableStock } : i
        );
      }
      return [...prev, { ...item, qty: qtyToAdd, quantity: availableStock }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQty = (id, delta) => {
    setCartItems((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const freshProduct = products.find(p => p.id === id) || i;
          const availableStock = Number(freshProduct.quantity) || 0;
          const newQty = Math.max(1, (i.qty || 1) + delta);

          if (delta > 0 && newQty > availableStock) {
            showSalert(`Limit reached: ${availableStock} units available.`, "warning");
            return { ...i, quantity: availableStock };
          }
          return { ...i, qty: newQty, quantity: availableStock };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  /* PLACE ORDER */

  /* PLACE ORDER */

  const placeOrder = async (mobile, paymentMethod, adminId, splitItems = null) => {
    if (!user) {
      showSalert("Please login to place an order", "warning");
      return;
    }

    const itemsToOrder = splitItems || cartItems;

    try {
      const orderData = {
        userId: user.uid,
        userName: user.name || user.username || "Customer",
        userEmail: user.email,
        items: itemsToOrder,
        total: itemsToOrder.reduce(
          (sum, i) => sum + (i.discountedPrice || i.price) * (i.qty || 1),
          0
        ),
        mobile,
        paymentMethod,
        adminId,
        status: "Pending",
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);
      console.log("Order placed:", docRef.id);
      clearCart();
      return docRef.id;
    } catch (err) {
      console.error("Order Error:", err);
      throw err;
    }
  };

  /* LOAD ORDERS */

  useEffect(() => {

    const unsub = onSnapshot(collection(db, "orders"), (snap) => {

      setOrders(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );

    });

    return () => unsub();

  }, []);

  /* ================= LANDING PAGE CLICK GUARD ================= */

  const handleLandingClick = (e) => {
    // allow clicks to the admin-link if present
    if (e.target.closest(".admin-link")) return;

    if (!user) {
      navigate("/login");
    }
  };

  /* ================= USER ORDERS ================= */

  const userOrders = orders.filter(
    (o) => o.userId === user?.uid
  );

  /* ================= UI ================= */

  return (
    <>

      {showStandardNav && (
        <Nav
          cartItems={cartItems}
          user={user}
          setUser={setUser}
          admin={admin}
          setAdmin={setAdmin}
        />
      )}

      <Routes>

        <Route
          path="/"
          element={
            <PageLoader>

              <div onClick={handleLandingClick}>
                <ImageSlider />
                <Categories />
                <Offer />
                <SellerMenu addToCart={addToCart} />
                <GifExample />
                {/* <Announcement /> */}
                <AiSlider />
                <About />
                <MiniCategories />
                <Footer />
              </div>

            </PageLoader>
          }
        />

        <Route
          path="/login"
          element={
            <PageLoader>
              <Login setUser={setUser} />
            </PageLoader>
          }
        />

        <Route
          path="/signup"
          element={
            <PageLoader>
              <Signup setUser={setUser} />
            </PageLoader>
          }
        />

        <Route
          path="/menu"
          element={
            <PageLoader>
              <Menu addToCart={addToCart} />
            </PageLoader>
          }
        />
        <Route
          path="/aichat"
          element={
            <PageLoader>
              <AIChatPage />
            </PageLoader>
          }
        />

        <Route
          path="/food"
          element={
            <PageLoader>
              <FoodGallery1 addToCart={addToCart} />
            </PageLoader>
          }
        />
        <Route
          path="/all-menu"
          element={
            <PageLoader>
              <CategoryMenu addToCart={addToCart} />
            </PageLoader>
          }
        />
        <Route
          path="/search"
          element={
            <PageLoader>
              <SearchPage addToCart={addToCart} />
            </PageLoader>
          }
        />

        <Route
          path="/cart"
          element={
            <PageLoader>
              <Cart
                cartItems={cartItems}
                removeFromCart={removeFromCart}
                updateQty={updateQty}
                placeOrder={placeOrder}
              />
            </PageLoader>
          }
        />

        <Route
          path="/tracking"
          element={
            <PageLoader>
              <OrderTracking orders={userOrders} />
            </PageLoader>
          }
        />

        <Route
          path="/user"
          element={
            <PageLoader>
              <UserPage 
                user={user} 
                setUser={setUser} 
                orders={userOrders} 
                cartItems={cartItems}
              />
            </PageLoader>
          }
        />


        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>

    </>
  );
}

import ScrollToTop from "./components/ScrollToTop";

/* ================= ROUTER WRAPPER ================= */

export default function AppWrapper() {

  return (
    <Router>
      <SalertProvider>
        <ScrollToTop />
        <App />
      </SalertProvider>
    </Router>
  );

}