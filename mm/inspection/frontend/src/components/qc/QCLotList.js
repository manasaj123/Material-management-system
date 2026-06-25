import React from "react";
import "./componentstyles.css";

export default function QCLotList({ lots, onStatusChange }) {
  if (!lots || lots.length === 0) {
    return <div className="qc-no-data">No inspection lots found.</div>;
  }

  return (
    <div className="qc-lot-list">
      <h3 className="qc-lot-title">Inspection Lots</h3>

      <table className="qc-lot-table">
        <thead>
          <tr>
            <th>Lot Number</th>
            <th>Product Name</th>
            <th>Quantity</th>
            <th>Unit</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {lots.map(lot => (
            <tr key={lot.id}>
              <td>{lot.lot_number}</td>
              <td>{lot.product_name}</td>
              <td>{lot.quantity}</td>
              <td>{lot.unit}</td>
              <td>{lot.status}</td>

              <td>
  {lot.status?.toUpperCase() === "PENDING" ? (
    <>
      <button
        className="qc-btn qc-btn-approve"
        onClick={() => onStatusChange(lot.id, "APPROVED")}
      >
        Approve
      </button>

      <button
        className="qc-btn qc-btn-reject"
        onClick={() => onStatusChange(lot.id, "REJECTED")}
      >
        Reject
      </button>
    </>
  ) : (
    "-"
  )}
</td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
