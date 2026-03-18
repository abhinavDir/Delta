import React from "react";
import { useLocation } from "react-router-dom";
import FoodGallery1 from "./Food";

function Menu({ products, addToCart, cartItems }) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const category = params.get("category") || "all";

  return <FoodGallery1 products={products} addToCart={addToCart} cartItems={cartItems} category={category} />;
}

export default Menu;
