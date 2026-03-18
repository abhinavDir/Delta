import React, { useEffect, useState } from "react";
import "./OrderTracking.css";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import {
  FaBox,
  FaUtensils,
  FaTruck,
  FaCheckCircle,
  FaTimes,
  FaArrowRight
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useSalert } from "../Salert/Salert";

const stages = [
  { name: "Order Received", icon: <FaBox />, status: "Order Received" },
  { name: "Preparing", icon: <FaUtensils />, status: "Preparing" },
  { name: "Out for Delivery", icon: <FaTruck />, status: "Out for Delivery" },
  { name: "Delivered", icon: <FaCheckCircle />, status: "Delivered" }
];

const OrderTracking = ({ orders }) => {

  const [cachedOrders, setCachedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSalert } = useSalert();

  const storedUser =
    JSON.parse(localStorage.getItem("currentUser")) ||
    JSON.parse(localStorage.getItem("userSignup")) ||
    null;

  const userId = storedUser?.uid || storedUser?.mobile || storedUser?.email || null;
  const userMobile = storedUser?.mobile || null;

  /* LOAD CACHED ORDERS FIRST (INSTANT UI) */

  useEffect(() => {
    const cache = JSON.parse(localStorage.getItem("orders_cache"));
    if (cache) {
      setCachedOrders(cache);
      setLoading(false);
    }
  }, []);

  /* UPDATE CACHE WHEN FIREBASE ORDERS CHANGE */

  useEffect(() => {
    if (orders && orders.length > 0) {
      setCachedOrders(orders);
      localStorage.setItem("orders_cache", JSON.stringify(orders));
      setLoading(false);
    }
  }, [orders]);

  const userOrders = userId
    ? (cachedOrders || [])
      .filter(
        (o) =>
          ((o.userId && String(o.userId) === String(userId)) ||
            (o.mobile && String(o.mobile) === String(userMobile))) &&
          o.status !== "Delivered" &&
          o.status !== "Cancelled" &&
          o.status !== "Rejected"
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : [];

  const handleCancel = async (id) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        await updateDoc(doc(db, "orders", id), { status: "Cancelled" });
      } catch (error) {
        console.error("Error cancelling order:", error);
        showSalert("Failed to cancel order", "error");
      }
    }
  };

  const getProgressWidth = (status) => {
    const index = stages.findIndex((s) => s.status === status);
    if (index === -1) return 0;
    return (index / (stages.length - 1)) * 100;
  };

  const getStatusClass = (status) => {
    if (status === "Cancelled") return "status-cancelled";
    if (status === "Delivered") return "status-delivered";
    if (status === "Out for Delivery") return "status-delivery";
    if (status === "Preparing") return "status-preparing";
    return "status-received";
  };

  return (
    <div className="tracking-page">
      <div className="tracking-container">

        <div className="tracking-header">
          <span className="tracking-badge">Live Status</span>
          <h2>Track Your Feast</h2>
        </div>

        {/* SKELETON LOADER */}

        {loading && (
          <>
            {[1, 2].map((i) => (
              <div key={i} className="order-tracking-card skeleton-card">
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-line"></div>
                <div className="skeleton skeleton-line"></div>
                <div className="skeleton skeleton-progress"></div>
              </div>
            ))}
          </>
        )}

        {!loading && userOrders.length === 0 && (
          <div className="empty-tracking-box">
            <span className="empty-visual">🥡</span>
            <h3>No Active Orders</h3>
            <p>Looks like you haven't ordered anything yet.</p>

            <Link to="/menu" className="browse-menu-btn">
              Browse Menu <FaArrowRight />
            </Link>
          </div>
        )}

        {!loading && userOrders.map((order) => {

          const currentStageIndex = stages.findIndex(
            (s) => s.status === order.status
          );

          const isCancelled = order.status === "Cancelled";

          return (
            <div key={order.id} className="order-tracking-card">

              <div className="order-meta-header">

                <div className="order-id-box">
                  <h3>Order #{order.id.slice(-6).toUpperCase()}</h3>
                  <span className="order-timestamp">
                    Ordered from {order.adminName || "Our Kitchen"}
                  </span>
                </div>

                <div className={`status-glow-pill ${getStatusClass(order.status)}`}>
                  {order.status}
                </div>

              </div>

              <div className="order-items-info">
                <p>
                  <strong>Items:</strong>{" "}
                  {(order.items || [])
                    .map((i) => i.title || i.name)
                    .join(", ")}
                </p>
              </div>

              {!isCancelled && (
                <div className="cancel-action-row">
                  <button
                    className="modern-cancel-btn"
                    onClick={() => handleCancel(order.id)}
                    disabled={order.status === "Delivered"}
                  >
                    <FaTimes /> Cancel Order
                  </button>
                </div>
              )}

              {!isCancelled ? (
                <div className="tracking-timeline">

                  <div
                    className="timeline-progress-bar"
                    style={{
                      width:
                        window.innerWidth > 600
                          ? `${getProgressWidth(order.status)}%`
                          : "4px",
                      height:
                        window.innerWidth <= 600
                          ? `${getProgressWidth(order.status)}%`
                          : "4px"
                    }}
                  ></div>

                  {stages.map((stage, index) => (
                    <div
                      key={index}
                      className={`timeline-step ${index < currentStageIndex ? "completed" : ""
                        } ${index === currentStageIndex ? "active" : ""}`}
                    >
                      <div className="step-node">{stage.icon}</div>
                      <span className="step-label">{stage.name}</span>
                    </div>
                  ))}

                </div>
              ) : (
                <div className="cancelled-banner">
                  <p>This order has been cancelled.</p>
                </div>
              )}

            </div>
          );
        })}

      </div>
    </div>
  );
};

export default OrderTracking;