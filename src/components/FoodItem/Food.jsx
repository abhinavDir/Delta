import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { FaPlus, FaTimes, FaArrowRight, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FiMapPin, FiShoppingCart, FiSearch } from "react-icons/fi";
import SkeletonLoader from "../Loader/SkeletonLoader";
import "./Food.css";

/* ---------- Helpers ---------- */
export const getSellerName = (item) => {
  if (item.canteen) return item.canteen;
  if (item.adminId && item.adminId !== 'admin') return item.adminId;
  if (item.realSellerName) return item.realSellerName;
  if (item.adminName && item.adminName !== 'admin') return item.adminName;
  if (item.sellerName) return item.sellerName;
  if (item.adminEmail) return item.adminEmail.split("@")[0];
  return "Canteen Seller";
};

export const groupBySeller = (items) =>
  items.reduce((acc, item) => {
    const key = getSellerName(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

export const groupByCategory = (items) =>
  items.reduce((acc, item) => {
    const key = item.category || "General";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

/* ---------- ProductCard ---------- */
export function ProductCard({ item, onOpen, addToCart }) {
  const isOutOfStock = Number(item.quantity) <= 0;
  const seller = getSellerName(item);
  const hasOffer = item.discountPct > 0;
  const price = hasOffer ? item.discountedPrice : item.price;

  return (
    <div className={`mp-card ${isOutOfStock ? "mp-frozen" : ""}`} onClick={() => !isOutOfStock && onOpen(item)}>
      <div className="mp-card-img-wrapper">
        <img 
          src={item.image || "https://placehold.co/200x200/f3f4f6/94a3b8?text=🍽️"} 
          alt={item.name} 
        />
        {isOutOfStock && <div className="mp-soldout-overlay">Sold Out</div>}
        {hasOffer && <div className="mp-badge discount" style={{ position: 'absolute', top: '10px', left: '10px', background: 'var(--mp-accent)', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '800' }}>-{item.discountPct}%</div>}
      </div>
      
      <div className="mp-card-info">
        <h4 className="mp-item-name">{item.name}</h4>
        <p className="mp-seller-name">🏠 {seller}</p>
        
        <div className="mp-card-footer">
          <span className="mp-price">₹{price}</span>
          <button 
            className="mp-add-btn" 
            onClick={(e) => { 
              e.stopPropagation(); 
              if (!isOutOfStock) addToCart(item); 
            }}
            disabled={isOutOfStock}
          >
            <FaPlus />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- SellerRow ---------- */
export function SellerRow({ seller, items, onOpen, addToCart }) {
  const sliderRef = React.useRef();
  const scroll = (dir) => {
    sliderRef.current.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  return (
    <div className="mp-seller-section">
      <div className="mp-section-header">
        <h3 className="mp-seller-title">
          <span className="mp-seller-icon">🏪</span> {seller}
        </h3>
      </div>
      <div className="mp-horizontal-scroll" ref={sliderRef}>
        {items.map((item) => (
          <ProductCard key={item.id} item={item} onOpen={onOpen} addToCart={addToCart} />
        ))}
      </div>
    </div>
  );
}

/* ---------- CategoryRow ---------- */
export function CategoryRow({ category, items, onOpen, addToCart }) {
  const sliderRef = React.useRef();
  const scroll = (dir) => {
    sliderRef.current.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  return (
    <div className="mp-seller-section">
      <div className="mp-section-header">
        <h3 className="mp-seller-title">
          <span className="mp-seller-icon">🍽️</span> {category}
        </h3>
      </div>
      <div className="mp-horizontal-scroll" ref={sliderRef}>
        {items.map((item) => (
          <ProductCard key={item.id} item={item} onOpen={onOpen} addToCart={addToCart} />
        ))}
      </div>
    </div>
  );
}

/* ---------- FoodModal ---------- */
export function FoodModal({ item, onClose, onAdd }) {
  const [qty, setQty] = useState(1);
  if (!item) return null;
  
  const hasOffer = item.discountPct > 0;
  const isOutOfStock = Number(item.quantity) <= 0;
  const price = hasOffer ? item.discountedPrice : item.price;
  const seller = getSellerName(item);

  const handleIncrement = () => {
    if (qty < (Number(item.quantity) || 99)) setQty(q => q + 1);
  };
  
  const handleDecrement = () => {
    if (qty > 1) setQty(q => q - 1);
  };

  return (
    <div className="fm-overlay" onClick={onClose}>
      <div className="fm-modal" onClick={e => e.stopPropagation()}>
        <button className="fm-close" onClick={onClose}><FaTimes /></button>
        
        <div className="fm-grid">
          {/* Left / Top: Image Area */}
          <div className="fm-visual">
            <img src={item.image || "https://placehold.co/600x600/f3f4f6/94a3b8?text=🍱"} alt={item.name} />
            {hasOffer && <div className="fm-badge-offer">{item.discountPct}% OFF</div>}
            {isOutOfStock && <div className="fm-badge-out">Sold Out</div>}
          </div>

          {/* Right / Bottom: Content Area */}
          <div className="fm-content">
            <div className="fm-header">
              <span className="fm-seller-badge"><FiMapPin /> {seller}</span>
              <h2 className="fm-title">{item.name}</h2>
              {item.category && <span className="fm-cat-label">{item.category}</span>}
            </div>

            <p className="fm-description">
              {item.description || "Indulge in our chef-crafted delights, prepared fresh with premium ingredients for a taste that lingers."}
            </p>

            <div className="fm-pricing-row">
              <div className="fm-price-group">
                <span className="fm-current-price">₹{price}</span>
                {hasOffer && <span className="fm-old-price">₹{item.price}</span>}
              </div>
              
              {!isOutOfStock && (
                <div className="fm-qty-selector">
                  <button onClick={handleDecrement} disabled={qty <= 1}>-</button>
                  <span>{qty}</span>
                  <button onClick={handleIncrement} disabled={qty >= (Number(item.quantity) || 99)}>+</button>
                </div>
              )}
            </div>

            {item.quantity && !isOutOfStock && (
              <div className="fm-stock-indicator">
                <div className="fm-stock-bar">
                  <div className="fm-stock-fill" style={{ width: `${Math.min(100, (Number(item.quantity)/20)*100)}%` }}></div>
                </div>
                <span>Only {item.quantity} left in stock</span>
              </div>
            )}

            <button 
              className={`fm-action-btn ${isOutOfStock ? "disabled" : ""}`}
              onClick={() => { if(!isOutOfStock) { onAdd({...item, qty}); onClose(); } }}
              disabled={isOutOfStock}
            >
              {isOutOfStock ? "NOT AVAILABLE" : `ADD TO CART • ₹${price * qty}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const CATEGORIES_DATA = [
  { id: "all", name: "All Items", icon: "🍱" },
  { id: "drinks", name: "Drinks", icon: "🥤" },
  { id: "burgers", name: "Burgers", icon: "🍔" },
  { id: "pizza", name: "Pizza", icon: "🍕" },
  { id: "snacks", name: "Snacks", icon: "🍿" },
];

const FoodGallery1 = ({ products: productsProp, addToCart, cartItems = [], category: categoryProp }) => {
  const { category: categoryParam } = useParams();
  const navigate = useNavigate();
  const [grouped, setGrouped] = useState({});
  const [openItem, setOpenItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(categoryProp || categoryParam || "all");

  useEffect(() => {
    if (categoryProp) setActiveCategory(categoryProp);
  }, [categoryProp]);

  useEffect(() => {
    if (categoryParam) setActiveCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    if (productsProp && productsProp.length > 0) {
      let data = [...productsProp];
      data = data.filter((i) => i.isActive !== false);

      const selected = activeCategory.toLowerCase();
      if (selected !== "all") {
        data = data.filter((i) => i.category?.toLowerCase() === selected);
      }

      setGrouped(groupBySeller(data));
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      let data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      data = data.filter((i) => i.isActive !== false);

      const selected = activeCategory.toLowerCase();
      if (selected !== "all") {
        data = data.filter((i) => i.category?.toLowerCase() === selected);
      }

      setGrouped(groupBySeller(data));
      setLoading(false);
    });
    return () => unsub();
  }, [activeCategory, productsProp]);

  return (
    <div className="marketplace-page">
      {/* 🟢 STICKY TOP SECTION */}
      <div className="mp-sticky-top">
        <header className="mp-header">
          <div className="mp-header-top">
            <div className="mp-search-container" onClick={() => navigate("/search")}>
              <FiSearch className="mp-search-icon" />
              <input type="text" placeholder="Explore the menu..." readOnly />
            </div>
            <Link to="/cart" className="mp-cart-trigger">
              <FiShoppingCart />
              <span className="mp-cart-badge">{cartItems.reduce((acc, i) => acc + (i.qty || 1), 0)}</span>
            </Link>
          </div>
          
          <div className="mp-location-info">
            <p className="mp-loc-label">Browse Menu</p>
            <div className="mp-loc-value">
              <span>{activeCategory === "all" ? "Full Collection" : activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}</span>
            </div>
          </div>
        </header>

        {/* 🍱 CATEGORY TABS (Circular Style) */}
        <section className="mp-categories mp-categories-menu">
          <div className="mp-categories-scroll">
            {CATEGORIES_DATA.map((cat) => (
              <div 
                key={cat.id} 
                className={`mp-cat-item ${activeCategory === cat.id ? "active" : ""}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <div className="mp-cat-circle">{cat.icon}</div>
                <span>{cat.name}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 📦 CONTENT GRID */}
      <main className="mp-main-content">
        {loading ? (
          <div style={{ padding: '0 20px' }}>
            <SkeletonLoader type="menu" count={4} />
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="mp-empty">
            <p>No items found in this section</p>
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
};

export default FoodGallery1;