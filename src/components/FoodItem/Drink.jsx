import React, { useState, useEffect, useRef } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { FaPlus, FaTimes, FaChevronLeft, FaChevronRight, FaStar, FaFire, FaGlassMartini } from "react-icons/fa";
import "./Food.css";
import { useSalert } from "../Salert/Salert";
import SkeletonLoader from "../Loader/SkeletonLoader";
import { getSellerName, groupBySeller, ProductCard, SellerRow, FoodModal } from "./Food";


function DrinkGallery({ addToCart }) {
  const [grouped, setGrouped] = useState({});
  const [openItem, setOpenItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "products"), where("category", "==", "drinks"), where("isActive", "==", true));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setGrouped(groupBySeller(data));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <div className="food-page-premium" style={{ paddingTop: '100px' }}>
      <h2 className="menu-title-premium" style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '30px' }}>🥤 Refreshments</h2>
      <div className="menu-content-container">
        {loading ? (
          <SkeletonLoader type="menu" count={8} />
        ) : Object.keys(grouped).length === 0 ? (
          <div className="no-results-premium">
            <FaGlassMartini size={50} style={{ opacity: 0.2, marginBottom: '20px' }} />
            <p>No drinks available right now 😔</p>
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

export default DrinkGallery;
