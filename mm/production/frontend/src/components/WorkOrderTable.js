import React from "react";
import NumberInput from "./NumberInput";

function WorkOrderTable({ rows, setRows, onUpdate }) {
  const handleChange = (index, field, value) => {
    const copy = [...rows];
    copy[index] = { ...copy[index], [field]: value };
    setRows(copy);
  };

  const handleUpdate = (row) => {
    onUpdate(row);
  };

  return (
    <table className="pp-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Batch</th>
          <th>Line</th>
          <th>Shift</th>
          <th>Planned Qty</th>
          <th>Actual Qty</th>
          <th>Wastage</th>
          <th>Status</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.id || i}>
            <td>{r.id}</td>
            <td>{r.batch_id}</td>
            <td>{r.line_id}</td>
            <td>{r.shift}</td>
            <td>{r.planned_qty}</td>
            <td>
              <NumberInput
                value={r.actual_qty}
                onChange={(v) => handleChange(i, "actual_qty", v)}
              />
            </td>
            <td>
              <NumberInput
                value={r.wastage_qty}
                onChange={(v) => handleChange(i, "wastage_qty", v)}
              />
            </td>
            <td>
              <input
                value={r.status}
                onChange={(e) =>
                  handleChange(i, "status", e.target.value)
                }
              />
            </td>
            <td>
              <button onClick={() => handleUpdate(r)}>Update</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default WorkOrderTable;
