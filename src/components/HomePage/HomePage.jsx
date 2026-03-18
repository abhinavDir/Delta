import React from "react";
import ImageSlider from "../Home/Home";
import Categories from "../Category/CategoryItem";
import Offer from "../Offer/Offer";
import GifExample from "../Page/Page";
import About from "../About/About";
import "./HomePage.css";

function HomePage() {
  return (
    <main className="home-page">
      {/* Hero / slider */}
      <ImageSlider />

      {/* Categories */}
      <Categories />

      {/* Small offer strip */}
      <Offer />

      {/* Banner GIF */}
      <GifExample />

      {/* About section */}
      <About />
    </main>
  );
}

export default HomePage;
