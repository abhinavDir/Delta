import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSalert } from "../Salert/Salert";
import "./Nav.css";
import { FiHome, FiSearch, FiTruck, FiUser, FiShoppingCart, FiCpu, FiLogOut, FiMapPin } from "react-icons/fi";

function Nav({ cartItems, user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  /* 🔑 HOTEL STATE */
  const [hotelName, setHotelName] = useState(null);

  useEffect(() => {
    const syncHotel = () => {
      setHotelName(localStorage.getItem("selectedHotelName"));
    };
    syncHotel();
    window.addEventListener("storage", syncHotel);
    return () => window.removeEventListener("storage", syncHotel);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminHotelId");
    setUser(null);
    navigate("/login");
  };

  const handleChangeHotel = () => {
    localStorage.removeItem("selectedHotelId");
    localStorage.removeItem("selectedHotelName");
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("cart_")) {
        localStorage.removeItem(key);
      }
    });
    setHotelName(null);
    navigate("/select-hotel");
  };

  const { showSalert } = useSalert();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!user) {
      showSalert("Please login to search items!", "warning");
      return;
    }
    if (!searchTerm.trim()) return;
    navigate("/search", { state: { query: searchTerm } });
    setSearchTerm("");
  };

  const showTopNav = 
    location.pathname === "/" || 
    location.pathname === "/user" || 
    location.pathname === "/cart" || 
    location.pathname === "/tracking";

  return (
    <>
      {/* ================= TOP NAVBAR ================= */}
      {showTopNav && (
        <nav className="navbar-top">
          <div className="top-left">
            <div className="logo">
              <span className="logo-icon"><FiCpu /></span>
              FusionX
            </div>
          </div>

          <div className="top-center">
            <ul className="nav-links">
              <li><Link to="/"><FiHome /> Home</Link></li>

              <li>
                <form onSubmit={handleSearch} className="search-form">
                  <FiSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Ask or find food..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </form>
              </li>

              <li><Link to="/tracking"><FiTruck /> Tracker</Link></li>

              <li>
                {user ? (
                  <Link to="/user"><FiUser /> Profile</Link>
                ) : (
                  <Link to="/login"><FiUser /> Login</Link>
                )}
              </li>
            </ul>
          </div>

          {/* 🔥 RIGHT SIDE */}
          <div className="top-right">
            {hotelName && (
              <button
                className="hotel-switch-btn"
                onClick={handleChangeHotel}
                title="Change Hotel"
              >
                <FiMapPin /> {hotelName}
              </button>
            )}

            {user && (
              <button
                onClick={handleLogout}
                className="logout-btn"
                title="Logout"
              >
                <FiLogOut />
              </button>
            )}

            <Link to="/cart" className="cart-btn">
              <FiShoppingCart />
              <span className="cart-count">
                {cartItems.reduce((acc, current) => acc + (current.qty || 1), 0)}
              </span>
            </Link>
          </div>
        </nav>
      )}

      {/* ================= BOTTOM NAVBAR ================= */}
      <ul className="navbar-bottom">
        <li><Link to="/" className={location.pathname === "/" ? "active" : ""}><FiHome /></Link></li>
        <li><Link to="/search" className={location.pathname === "/search" ? "active" : ""}><FiSearch /></Link></li>
        <li><Link to="/tracking" className={location.pathname === "/tracking" ? "active" : ""}><FiTruck /></Link></li>
        <li>
          {user ? (
            <Link to="/user" className={location.pathname === "/user" ? "active" : ""}><FiUser /></Link>
          ) : (
            <Link to="/login" className={location.pathname === "/login" ? "active" : ""}><FiUser /></Link>
          )}
        </li>
      </ul>
    </>
  );
}

export default Nav;
