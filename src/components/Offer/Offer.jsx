import React from "react";
import './Offer.css';
import { FaBolt, FaGift, FaUtensils, FaFire } from "react-icons/fa";

const offers = [
  { icon: <FaBolt />, text: "Flat 50% Off on Fast Food", },
  { icon: <FaGift />, text: "Free Coke with Every Meal", },
  { icon: <FaUtensils />, text: "Family Meal at just ₹499", },
  { icon: <FaFire />, text: "30% Off on all Hot Drinks", },
  { icon: <FaBolt />, text: "Flat 50% Off on Fast Food", },
  { icon: <FaGift />, text: "Free Coke with Every Meal", },
  { icon: <FaUtensils />, text: "Family Meal at just ₹499", },
  { icon: <FaFire />, text: "30% Off on all Hot Drinks", },
];

function Offer() {
  return (
    <div className="offer-marquee-wrap">
      <div className="offer-marquee-track">
        {offers.map((offer, i) => (
          <div className="offer-marquee-item" key={i}>
            <span className="offer-icon">{offer.icon}</span>
            <span className="offer-text">{offer.text}</span>
            <span className="offer-code-pill">{offer.code}</span>
            <span className="offer-divider">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Offer;
