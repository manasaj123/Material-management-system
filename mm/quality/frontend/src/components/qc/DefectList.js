import React from "react";

export default function DefectList({ defects }) {
  if (!defects || defects.length === 0) {
    return <div style={{ fontSize: 13 }}>No defects.</div>;
  }

  return (
    <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
      <thead>
        <tr>
          <th>Type</th>
          <th>Qty</th>
          <th>Unit</th>
          <th>Severity</th>
          <th>Remarks</th>
        </tr>
      </thead>
      <tbody>
        {defects.map(d => (
          <tr key={d.id}>
            <td>{d.defect_type}</td>
            <td>{d.qty_rejected}</td>
            <td>{d.unit}</td>
            <td>{d.severity}</td>
            <td>{d.remarks}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
