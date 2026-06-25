import React from 'react';


const Select = ({ options, value, onChange, label, ...props }) => (
  <div className="form-group">
    <label>{label}</label>
    <select value={value} onChange={onChange} {...props}>
      <option value="">Select...</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

export default Select;
