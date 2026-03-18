import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Cart.css";
import {
  FaPlus,
  FaMinus,
  FaTrash,
  FaCreditCard,
  FaMoneyBillWave,
  FaArrowRight,
  FaPhoneAlt
} from "react-icons/fa";
import { useSalert } from "../Salert/Salert";

import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

/* Get admin name safely */

const getAdminNameSafe = (cartItems) => {
  if (!cartItems || cartItems.length === 0) return "";

  const raw = cartItems[0].adminName;

  if (!raw) return "";

  if (typeof raw === "string" && !raw.trim().startsWith("{")) {
    return raw;
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed.username || "";
  } catch {
    return "";
  }
};

function Cart({ cartItems, removeFromCart, updateQty, placeOrder }) {

  const navigate = useNavigate();
  const { showSalert } = useSalert();
  const timerRef = useRef(null);

  const [mobile, setMobile] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [adminPaymentInfo, setAdminPaymentInfo] = useState(null);

  const [paymentTimer, setPaymentTimer] = useState(90);
  const [showScanner, setShowScanner] = useState(false);

  const adminName = getAdminNameSafe(cartItems);
  const adminId = cartItems.length > 0 ? cartItems[0].adminId : "";

  /* Generate Correct UPI Link */

  const generateUPILink = () => {

    if (!adminPaymentInfo?.upiId) return "#";

    const upiId = encodeURIComponent(adminPaymentInfo.upiId);
    const name = encodeURIComponent(adminName || "Food Order");
    const amount = encodeURIComponent(totalPrice);
    const note = encodeURIComponent("Food Order Payment");

    return `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR&tn=${note}`;
  };

  /* Cleanup timer */

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  /* Load payment settings */

  useEffect(() => {

    if (!adminId) return;

    const loadPayment = async () => {

      try {

        const paymentDoc = await getDoc(
          doc(db, "payment_settings", adminId)
        );

        if (paymentDoc.exists()) {
          setAdminPaymentInfo(paymentDoc.data());
        }

      } catch (err) {
        console.log("Payment fetch error", err);
      }

    };

    loadPayment();

  }, [adminId]);

  /* Total price */

  const totalPrice = cartItems.reduce(
    (sum, item) =>
      sum + Number(item.discountedPrice || item.price) * (item.qty || 1),
    0
  );

  /* Quantity controls */

  const increaseQty = (id) => updateQty(id, 1);
  const decreaseQty = (id) => updateQty(id, -1);

  /* Remove item */

  const removeItem = (id) => removeFromCart(id);

  /* Group items by adminId for multi-canteen support */
  const groupByAdmin = () => {
    return cartItems.reduce((acc, item) => {
      const aid = item.adminId || "unknown";
      if (!acc[aid]) acc[aid] = [];
      acc[aid].push(item);
      return acc;
    }, {});
  };

  /* Checkout */
  const handleOrder = async () => {
    if (cartItems.length === 0) {
      showSalert("Your cart is empty!", "warning");
      return;
    }

    if (!mobile || mobile.length !== 10) {
      showSalert("Please enter a valid 10-digit mobile number", "warning");
      return;
    }

    if (!paymentMethod) {
      showSalert("Please select a payment method", "warning");
      return;
    }

    try {
      setLoading(true);

      if (paymentMethod === "cod") {
        const groups = groupByAdmin();
        const orderPromises = Object.keys(groups).map((aid) =>
          placeOrder(mobile, "COD", aid, groups[aid])
        );

        await Promise.all(orderPromises);

        // Success!
        const userKey = JSON.parse(localStorage.getItem("currentUser"))?.uid;
        if (userKey) localStorage.removeItem(`cart_items_${userKey}`);
        
        navigate("/tracking");
        return;
      }

      setShowPaymentModal(true);
    } catch (err) {
      console.error(err);
      showSalert("Checkout error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  /* Start scanner */

  const startScanner = () => {

    setShowScanner(true);
    setPaymentTimer(90);

    timerRef.current = setInterval(() => {

      setPaymentTimer(prev => {

        if (prev <= 1) {

          clearInterval(timerRef.current);
          setShowScanner(false);
          showSalert("Payment time expired", "error");

          return 0;

        }

        return prev - 1;

      });

    }, 1000);

  };

  /* Cancel payment */

  const cancelPayment = () => {

    clearInterval(timerRef.current);
    setShowScanner(false);
    setShowPaymentModal(false);

  };

  /* Confirm payment */
  const confirmPayment = async () => {
    try {
      const groups = groupByAdmin();
      const orderPromises = Object.keys(groups).map((aid) =>
        placeOrder(
          mobile,
          "ONLINE_QR",
          aid,
          groups[aid]
        )
      );

      await Promise.all(orderPromises);

      // Success!
      const userKey = JSON.parse(localStorage.getItem("currentUser"))?.uid;
      if (userKey) localStorage.removeItem(`cart_items_${userKey}`);

      setShowPaymentModal(false);
      navigate("/tracking");
    } catch {
      showSalert("Order failed. Please try again.", "error");
    }
  };

  return (

    <div className="cart-page">

      <div className="cart-container-modern">

        <div className="cart-header-main">

          <h2>🛒 Fresh Cart</h2>

          {adminName ? (
            <p>Your items from <strong>{adminName}</strong>'s kitchen are ready!</p>
          ) : (
            <p>Manage your items and proceed to checkout.</p>
          )}

        </div>

        {cartItems.length === 0 ? (

          <div className="empty-cart-modern">

            <span className="emoji">🍱</span>

            <h3>Your cart is lonely!</h3>

            <p>Add some delicious meals to keep it company.</p>

            <Link to="/menu" className="browse-menu-btn">
              Explore Menu <FaArrowRight />
            </Link>

          </div>

        ) : (

          <>

            <div className="cart-items-column">

              {cartItems.map(item => (

                <div key={item.id} className="cart-item-modern">

                  <div className="item-visual-box">

                    <img
                      src={item.image || "https://via.placeholder.com/100"}
                      alt={item.name}
                      className="cart-item-image"
                    />

                  </div>

                  <div className="item-info-main">

                    <h4>{item.name}</h4>

                    <span className="item-price-tag">
                      ₹{(item.discountedPrice || item.price) * (item.qty || 1)}
                    </span>

                    <div className="item-stock-status" style={{ color: Number(item.quantity) < 5 ? '#ef4444' : '#94a3b8' }}>
                      Stock: {item.quantity} available
                    </div>

                  </div>

                  <div className="qty-modern-control">

                    <button onClick={() => decreaseQty(item.id)}>
                      <FaMinus />
                    </button>

                    <span>{item.qty || 1}</span>

                    <button onClick={() => increaseQty(item.id)}>
                      <FaPlus />
                    </button>

                  </div>

                  <button
                    className="remove-modern-btn"
                    onClick={() => removeItem(item.id)}
                  >
                    <FaTrash />
                  </button>

                </div>

              ))}

            </div>

            <div className="cart-sidebar-modern">

              <div className="sidebar-glass-card">

                <h4>Checkout Details</h4>

                <div className="modern-form-row">

                  <label><FaPhoneAlt /> Contact Number</label>

                  <input
                    type="tel"
                    className="modern-input-field"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="10-digit mobile number"
                  />

                </div>

                <div className="modern-form-row">

                  <label>Payment Mode</label>

                  <div className="payment-grid-modern">

                    <div
                      className={`payment-option-card ${paymentMethod === "cod" ? "active" : ""}`}
                      onClick={() => setPaymentMethod("cod")}
                    >
                      <FaMoneyBillWave /> Cash on Delivery
                    </div>

                    <div
                      className={`payment-option-card ${paymentMethod === "online" ? "active" : ""}`}
                      onClick={() => setPaymentMethod("online")}
                    >
                      <FaCreditCard /> UPI / Scan & Pay
                    </div>

                  </div>

                </div>

                <div className="summary-details-box">

                  <div className="summary-line">
                    <span>Subtotal</span>
                    <span>₹{totalPrice}</span>
                  </div>

                  <div className="total-line-big">
                    <span>Grand Total</span>
                    <span>₹{totalPrice}</span>
                  </div>

                </div>

                <button
                  className="premium-checkout-btn"
                  onClick={handleOrder}
                  disabled={loading}
                >
                  {loading ? "Processing..." : `Secure Checkout • ₹${totalPrice}`}
                </button>

              </div>

            </div>

          </>

        )}

      </div>

      {/* PAYMENT POPUP */}

      {showPaymentModal && adminPaymentInfo && (

        <div className="payment-overlay">

          <div className="payment-card">

            <h3>Scan & Pay</h3>

            <p>Pay ₹{totalPrice} to <b>{adminName}</b></p>

            {!showScanner && (

              <button
                className="upi-pay-btn"
                onClick={startScanner}
              >
                📷 View QR Scanner
              </button>

            )}

            {showScanner && (

              <>

                <img
                  src={
                    adminPaymentInfo.qrUrl?.startsWith("upi://")
                      ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(adminPaymentInfo.qrUrl)}`
                      : adminPaymentInfo.qrUrl
                  }
                  alt="QR"
                  style={{ width: "220px", marginBottom: "15px" }}
                />

                <p style={{ color: "red", fontWeight: "bold" }}>
                  Time Left {Math.floor(paymentTimer / 60)}:
                  {(paymentTimer % 60).toString().padStart(2, "0")}
                </p>

                {adminPaymentInfo?.upiId && (

                  <a
                    href={generateUPILink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="upi-pay-btn"
                  >
                    🚀 Pay with PhonePe / GPay
                  </a>

                )}

                <button
                  className="confirm-payment-btn"
                  onClick={confirmPayment}
                >
                  ✅ I've Paid — Confirm Order
                </button>

              </>

            )}

            <button
              className="confirm-payment-btn"
              onClick={cancelPayment}
              style={{ marginTop: "10px", background: "#ff4d4d" }}
            >
              ❌ Cancel Payment
            </button>

          </div>

        </div>

      )}

    </div>

  );

}

export default Cart;