import React, { useState } from "react";
import "./componentstyles.css";

export default function QCLotForm({ onSave }) {
  const [lotNumber, setLotNumber] = useState("");
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    await onSave({
      lot_number: lotNumber,
      product_name: productName,
      quantity: Number(quantity),
      unit, 
    });

    setLotNumber("");
    setProductName("");
    setQuantity("");
    setUnit("");
  };

  return (
    <form onSubmit={submit} className="qc-lot-form">
      <input
        placeholder="Lot Number"
        value={lotNumber}
        onChange={(e) => setLotNumber(e.target.value)}
        required
      />

      <input
        placeholder="Product Name"
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
        required
      />

      <input
        type="number"
        placeholder="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        required
      />

      <select
        value={unit}
        onChange={(e) => setUnit(e.target.value)}
        required
      >
        <option value="">Select Unit</option>
        <option value="KG">KG</option>
        <option value="LITERS">Liters</option>
        <option value="TON">Ton</option>
      </select>

      <button type="submit">Create Lot</button>
    </form>
  );
}
