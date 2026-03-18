import React from "react";
import './Announcement.css';
import Image2 from '../../assets/a3.jpg';
import Image4 from '../../assets/a4.jpg';
import Image5 from '../../assets/bg.png';

const bulletins = [
  { img: Image2, title: "Zero Plastic Initiative ", date: "Eco-Friendly" },
  { img: Image4, title: "Hygiene Standard A+ Rating", date: "Safety First" },
  { img: Image5, title: "Weekend Buffet Carnival", date: "Upcoming Event" },
];

function Announcement() {
  return (
    <div className="announcement-section">
      <div className="bulletin-head">
        <span className="anniversary-badge">Notice Board</span>
        <h2 className="announcement-title-modern">Latest Highlights</h2>
      </div>

      <div className="bulletin-grid">
        {bulletins.map((item, index) => (
          <div key={index} className="bulletin-card-premium">
            <div className="bulletin-img-container">
              <img src={item.img} alt={item.title} className="bulletin-img-premium" />
              <div className="bulletin-overlay-premium">
                <span className="bulletin-date">{item.date}</span>
                <h3>{item.title}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Announcement;
