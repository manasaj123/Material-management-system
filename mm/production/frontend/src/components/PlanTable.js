import React from "react";
import NumberInput from "./NumberInput";

function PlanTable({ rows, setRows }) {
  const handleChange = (index, field, value) => {
    const copy = [...rows];
    copy[index] = { ...copy[index], [field]: value };
    setRows(copy);
  };

  const addRow = () => {
    setRows([
      ...rows,
      {
        shift: 1,
        product_id: 1,
        grade_pack_id: 1,
        planned_qty: 0,
        status: "final"
      }
    ]);
  };

  const removeRow = (index) => {
    const copy = rows.filter((_, i) => i !== index);
    setRows(copy);
  };

  return (
    <div>
      <button onClick={addRow}>Add Row</button>
      <table className="pp-table">
        <thead>
          <tr>
            <th>Shift</th>
            <th>Product</th>
            <th>Grade/Pack</th>
            <th>Planned Qty</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>
                <NumberInput
                  value={r.shift}
                  onChange={(v) => handleChange(i, "shift", v)}
                />
              </td>
              <td>
                <NumberInput
                  value={r.product_id}
                  onChange={(v) => handleChange(i, "product_id", v)}
                />
              </td>
              <td>
                <NumberInput
                  value={r.grade_pack_id}
                  onChange={(v) => handleChange(i, "grade_pack_id", v)}
                />
              </td>
              <td>
                <NumberInput
                  value={r.planned_qty}
                  onChange={(v) => handleChange(i, "planned_qty", v)}
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
                <button onClick={() => removeRow(i)}>X</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PlanTable;
