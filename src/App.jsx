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

/* PROTECTED ROUTE */
function ProtectedRoute({ user, children }) {
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

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
import ScrollToTop from "./components/ScrollToTop";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const showStandardNav =
    location.pathname !== "/login" &&
    location.pathname !== "/signup" &&
    location.pathname !== "/AdminLogin" &&
    location.pathname !== "/AdminSignup";

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("currentUser");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("User init error:", e);
      return null;
    }
  });

  const [admin, setAdmin] = useState(
    localStorage.getItem("isAdmin") === "true"
  );

  const [orders, setOrders] = useState([]);
  const [cartItems, setCartItems] = useState(() => {
    try {
      const userJson = localStorage.getItem("currentUser");
      if (userJson) {
        const u = JSON.parse(userJson);
        if (u.uid) {
          const stored = localStorage.getItem(`cart_items_${u.uid}`);
          return stored ? JSON.parse(stored) : [];
        }
      }
    } catch (e) {
      console.error("Cart init error:", e);
    }
    return [];
  });
  const [products, setProducts] = useState([]);
  const [admins, setAdmins] = useState([]);

  const { showSalert } = useSalert();

  /* ADMIN SYNC */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "admins"), (snap) => {
      setAdmins(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  /* PRODUCT SYNC */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      const prodData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const enriched = prodData.map(p => {
        const adminDoc = admins.find(a => a.id === p.adminId || a.id === p.hotelId);
        return {
          ...p,
          realSellerName: adminDoc ? (adminDoc.canteen || adminDoc.id || adminDoc.name) : null
        };
      });

      setProducts(enriched);
    });
    return () => unsub();
  }, [admins]);

  /* CART STOCK SYNC */
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

  /* LOAD CART */
  useEffect(() => {
    if (user && user.uid) {
      const key = `cart_items_${user.uid}`;
      const stored = localStorage.getItem(key);
      setCartItems(stored ? JSON.parse(stored) : []);
    } else {
      setCartItems([]);
    }
  }, [user]);

  /* SAVE CART */
  useEffect(() => {
    if (user && user.uid) {
      const key = `cart_items_${user.uid}`;
      localStorage.setItem(key, JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  /* ADD TO CART */
  const addToCart = (item, qtyToAdd = 1) => {

    if (!user) {
      showSalert("Please login first to add items", "warning");
      navigate("/login");
      return;
    }

    setCartItems((prev) => {
      if (prev.length > 0) {
        const currentSeller = getSellerName(prev[0]);
        const newItemSeller = getSellerName(item);

        if (currentSeller !== newItemSeller) {
          showSalert(`Only one seller allowed: ${currentSeller}`, "warning");
          return prev;
        }
      }

      const existing = prev.find((i) => i.id === item.id);
      const freshProduct = products.find(p => p.id === item.id) || item;
      const stock = Number(freshProduct.quantity) || 0;
      const currentQty = existing ? existing.qty || 0 : 0;

      if (currentQty + qtyToAdd > stock) {
        showSalert(`Only ${stock} available`, "warning");
        return prev;
      }

      showSalert(`${item.name} added 🛒`, "success");

      if (existing) {
        return prev.map((i) =>
          i.id === item.id
            ? { ...i, qty: (i.qty || 0) + qtyToAdd, quantity: stock }
            : i
        );
      }

      return [...prev, { ...item, qty: qtyToAdd, quantity: stock }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(i => i.id !== id));
  };

  const updateQty = (id, delta) => {
    setCartItems(prev =>
      prev.map(i => {
        if (i.id === id) {
          const fresh = products.find(p => p.id === id) || i;
          const stock = Number(fresh.quantity) || 0;
          const newQty = Math.max(1, (i.qty || 1) + delta);

          if (delta > 0 && newQty > stock) {
            showSalert(`Max ${stock}`, "warning");
            return i;
          }

          return { ...i, qty: newQty };
        }
        return i;
      })
    );
  };

  const clearCart = () => setCartItems([]);

  /* PLACE ORDER */
  const placeOrder = async (mobile, paymentMethod, adminId, splitItems = null) => {
    if (!user) {
      showSalert("Login required", "warning");
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

      await addDoc(collection(db, "orders"), orderData);
      clearCart();

    } catch (err) {
      console.error(err);
    }
  };

  /* LOAD ORDERS */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "orders"), (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const userOrders = orders.filter(o => o.userId === user?.uid);

  /* LANDING CLICK */
  const handleLandingClick = (e) => {
    // Ignore clicks on buttons, links, inputs (important)
    if (
      e.target.closest("button") ||
      e.target.closest("a") ||
      e.target.closest("input") ||
      e.target.closest(".admin-link")
    ) {
      return;
    }

    if (!user) {
      navigate("/");
    }
  };

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
              <div >
                <ImageSlider />
                <Categories />
                <Offer />
                <SellerMenu products={products} addToCart={addToCart} cartItems={cartItems} />
                <GifExample />
                <AiSlider />
                <About />
                <MiniCategories />
                <Footer />
              </div>
            </PageLoader>
          }
        />

        <Route path="/login" element={<PageLoader><Login setUser={setUser} /></PageLoader>} />
        <Route path="/signup" element={<PageLoader><Signup setUser={setUser} /></PageLoader>} />

        <Route path="/menu" element={<PageLoader><Menu products={products} addToCart={addToCart} cartItems={cartItems} /></PageLoader>} />
        <Route path="/aichat" element={<PageLoader><AIChatPage /></PageLoader>} />
        <Route path="/food" element={<PageLoader><FoodGallery1 products={products} addToCart={addToCart} cartItems={cartItems} /></PageLoader>} />
        <Route path="/all-menu" element={<PageLoader><CategoryMenu products={products} addToCart={addToCart} /></PageLoader>} />
        <Route path="/search" element={<PageLoader><SearchPage products={products} addToCart={addToCart} cartItems={cartItems} /></PageLoader>} />

        {/* PROTECTED */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute user={user}>
              <PageLoader>
                <Cart
                  cartItems={cartItems}
                  removeFromCart={removeFromCart}
                  updateQty={updateQty}
                  placeOrder={placeOrder}
                />
              </PageLoader>
            </ProtectedRoute>
          }
        />

        <Route
          path="/tracking"
          element={
            <ProtectedRoute user={user}>
              <PageLoader>
                <OrderTracking orders={userOrders} />
              </PageLoader>
            </ProtectedRoute>
          }
        />

        <Route
          path="/user"
          element={
            <ProtectedRoute user={user}>
              <PageLoader>
                <UserPage
                  user={user}
                  setUser={setUser}
                  orders={userOrders}
                  cartItems={cartItems}
                />
              </PageLoader>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </>
  );
}

/* WRAPPER */
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