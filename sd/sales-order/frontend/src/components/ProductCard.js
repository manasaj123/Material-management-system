import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import "./ProductCard.css";  

export default function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);

  return (
    <div className="product-card">
      {/* PRODUCT IMAGE */}
      <img
        src={product.image}
        alt={product.name}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "https://via.placeholder.com/300x200?text=Image+Not+Available";
        }}
        className="product-image"
      />

      <h4 className="product-name">{product.name}</h4>

      {/* PRICE */}
      {product.discount ? (
        <p className="price-container">
          <span className="old-price">₹ {product.price}</span>
          <span className="current-price">₹ {product.price - product.discount}</span>
        </p>
      ) : (
        <p className="price-container">
          <span className="current-price">₹ {product.price}</span>
        </p>
      )}

      {/* OFFER */}
      {product.offer && <p className="offer-text">{product.offer}</p>}

      
      <button
        className="add-to-cart-btn"
        onClick={() => addToCart(product)}
      >
        Add to Cart →
      </button>
    </div>
  );
}
