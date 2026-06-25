import React from "react";
import "./componentstyles.css";

export default function Header({ title }) {
  return (
    <div className="header-container">
      <h2 className="header-title">{title}</h2>
    </div>
  );
}
