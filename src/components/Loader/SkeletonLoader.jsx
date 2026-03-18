import React from 'react';
import './SkeletonLoader.css';

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const renderSkeleton = (key) => {
    switch (type) {
      case 'menu':
        return (
          <div key={key} className="skeleton-menu-card">
            <div className="skeleton-img"></div>
            <div className="skeleton-text skeleton-title"></div>
            <div className="skeleton-text skeleton-desc"></div>
            <div className="skeleton-text skeleton-price"></div>
            <div className="skeleton-button"></div>
          </div>
        );
      case 'order':
        return (
          <div key={key} className="skeleton-order-card">
            <div className="skeleton-order-header">
              <div className="skeleton-text skeleton-order-id"></div>
              <div className="skeleton-badge"></div>
            </div>
            <div className="skeleton-order-items">
              <div className="skeleton-tag"></div>
              <div className="skeleton-tag"></div>
              <div className="skeleton-tag"></div>
            </div>
            <div className="skeleton-order-footer">
              <div className="skeleton-text skeleton-price"></div>
              <div className="skeleton-text skeleton-date"></div>
            </div>
          </div>
        );
      case 'card':
      default:
        return (
          <div key={key} className="skeleton-card">
            <div className="skeleton-img"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-text short"></div>
          </div>
        );
    }
  };

  return (
    <div className={`skeleton-container ${type}-container`}>
      {Array.from({ length: count }).map((_, index) => renderSkeleton(index))}
    </div>
  );
};

export default SkeletonLoader;
