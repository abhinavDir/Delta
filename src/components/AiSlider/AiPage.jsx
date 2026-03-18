import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import './AiPage.css';
import { FaRobot, FaArrowRight } from "react-icons/fa";
import Image1 from '../../assets/1ai.jpg';
import Image2 from '../../assets/2ai.jpg';
import Image3 from '../../assets/3ai.jpg';
import Image4 from '../../assets/4ai.jpg';
import Image5 from '../../assets/5ai.jpg';

const slides = [
  { img: Image1, title: "Intelligent Canteen Assistant" },
  { img: Image2, title: "Personalized Food Recommendations" },
  { img: Image3, title: "AI-Powered Meal Planning" },
  { img: Image4, title: "Real-time Order Prediction" },
  { img: Image5, title: "Smart Dietary Tracking" },
];

function AiSlider() {
  const [current, setCurrent] = useState(0);
  const length = slides.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev === length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [length]);

  return (
    <div className="ai-experience-section">
      <div className="ai-slider-graphics">
        <div className="ai-head-premium">
          <span className="ai-badge-neon">Powered by Neural Tech</span>
          <h2 className="ai-title-glow">The Future of Canteen</h2>
        </div>

        <div className="ai-slider-wrapper">
          {slides.map((slide, index) => (
            <div key={index} className={`ai-slide-modern ${index === current ? "active" : ""}`}>
              <div className="ai-visual-container">
                <img src={slide.img} alt={slide.title} className="ai-img-parallax" />
                <div className="ai-overlay-sci-fi">
                  <div className="ai-slide-info">
                    <h2>{slide.title}</h2>
                    <Link to="/aichat" className="ai-btn-premium">
                      <FaRobot /> Experience AI Chat <FaArrowRight />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="ai-slider-dots">
            {slides.map((_, idx) => (
              <div
                key={idx}
                className={`ai-dot ${idx === current ? "active" : ""}`}
                onClick={() => setCurrent(idx)}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AiSlider;
