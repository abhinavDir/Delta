import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { FaPlus, FaArrowRight, FaTimes } from "react-icons/fa";
import { FiMapPin, FiShoppingCart, FiSearch } from "react-icons/fi";
import SkeletonLoader from "../Loader/SkeletonLoader";
import "./SellerMenu.css";

import { 
  getSellerName, 
  groupBySeller, 
  ProductCard, 
  SellerRow, 
  FoodModal 
} from "./Food";

const CIRCULAR_CATS = [
  { id: "all", name: "All", icon: "🍱" },
  { id: "veg", name: "Veg", icon: "🥦" },
  { id: "burgers", name: "Burgers", icon: "🍔" },
  { id: "pizza", name: "Pizza", icon: "🍕" },
  { id: "snacks", name: "Snacks", icon: "🍿" },
];

function SellerMenu({ products: productsProp, addToCart, cartItems = [] }) {
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(true);
  const [openItem, setOpenItem] = useState(null);
  const [selectedCat, setSelectedCat] = useState("all");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (productsProp && productsProp.length > 0) {
      let data = [...productsProp];
      data = data.filter((i) => i.isActive !== false);

      const sel = selectedCat.toLowerCase();
      if (sel !== "all") {
        data = data.filter((i) => i.category?.toLowerCase() === sel);
      }

      setGrouped(groupBySeller(data));
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      let data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      data = data.filter((i) => i.isActive !== false);

      const sel = selectedCat.toLowerCase();
      if (sel !== "all") {
        data = data.filter((i) => i.category?.toLowerCase() === sel);
      }

      setGrouped(groupBySeller(data));
      setLoading(false);
    });
    return () => unsub();
  }, [selectedCat, productsProp]);

  const isHomePage = location.pathname === "/";

  return (
    <div className={`marketplace-page ${isHomePage ? 'mp-home-wrap' : ''}`}>
      {/* 🟢 STICKY TOP SECTION - Hidden on Landing Page to allow Hero Slider to show */}
      {!isHomePage && (
        <div className="mp-sticky-top">
          <header className="mp-header">
            <div className="mp-header-top">
              <div className="mp-search-container" onClick={() => navigate("/search")}>
                <FiSearch className="mp-search-icon" />
                <input type="text" placeholder="Search for food..." readOnly />
              </div>
              <Link to="/cart" className="mp-cart-trigger">
                <FiShoppingCart />
                <span className="mp-cart-badge">{cartItems.reduce((acc, i) => acc + (i.qty || 1), 0)}</span>
              </Link>
            </div>
            
            <div className="mp-location-info">
              <p className="mp-loc-label">Current Location</p>
              <div className="mp-loc-value">
                <FiMapPin /> <span>FusionX Campus, Main Hall</span>
              </div>
            </div>
          </header>

          {/* ⚪ CIRCULAR CATEGORIES */}
          <section className="mp-categories">
            <div className="mp-categories-scroll">
              {CIRCULAR_CATS.map((cat) => (
                <div 
                  key={cat.id} 
                  className={`mp-cat-item ${selectedCat === cat.id ? "active" : ""}`}
                  onClick={() => setSelectedCat(cat.id)}
                >
                  <div className="mp-cat-circle">{cat.icon}</div>
                  <span>{cat.name}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* 🍱 MAIN CONTENT */}
      <main className="mp-main-content">
        {loading ? (
          <div style={{ padding: '0 20px' }}>
            <SkeletonLoader type="menu" count={4} />
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="mp-empty">
            <p>No items found in this category</p>
          </div>
        ) : (
          Object.keys(grouped).sort().map((seller) => (
            <SellerRow
              key={seller}
              seller={seller}
              items={grouped[seller]}
              onOpen={setOpenItem}
              addToCart={addToCart}
            />
          ))
        )}
      </main>

      {openItem && (
        <FoodModal
          item={openItem}
          onClose={() => setOpenItem(null)}
          onAdd={addToCart}
        />
      )}
    </div>
  );
}

export default SellerMenu;
