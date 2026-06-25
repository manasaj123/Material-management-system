import React from "react";
import NumberInput from "./NumberInput";

function CapacityTable({ rows, setRows }) {
  const handleChange = (index, field, value) => {
    const copy = [...rows];
    copy[index] = { ...copy[index], [field]: value };
    setRows(copy);
  };

  const addRow = () => {
    setRows([
      ...rows,
      { line_id: 1, shift: 1, available_hours: 8 }
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
            <th>Line</th>
            <th>Shift</th>
            <th>Available Hours</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
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
                <NumberInput
                  value={r.available_hours}
                  onChange={(v) =>
                    handleChange(i, "available_hours", v)
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

export default CapacityTable;
