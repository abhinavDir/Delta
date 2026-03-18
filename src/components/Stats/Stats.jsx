import React from "react";
import "./Stats.css";

function StatsRibbon() {
  const stats = [
    { value: "10K+", label: "Happy Diners" },
    { value: "50+", label: "Daily Dishes" },
    { value: "15M", label: "Delivery Time" },
    { value: "4.9", label: "Avg Rating" }
  ];

  return (
    <div className="stats-ribbon-modern">
      <div className="stats-grid-premium">
        {stats.map((stat, index) => (
          <div key={index} className="stat-item-premium">
            <span className="stat-value-big">{stat.value}</span>
            <span className="stat-label-muted">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StatsRibbon;
