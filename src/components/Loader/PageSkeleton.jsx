import React from "react";
import "./Skeleton.css";

export default function PageSkeleton() {
  return (
    <div className="skeleton-page">

      <div className="skeleton-navbar skeleton"></div>

      <div className="skeleton-hero skeleton"></div>

      <div className="skeleton-grid">

        {[1,2,3,4,5,6].map((i)=>(
          <div key={i} className="skeleton-card skeleton"></div>
        ))}

      </div>

    </div>
  );
}