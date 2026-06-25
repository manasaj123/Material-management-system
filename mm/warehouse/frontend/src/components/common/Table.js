
import React from 'react';


const Table = ({ columns, data }) => {
  return (
    <table className="table">
      <thead>
        <tr>
          {columns.map(col => (
            <th key={col.key}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 && (
          <tr>
            <td colSpan={columns.length}>No data</td>
          </tr>
        )}

        {data.map((row, idx) => (
          <tr key={row.id ?? idx}>
            {columns.map(col => (
              <td key={col.key}>
                {typeof col.render === 'function'
                  ? col.render(row)
                  : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
