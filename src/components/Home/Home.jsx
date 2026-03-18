import React from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiTruck, FiStar, FiClock } from "react-icons/fi";
import { FaPizzaSlice, FaShoppingBag } from "react-icons/fa";
import './Home.css';

// New Assets
import DeliveryPerson from '../../assets/delivery_person.png';
import ThaliImg from '../../assets/thali.png';
import RiderIcon from '../../assets/rider.png'; // Small rider icon for badges

function Home() {
  const navigate = useNavigate();

  return (
    <div className="fodel-hero">
      {/* Decorative Background Patterns */}
      <div className="hero-patterns">
        <div className="pattern-wave wave-1"></div>
        <div className="pattern-wave wave-2"></div>
        <div className="bg-orb orb-pink"></div>
        <div className="bg-orb orb-orange"></div>
      </div>

      <div className="hero-container">
        {/* Left Content Side */}
        <div className="hero-left">
          <div className="live-tracking-badge">
            <img src={RiderIcon} alt="Rider" className="badge-icon" />
            <span>Live Order Tracking</span>
          </div>

          <h1 className="hero-main-title">
            Most Fastest Food <br />
            <span className="highlight-red">Delivery</span> Service
          </h1>

          <p className="hero-subtitle">
            Order food online from restaurants and get it delivered.
            Serving in Bangalore, Hyderabad, Delhi, Gurgaon, Chandigarh, Ahemdabad...
          </p>

          <div className="location-search-box">
            <div className="search-input-wrapper">
              <FiSearch className="search-box-icon" />
              <input type="text" placeholder="Type your Location" />
            </div>
            <button className="search-submit-btn" onClick={() => navigate('/menu')}>
              Search
            </button>
          </div>
        </div>

        {/* Right Image Side */}
        <div className="hero-right">
          <div className="hero-image-wrapper">
            <img src={DeliveryPerson} alt="Delivery Staff" className="main-delivery-img" />

            {/* Floating Info Cards */}
            <div className="floating-card thali-card card-animate">
              <img src={ThaliImg} alt="Thali" className="card-thumb" />
              <div className="card-info">
                <span className="info-title">Indian Thali</span>
                <div className="info-rating">
                  <FiStar /> <FiStar /> <FiStar /> <FiStar /> <FiStar />
                </div>
                <span className="info-price">₹200</span>
              </div>
            </div>

            <div className="floating-card quality-card card-animate">
              <div className="icon-circle pizza-bg">
                <FaPizzaSlice />
              </div>
              <span>Quality Food</span>
            </div>

            <div className="floating-card fastest-card card-animate">
              <div className="icon-circle delivery-bg">
                <FiTruck />
              </div>
              <span>Fastest Delivery</span>
            </div>

            <div className="floating-card free-card card-animate">
              <div className="icon-circle free-bg">
                <FaShoppingBag />
              </div>
              <span>Free Shipping</span>
            </div>

            <div className="time-badge card-animate">
              <FiClock />
            </div>
          </div>
        </div>
      </div>

      {/* Snake-like Wavy Divider */}
      <div className="hero-wave-separator">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path
            fill="#f8fafc"
            fillOpacity="1"
            d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </div>
  );
}

export default Home;
