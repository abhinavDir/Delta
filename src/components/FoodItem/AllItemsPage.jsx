import React, { useState, useEffect, useRef } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { FaPlus, FaTimes, FaStar, FaFire, FaChevronLeft, FaChevronRight, FaUtensils } from "react-icons/fa";
import "./Food.css";
import { useSalert } from "../Salert/Salert";
import SkeletonLoader from "../Loader/SkeletonLoader";
import { getSellerName, ProductCard, SellerRow, FoodModal } from "./Food";

const groupBySeller = (items) => {
  const grouped = {};
  items.forEach((item) => {
    const seller = getSellerName(item);
    if (!grouped[seller]) grouped[seller] = [];
    grouped[seller].push(item);
  });
  return grouped;
};

/* Components */
// ProductCard and SellerRow definitions are removed from here as per instruction to import them.

function FoodModal({ item, onClose, onAdd }) {
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
          <div className="fm-visual">
            {item.image ? (
              <img src={item.image} alt={item.name || item.title} />
            ) : (
              <div style={{ fontSize: '6rem', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', background: '#f1f5f9' }}>
                {item.emoji || "🍽️"}
              </div>
            )}
            {hasOffer && <div className="fm-badge-offer">{item.discountPct}% OFF</div>}
            {isOutOfStock && <div className="fm-badge-out">OUT OF STOCK</div>}
          </div>
          <div className="fm-content">
            <div className="fm-header">
              <span className="fm-seller-badge">🏠 {seller}</span>
              <h2 className="fm-title">{item.name || item.title}</h2>
              <span className="fm-cat-label">{item.category}</span>
            </div>
            <p className="fm-description">{item.desc || "Freshly prepared delicious meal from our kitchen, served hot and fresh just for you."}</p>
            <div className="fm-pricing-row">
              <div className="fm-price-stack">
                <span className="fm-current-price">₹{price}</span>
                {hasOffer && <span className="fm-old-price">₹{item.price}</span>}
              </div>
              <div className="fm-qty-selector">
                <button onClick={handleDecrement} disabled={qty <= 1}>−</button>
                <span>{qty}</span>
                <button onClick={handleIncrement} disabled={isOutOfStock}>+</button>
              </div>
            </div>
            <button className={`fm-action-btn ${isOutOfStock ? 'disabled' : ''}`} onClick={() => !isOutOfStock && onAdd(item, qty)}>
              {isOutOfStock ? 'Currently Unavailable' : `Add To Cart • ₹${price * qty}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AllItemsPage1({ addToCart, products = [] }) {
  const [grouped, setGrouped] = useState({});
  const [openItem, setOpenItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (products && products.length > 0) {
      setGrouped(groupBySeller(products));
      setLoading(false);
    } else {
      setGrouped({});
      setLoading(false);
    }
  }, [products]);

  return (
    <div className="food-page-premium" style={{ paddingTop: '100px' }}>
      <h2 className="menu-title-premium" style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '30px' }}>🍽️ Explore All Dishes</h2>
      <div className="menu-content-container">
        {loading ? (
          <SkeletonLoader type="menu" count={8} />
        ) : Object.keys(grouped).length === 0 ? (
          <div className="no-results-premium">
            <FaUtensils size={50} style={{ opacity: 0.2, marginBottom: '20px' }} />
            <p>No products available right now 😔</p>
          </div>
        ) : (
          Object.keys(grouped).sort().map((seller) => (
            <SellerRow key={seller} seller={seller} items={grouped[seller]} onOpen={setOpenItem} addToCart={addToCart} />
          ))
        )}
      </div>
      <FoodModal 
        item={openItem} 
        onClose={() => setOpenItem(null)} 
        onAdd={(product, qty) => {
          addToCart(product, qty);
          setOpenItem(null);
        }} 
      />
    </div>
  );
}

export default AllItemsPage1;
