import React from "react";
import NumberInput from "./NumberInput";

function BatchTable({ rows, setRows }) {
  const handleChange = (index, field, value) => {
    const copy = [...rows];
    copy[index] = { ...copy[index], [field]: value };
    setRows(copy);
  };

  const addRow = () => {
    setRows([
      ...rows,
      {
        product_id: 1,
        grade_pack_id: 1,
        batch_size: 500,
        line_id: 1,
        shift: 1
      }
    ]);
  };

  const removeRow = (index) => {
    const copy = rows.filter((_, i) => i !== index);
    setRows(copy);
  };

  return (
    <div>
      <button onClick={addRow}>Add Batch</button>
      <table className="pp-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Grade/Pack</th>
            <th>Batch Size</th>
            <th>Line</th>
            <th>Shift</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>
                <NumberInput
                  value={r.product_id}
                  onChange={(v) => handleChange(i, "product_id", v)}
                />
              </td>
              <td>
                <NumberInput
                  value={r.grade_pack_id}
                  onChange={(v) =>
                    handleChange(i, "grade_pack_id", v)
                  }
                />
              </td>
              <td>
                <NumberInput
                  value={r.batch_size}
                  onChange={(v) => handleChange(i, "batch_size", v)}
                />
              </td>
              <td>
                <NumberInput
                  value={r.line_id}
                  onChange={(v) => handleChange(i, "line_id", v)}
                />
              </td>
              <td>
                <NumberInput
                  value={r.shift}
                  onChange={(v) => handleChange(i, "shift", v)}
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

export default BatchTable;
