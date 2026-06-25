import React from "react";
import "./Pagestyles.css";  // External CSS

export default function Home() {
  return (
    <div className="home-container">
      <h1 className="hero-heading">Welcome to Sales Order B2B/B2C App</h1>
      <p className="hero-subtext">
        Manage products, pricing, discounts, and orders in one place.
      </p>
    </div>
  );
}
