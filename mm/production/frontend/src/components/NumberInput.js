// src/components/NumberInput.jsx
import React from "react";

function NumberInput({ value, onChange, style, min, max }) {
  const handleChange = (e) => {
    const val = e.target.value === "" ? "" : Number(e.target.value);
    onChange(val);
  };

  return (
    <input
      type="number"
      value={value}
      onChange={handleChange}
      min={min}
      max={max}
      style={style}          
    />
  );
}

export default NumberInput;
