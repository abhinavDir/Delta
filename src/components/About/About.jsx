import React from "react";
import { FaHamburger, FaTruck, FaRupeeSign, FaLeaf, FaStar } from "react-icons/fa";
import "./About.css";

function About() {
  const aboutData = [
    {
      icon: <FaHamburger />,
      title: "Gourmet Quality",
      desc: "Freshly prepared meals with authentic global flavors to satisfy every craving.",
    },
    {
      icon: <FaTruck />,
      title: "Express Delivery",
      desc: "Get your food delivered across campus in record time or pick up instantly.",
    },
    {
      icon: <FaRupeeSign />,
      title: "Student Pricing",
      desc: "Premium dining experience at pocket-friendly prices tailored for students.",
    },
    {
      icon: <FaLeaf />,
      title: "Sustainable Sourcing",
      desc: "Only the freshest, farm-to-table ingredients handled with A+ hygiene standards.",
    },
  ];

  return (
    <section className="about-section-graphics">
      <div className="about-branding-head">
        <span className="about-badge-premium"><FaStar /> Since 2024</span>
        <h1 className="about-main-title">Passion for <span>Great Taste</span></h1>
        <p className="about-hero-text">
          More than just a canteen, we are a culinary hub dedicated to serving
          <strong> quality, health, and happiness</strong> in every bite.
        </p>
      </div>

      <div className="about-grid-premium">
        {aboutData.map((item, index) => (
          <div className="about-story-card" key={index}>
            <div className="about-icon-premium">{item.icon}</div>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default About;
