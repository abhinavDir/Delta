import React from "react";
import { useNavigate } from "react-router-dom";
import "./MiniCategories.css";

import AllImg from "../../assets/all_cat.png";
import DrinkImg from "../../assets/drinks_cat.png";
import FastImg from "../../assets/fastfood_cat.png";
import MealImg from "../../assets/meals_cat.png";

const miniCats = [
  { id: "all", name: "All", img: AllImg },
  { id: "drinks", name: "Drinks", img: DrinkImg },
  { id: "fastfood", name: "Fast Food", img: FastImg },
  { id: "meals", name: "Meals", img: MealImg },
];

const MiniCategories = () => {
  const navigate = useNavigate();

  return (
    <div className="mini-cats-outer">
      <div className="mini-cats-header">
        <h4>Browse by Category</h4>
        <span onClick={() => navigate("/menu")}>See All</span>
      </div>
      <div className="mini-cats-scroll">
        {miniCats.map((cat) => (
          <div 
            key={cat.id} 
            className="mini-cat-card"
            onClick={() => navigate(`/menu?category=${cat.id}`)}
          >
            <div className="mini-cat-img">
              <img src={cat.img} alt={cat.name} />
            </div>
            <span>{cat.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MiniCategories;
