import React from "react";
import { useNavigate } from "react-router-dom";
import "./CategoryItem.css";
import { FaArrowRight } from "react-icons/fa";

import AllImg from "../../assets/all_cat.png";
import DrinkImg from "../../assets/drinks_cat.png";
import FastImg from "../../assets/fastfood_cat.png";
import MealImg from "../../assets/meals_cat.png";

const categories = [
  { name: "Browse All", value: "all", img: AllImg, count: "50+ Dishes", color: "#6c5ce7" },
  { name: "Cold Drinks", value: "drinks", img: DrinkImg, count: "14 Drinks", color: "#0984e3" },
  { name: "Fast Food", value: "fastfood", img: FastImg, count: "28 Items", color: "#e17055" },
  { name: "Royal Meals", value: "meals", img: MealImg, count: "22 Meals", color: "#00b894" },
];

const Categories = () => {
  const navigate = useNavigate();

  const goToCategory = (cat) => {
    navigate(`/menu?category=${cat}`);
  };

  return (
    <div className="categories-section">
      <div className="section-header-premium">
        <div className="label-wrapper">
          <span className="premium-label">Our Menu</span>
        </div>
        <h2 className="premium-title">Choose By <span className="title-accent">Categories</span></h2>
        <p className="premium-desc">Select your favorites from our curated selection of top-rated dishes and refreshing beverages.</p>
      </div>

      <div className="categories-grid-premium">
        {categories.map((cat) => (
          <div
            key={cat.value}
            className="category-card-premium"
            onClick={() => goToCategory(cat.value)}
            style={{ "--accent-color": cat.color }}
          >
            <div className="card-inner-graphic">
              <div className="image-container-premium">
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="category-img-main"
                />
              </div>
              <div className="category-details-header">
                <span className="category-item-count">{cat.count}</span>
                <h3 className="category-item-name">{cat.name}</h3>
              </div>
              <div className="category-action-circle">
                <FaArrowRight />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
