import React, { useEffect, useState } from "react";
import "./Meal.css";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { FaPlus, FaTimes, FaStar, FaFire, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { 
  getSellerName, 
  groupBySeller, 
  SellerRow, 
  FoodModal 
} from "../FoodItem/Food";

function MealPage({ addToCart }) {
  const [grouped, setGrouped] = useState({});
  const [openItem, setOpenItem] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD MEAL PRODUCTS ================= */
  useEffect(() => {
    const q = query(
      collection(db, "products"),
      where("category", "==", "meals"),
      where("isActive", "==", true)
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGrouped(groupBySeller(data));
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <div className="food-page-premium" style={{ paddingTop: '80px' }}>
      <h2 className="menu-title-premium" style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '30px' }}>🍽 Royal Meals</h2>

      <div className="menu-content-container">
        {loading ? (
          <div className="mp-loading">Loading delicious meals...</div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="no-results-premium">
            <p>No meals available right now 😔</p>
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
      </div>

      {openItem && (
        <FoodModal 
          item={openItem} 
          onClose={() => setOpenItem(null)} 
          onAdd={() => {
            addToCart(openItem);
            setOpenItem(null);
          }} 
        />
      )}
    </div>
  );
}

export default MealPage;
