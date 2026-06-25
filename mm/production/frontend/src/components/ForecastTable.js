import React from "react";
import NumberInput from "./NumberInput";

const containerStyle = {
  marginTop: "8px"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "13px"
};

const thStyle = {
  border: "1px solid #ddd",
  padding: "4px 6px",
  background: "#f3f4f6",
  textAlign: "center"
};

const tdStyle = {
  border: "1px solid #ddd",
  padding: "4px 6px",
  textAlign: "center"      // center content in cells
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  textAlign: "center"      // center text in inputs
};

function ForecastTable({ rows, setRows }) {
  const handleChange = (index, field, value) => {
    const copy = [...rows];
    copy[index] = { ...copy[index], [field]: value };
    setRows(copy);
  };

  return (
    <div style={containerStyle}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Product</th>
            <th style={thStyle}>Grade/Pack</th>
            <th style={thStyle}>Forecast Qty</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td style={tdStyle}>
                <NumberInput
                  value={r.product_id}
                  onChange={(v) => handleChange(i, "product_id", v)}
                  style={inputStyle}
                />
              </td>
              <td style={tdStyle}>
                <NumberInput
                  value={r.grade_pack_id}
                  onChange={(v) => handleChange(i, "grade_pack_id", v)}
                  style={inputStyle}
                />
              </td>
              <td style={tdStyle}>
                <NumberInput
                  value={r.forecast_qty}
                  onChange={(v) => handleChange(i, "forecast_qty", v)}
                  style={inputStyle}
                />
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td style={tdStyle} colSpan={3}>
                No forecast lines for this period
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ForecastTable;
