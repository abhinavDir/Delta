import React, { useEffect, useState } from "react";
import "./Featured.css";
import { FaStar, FaPlus, FaFire, FaUtensils } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { collection, query, limit, onSnapshot, where } from "firebase/firestore";
import { db } from "../../firebase";

function FeaturedDishes() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "products"),
      where("isActive", "==", true),
      limit(6)
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFeatured(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) return null;

  return (
    <section className="featured-section-modern">
      <div className="featured-head-premium">
        <span className="featured-badge-glow"><FaFire /> Live Menu</span>
        <h2 className="featured-title-main">Trending in Canteen</h2>
      </div>

      <div className="featured-dish-grid">
        {featured.length === 0 ? (
          <div className="empty-featured-state" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '30px', border: '1px dashed rgba(255,255,255,0.1)' }}>
             <FaUtensils size={40} style={{ opacity: 0.1, marginBottom: '15px' }} />
             <p style={{ color: '#94a3b8' }}>Our chefs are preparing fresh digital artifacts...</p>
          </div>
        ) : (
          featured.map((dish) => (
            <div key={dish.id} className="dish-card-premium" onClick={() => navigate('/menu')}>
              <div className="dish-img-wrapper">
                <img src={dish.image || "https://placehold.co/400x400/1e293b/white?text=No+Item+Image"} alt={dish.name} className="dish-img-premium" />
                <span className="dish-tag-premium">{dish.category || "Hot"}</span>
              </div>
              
              <div className="dish-info-premium">
                <div className="dish-header-row">
                  <h3>{dish.name}</h3>
                  <span className="dish-price-big">₹{dish.price}</span>
                </div>
                <p className="dish-desc-muted">{dish.adminName ? `By ${dish.adminName}` : "Canteen Special Product"}</p>
                
                <div className="dish-action-row">
                  <div className="rating-pill-modern">
                    <FaStar /> 4.9
                  </div>
                  <button className="add-dish-btn">
                    <FaPlus />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default FeaturedDishes;
