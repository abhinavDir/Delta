import React, { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import {
  groupByCategory,
  CategoryRow,
  FoodModal
} from "./Food";
import SkeletonLoader from "../Loader/SkeletonLoader";
import "./Food.css";

const CategoryMenu = ({ products: productsProp, addToCart }) => {
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(true);
  const [openItem, setOpenItem] = useState(null);

  useEffect(() => {
    if (productsProp && productsProp.length > 0) {
      let data = [...productsProp];
      data = data.filter((i) => i.isActive !== false);
      setGrouped(groupByCategory(data));
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      let data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      data = data.filter((i) => i.isActive !== false);

      setGrouped(groupByCategory(data));
      setLoading(false);
    });
    return () => unsub();
  }, [productsProp]);

  return (
    <div className="marketplace-page">
      <header className="mp-header" style={{ borderRadius: '0 0 40px 40px', marginBottom: '20px' }}>
        <h2 className="premium-gradient-text" style={{ color: 'white', fontSize: '2rem' }}>
          Explore Full Menu
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '8px' }}>
          Browse all items across all canteens, organized by category.
        </p>
      </header>

      <main className="mp-main-content">
        {loading ? (
          <div style={{ padding: '0 20px' }}>
            <SkeletonLoader type="menu" count={5} />
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="mp-empty">
            <p>No items found in the menu.</p>
          </div>
        ) : (
          Object.keys(grouped).sort().map((cat) => (
            <CategoryRow
              key={cat}
              category={cat}
              items={grouped[cat]}
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

export default CategoryMenu;
