import React from "react";
import './Page.css';

function Page() {
  const items = [
    {
      icon: "🤖",
      name: "AI",
      content: "Personalized meal plans and fitness advice tailored specifically to your body and goals."
    },
    {
      icon: "🚚",
      name: "Live Order Tracking",
      content: "Track your food order in real-time from our kitchen directly to your table."
    },
    {
      icon: "📱",
      name: "Seamless QR Payments",
      content: "Scan to pay or use your favorite UPI apps for an instant, cashless checkout experience."
    },
    {
      icon: "🛍️",
      name: "Smart Cart Management",
      content: "Add items from multiple canteens into a single cart and checkout seamlessly."
    },
    {
      icon: "👑",
      name: "Premium Dashboard",
      content: "View your complete order history, total spent, and track your loyalty rewards."
    },
    {
      icon: "⭐",
      name: "Exclusive Offers",
      content: "Get access to member-only discounts, weekend mega buffets, and flash sales."
    },
  ];

  return (
    <div className="services-premium-section">
      <div className="services-head">
        <span className="services-badge">Why Choose Us</span>
        <h2 className="services-title">Special Services</h2>
      </div>

      <div className="services-grid-wrapper">
        {items.map((item, index) => (
          <div className="service-card-graphics" key={index}>
            <div className="service-icon-box">
              <span role="img" aria-label={item.name}>{item.icon}</span>
            </div>
            <h3>{item.name}</h3>
            <p>{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Page;
