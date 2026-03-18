import React from "react";
import './Offer2.css';
import { FaTicketAlt, FaArrowRight } from "react-icons/fa";
import Image3 from '../../assets/offer3.jpg';

function Offer2() {
  return (
    <div className="offer2-section">
      <div className="offer2-banner-premium">
        <div
          className="offer2-graphic-bg"
          style={{ backgroundImage: `url(${Image3})` }}
        ></div>

        <div className="offer2-content">
          <span className="offer2-badge">Limited Time Only</span>
          <h2>Weekend Mega Buffet</h2>
          <p>Unlimited dishes, drinks, and desserts at just ₹299 for all students.</p>
          <button className="offer2-btn">
            <FaTicketAlt /> Claim Pass <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Offer2;
