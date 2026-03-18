import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { FiSearch, FiShoppingCart, FiMapPin, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { FaPlus, FaUtensils, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import SkeletonLoader from "../Loader/SkeletonLoader";
import "./Search.css";

import { 
  getSellerName, 
  groupBySeller, 
  ProductCard, 
  SellerRow,
  FoodModal 
} from "./Food";

function SearchPage({ products: productsProp, addToCart, cartItems = [] }) {
  const [queryText, setQueryText] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openItem, setOpenItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (productsProp && productsProp.length > 0) {
      setProducts(productsProp);
      setLoading(false);
      return;
    }

    const q = query(collection(db, "products"), where("isActive", "==", true));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProducts(data);
      setLoading(false);
    });
    return () => unsub();
  }, [productsProp]);

  const normalizedQuery = queryText.toLowerCase().trim();
  const filteredProducts = normalizedQuery
    ? products.filter((p) => {
      const nameMatch = p.name?.toLowerCase().includes(normalizedQuery);
      const categoryMatch = p.category?.toLowerCase().includes(normalizedQuery);
      const sellerMatch = getSellerName(p).toLowerCase().includes(normalizedQuery);
      return nameMatch || categoryMatch || sellerMatch;
    })
    : [];

  const groupedResults = groupBySeller(filteredProducts);

  return (
    <div className="marketplace-page">
      {/* 🟢 STICKY TOP SECTION */}
      <div className="mp-sticky-top">
        <header className="mp-header">
          <div className="mp-header-top">
            <div className="mp-search-container">
              <FiSearch className="mp-search-icon" />
              <input 
                type="text" 
                placeholder="Search for food or canteen..." 
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                autoFocus
              />
            </div>
            <Link to="/cart" className="mp-cart-trigger">
              <FiShoppingCart />
              <span className="mp-cart-badge">{cartItems.reduce((acc, i) => acc + (i.qty || 1), 0)}</span>
            </Link>
          </div>
          
          <div className="mp-location-info">
            <p className="mp-loc-label">Search Results</p>
            <div className="mp-loc-value">
              <span>{queryText ? `Finding "${queryText}"` : "Type to discover"}</span>
            </div>
          </div>
        </header>
      </div>

      {/* 🍱 SEARCH RESULTS GRID */}
      <main className="mp-main-content">
        {loading ? (
          <div style={{ padding: '0 20px' }}>
            <SkeletonLoader type="card" count={3} />
          </div>
        ) : queryText && filteredProducts.length === 0 ? (
          <div className="mp-empty">
            <FaUtensils size={40} style={{ marginBottom: 15, opacity: 0.5 }} />
            <p>No food found for "{queryText}"</p>
          </div>
        ) : !queryText ? (
          <div className="mp-empty">
            <p>Start typing to search across all canteens</p>
          </div>
        ) : (
          Object.keys(groupedResults).sort().map((seller) => (
            <SellerRow
              key={seller}
              seller={seller}
              items={groupedResults[seller]}
              onOpen={setOpenItem}
              addToCart={addToCart}
            />
          ))
        )}

        {openItem && (
          <FoodModal
            item={openItem}
            onClose={() => setOpenItem(null)}
            onAdd={addToCart}
          />
        )}

        {!loading && filteredProducts.length > 0 && (
          <div className="search-footer-info" style={{ marginTop: 40, textAlign: 'center' }}>
            <button className="mp-modal-btn" onClick={() => navigate("/menu")}>
              Explore Full Menu <FiChevronRight />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default SearchPage;