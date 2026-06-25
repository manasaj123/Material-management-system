import React from "react";
import ProductCard from "../components/ProductCard";
import "./Pagestyles.css";  

export const products = [ 
    { id: 1, name: 'Samsung 55" 4K TV', price: 50000, discount: 5000, offer: "Special Holiday Offer!", image: "https://m.media-amazon.com/images/I/81Zt42ioCgL._SX679_.jpg" }, 
    { id: 2, name: "Apple MacBook Air M2", price: 120000, discount: 10000, offer: "10% Off – Limited Time!", image: "https://m.media-amazon.com/images/I/71f5Eu5lJSL._SX679_.jpg" },
    { id: 3, name: "Dell Inspiron Laptop", price: 60000, discount: 5000, offer: "Free Mouse with Purchase", image: "https://m.media-amazon.com/images/I/61Qe0euJJZL._SX679_.jpg" },
    { id: 4, name: "Sony WH-1000XM5 Headphones", price: 25000, discount: 2000, offer: "Buy 1 Get 1 50% Off", image: "https://m.media-amazon.com/images/I/71o8Q5XJS5L._SL1500_.jpg" }, 
    { id: 5, name: "iPhone 15 Pro Max", price: 140000, discount: 10000, offer: "Limited Stock Offer!", image: "https://m.media-amazon.com/images/I/81Os1SDWpcL._SX679_.jpg" } ];

export default function Products() {
  return (
    <div className="products-page">
      <h2 className="products-heading">Products</h2>
      <div className="products-grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
