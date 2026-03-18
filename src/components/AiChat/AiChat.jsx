import React, { useState, useEffect, useRef } from "react";
import "./AiChat.css";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

function AIChatPage() {

  const [messages, setMessages] = useState([
    { type: "ai", text: "👋 Hello! Ask anything about menu, orders, prices or support." }
  ]);

  const [input, setInput] = useState("");

  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [admins, setAdmins] = useState([]);

  const bottomRef = useRef();

  const user = JSON.parse(localStorage.getItem("currentUser"));

  /* ================= FETCH MENU ================= */

  useEffect(() => {

    const unsub = onSnapshot(collection(db, "products"), (snap) => {

      setMenu(
        snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );

    });

    return () => unsub();

  }, []);

  /* ================= FETCH ORDERS ================= */

  useEffect(() => {

    const unsub = onSnapshot(collection(db, "orders"), (snap) => {

      setOrders(
        snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );

    });

    return () => unsub();

  }, []);

  /* ================= FETCH ADMINS ================= */

  useEffect(() => {

    const unsub = onSnapshot(collection(db, "admins"), (snap) => {

      setAdmins(
        snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );

    });

    return () => unsub();

  }, []);

  /* ================= AUTO SCROLL ================= */

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= AI RESPONSE ENGINE ================= */

  const generateResponse = (text) => {

    const query = text.toLowerCase();

    /* ================= MENU SEARCH ================= */

    const itemMatch = menu.filter(item => {

      const title = item.title?.toLowerCase() || "";

      return query.split(" ").some(word => title.includes(word));

    });

    if (itemMatch.length > 0) {

      const items = itemMatch.slice(0, 5)
        .map(i => `🍔 ${i.title} - ₹${i.price}`)
        .join("\n");

      return `Here are matching menu items:\n\n${items}`;

    }

    /* ================= SHOW MENU ================= */

    if (query.includes("menu") || query.includes("food") || query.includes("items")) {

      const items = menu.slice(0, 6)
        .map(i => `${i.title} - ₹${i.price}`)
        .join("\n");

      return `🍽 Popular Menu\n\n${items}`;

    }

    /* ================= PRICE QUESTIONS ================= */

    if (query.includes("price") || query.includes("cost") || query.includes("rate")) {

      const items = menu.slice(0, 8)
        .map(i => `${i.title} : ₹${i.price}`)
        .join("\n");

      return `💰 Item Prices\n\n${items}`;

    }

    /* ================= ORDER TRACKING ================= */

    if (query.includes("order") || query.includes("track") || query.includes("status")) {

      const userOrders = orders.filter(o => o.userId === user?.uid);

      if (userOrders.length === 0) {
        return "📦 You haven't placed any order yet.";
      }

      const latest = userOrders[userOrders.length - 1];

      return `📦 Latest Order
Order ID: ${latest.id.slice(-6)}
Status: ${latest.status}`;

    }

    /* ================= ORDER ITEMS ================= */

    if (
      query.includes("my order") ||
      query.includes("what did i order") ||
      query.includes("order items")
    ) {

      const userOrders = orders.filter(o => o.userId === user?.uid);

      if (userOrders.length === 0) {
        return "🛒 You haven't ordered anything yet.";
      }

      const latest = userOrders[userOrders.length - 1];

      const items = latest.items
        ?.map(i => `${i.title || i.name} x${i.qty}`)
        .join("\n");

      return `🛒 Your Last Order Items:\n\n${items}`;

    }

    /* ================= CUSTOMER CARE ================= */

    if (
      query.includes("support") ||
      query.includes("help") ||
      query.includes("canteen") ||
      query.includes("call") ||
      query.includes("contact")
    ) {

      const userOrders = orders.filter(o => o.userId === user?.uid);

      if (userOrders.length === 0) {
        return "You haven't placed any order yet.";
      }

      const latestOrder = userOrders[userOrders.length - 1];

      const admin = admins.find(a => a.id === latestOrder.adminId);

      if (admin) {

        return `☎ Customer Care
Canteen: ${admin.canteen || admin.name}
Phone: ${admin.phone}`;

      }

      return "Customer care information not available.";

    }

    /* ================= PROFILE ================= */

    if (query.includes("profile") || query.includes("account")) {

      if (!user) {
        return "Please login to view your profile.";
      }

      return `👤 Profile
Name: ${user.displayName || user.name}
Email: ${user.email}
Phone: ${user.phoneNumber || user.mobile || "Not added"}`;

    }

    return "🤖 I couldn't understand. Try asking about menu, price, order, support or profile.";

  };

  /* ================= QUICK ACTIONS ================= */

  const quickActions = [
    "Track my order",
    "Show menu",
    "Customer Support",
    "My Profile",
    "What did I order?"
  ];

  const handleQuickAction = (action) => {
    const userMsg = { type: "user", text: action };
    const aiMsg = { type: "ai", text: generateResponse(action) };
    setMessages((prev) => [...prev, userMsg, aiMsg]);
  };

  /* ================= SEND MESSAGE ================= */

  const sendMessage = () => {

    if (!input.trim()) return;

    const userMsg = { type: "user", text: input };

    const aiMsg = {
      type: "ai",
      text: generateResponse(input)
    };

    setMessages(prev => [...prev, userMsg, aiMsg]);

    setInput("");

  };

  const handleKeyPress = (e) => {

    if (e.key === "Enter") {
      sendMessage();
    }

  };

  return (

    <div className="ai-chat-wrapper">

      <div className="chat-container">

        {/* HEADER */}
        {/* <div className="chat-header-premium">
          <div className="chat-header-left">
            <div className="chat-avatar">
              <span role="img" aria-label="robot">🤖</span>
            </div>
            <div className="chat-header-info">
              <h3>CMS Assistant</h3>
              <p>Online • Replies instantly</p>
            </div>
          </div>
        </div> */}

        {/* CHAT BODY */}
        <div className="chat-body-premium">

          <div className="chat-intro-date">Today</div>

          {messages.map((msg, i) => (
            <div key={i} className={`chat-bubble-row ${msg.type}`}>
              {msg.type === "ai" && (
                <div className="chat-bot-icon">🤖</div>
              )}
              <div className="chat-bubble">
                {msg.text.split('\n').map((line, idx) => (
                  <span key={idx}>
                    {line}
                    <br />
                  </span>
                ))}
              </div>
            </div>
          ))}

          <div ref={bottomRef} style={{ height: "1px" }}></div>

        </div>

        {/* QUICK ACTIONS */}
        <div className="chat-quick-actions">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              className="quick-action-chip"
              onClick={() => handleQuickAction(action)}
            >
              {action}
            </button>
          ))}
        </div>

        {/* INPUT */}
        <div className="chat-input-premium">

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
          />

          <button
            className={`send-btn ${input.trim() ? "active" : ""}`}
            onClick={sendMessage}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

        </div>

      </div>

    </div>

  );

}

export default AIChatPage;