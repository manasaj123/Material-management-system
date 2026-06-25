import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import "./Pagestyles.css";  

export default function Cart() {
  const { cart = [], clearCart } = useContext(CartContext);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [customerName, setCustomerName] = useState("");

  // net price per unit
  const netPrice = (item) => item.price - (item.discount || 0);

  // subtotal with quantity
  const subtotal = cart.reduce(
    (sum, item) => sum + netPrice(item) * item.quantity,
    0
  );

  // B2B discount
  const extraDiscount = subtotal >= 50000 ? Math.round(subtotal * 0.1) : 0;
  const grandTotal = subtotal - extraDiscount;

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    try {
      const res = await fetch("http://localhost:5008/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          subtotal,
          extraDiscount,
          grandTotal,
          customerName,
        }),
      });

      if (!res.ok) {
        console.error("Order save failed");
        return;
      }

      const data = await res.json(); // { orderId }

      setInvoice({
        orderId: data.orderId,
        date: new Date().toLocaleString(),
        items: cart,
        subtotal,
        extraDiscount,
        grandTotal,
        customerName,
      });

      setOrderPlaced(true);
      clearCart();
    } catch (err) {
      console.error("Error placing order:", err);
    }
  };

  // ================= ORDER CONFIRMATION =================
  if (orderPlaced && invoice) {
    return (
      <div className="cart-container">
        <h2 className="page-title">Order Confirmation</h2>
        
        <div className="invoice-header">
          <p><b>Order ID:</b> {invoice.orderId}</p>
          <p><b>Date:</b> {invoice.date}</p>
          {invoice.customerName && (
            <p><b>Customer:</b> {invoice.customerName}</p>
          )}
        </div>

        <h3 className="section-title">Invoice</h3>

        <table className="invoice-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Item</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id}>
                <td className="image-cell">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="invoice-image"
                  />
                </td>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>₹ {netPrice(item)}</td>
                <td>₹ {netPrice(item) * item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="totals-section">
          <p>Subtotal: ₹ {invoice.subtotal}</p>
          {invoice.extraDiscount > 0 && (
            <p className="discount-line">B2B Discount: -₹ {invoice.extraDiscount}</p>
          )}
          <h3 className="grand-total">Total Payable: ₹ {invoice.grandTotal}</h3>
        </div>
      </div>
    );
  }

  // ================= CART PAGE =================
  return (
    <div className="cart-container">
      <h2 className="page-title">Cart</h2>

      {cart.length === 0 && <p className="empty-cart">Your cart is empty.</p>}

      {/* Customer name input */}
      {cart.length > 0 && (
        <div className="customer-input-container">
          <input
            type="text"
            placeholder="Customer name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="customer-input"
          />
        </div>
      )}

      {cart.map((item) => (
        <div key={item.id} className="cart-item">
          <img
            src={item.image}
            alt={item.name}
            className="cart-item-image"
          />

          <div className="cart-item-details">
            <b className="item-name">{item.name}</b>
            <p className="item-price">₹ {netPrice(item)}</p>
          </div>

          <div className="quantity-badge">
            +{item.quantity}
          </div>
        </div>
      ))}

      {cart.length > 0 && (
        <>
          <hr className="divider" />
          <div className="totals-section">
            <p>Subtotal: ₹ {subtotal}</p>
            {extraDiscount > 0 && <p className="discount-line">B2B Discount: -₹ {extraDiscount}</p>}
            <h3 className="grand-total">Total: ₹ {grandTotal}</h3>
          </div>

          <button
            onClick={handlePlaceOrder}
            className="confirm-order-btn"
          >
            Confirm Order
          </button>
        </>
      )}
    </div>
  );
}
