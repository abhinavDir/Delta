import React from "react";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaInstagram,
  FaTwitter,
  FaFacebookF
} from "react-icons/fa";
import "./Footer.css";

function Footer() {

  return (

    <footer className="footer-premium">
      <div className="footer-glow-bg"></div>

      <div className="footer-main-grid">

        {/* Brand Section */}
        <div className="footer-col footer-brand-info">

          <h3 className="brand-name">FusionXCanteeN</h3>

          <p>
            Experience the future of canteen dining. Freshly prepared meals,
            smart AI recommendations, and seamless digital ordering — all in one place.
          </p>

          <div className="footer-social-box">
            <a href="#" className="social-icon-btn"><FaInstagram /></a>
            <a href="#" className="social-icon-btn"><FaTwitter /></a>
            <a href="#" className="social-icon-btn"><FaFacebookF /></a>
          </div>

        </div>

        {/* Contact Section */}
        <div className="footer-col footer-links-col">

          <h4>Connect with Us</h4>

          <div className="footer-contact-list">

            <div className="contact-item-row">
              <FaPhoneAlt />
              <span>+91 9335110984</span>
            </div>

            <div className="contact-item-row">
              <FaEnvelope />
              <span>fusionxcanteen@gmail.com</span>
            </div>

            <div className="contact-item-row">
              <FaMapMarkerAlt />
              <span>Bhaisamau BKT NH-24, Lucknow, India</span>
            </div>

          </div>

        </div>

      </div>

      <div className="footer-divider"></div>

      <div className="footer-copyright-row">

        <p>
          © {new Date().getFullYear()} FusionXCanteeN. Intelligence in every bite.
        </p>

        <p>
          Designed by Abhinav Pandey
        </p>

      </div>

    </footer>


  );

}

export default Footer;
