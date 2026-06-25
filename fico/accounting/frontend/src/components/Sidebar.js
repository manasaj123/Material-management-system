import React from 'react';
import { NavLink } from 'react-router-dom';
import './styles.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <NavLink to="/dashboard">📊 Dashboard</NavLink>
      <NavLink to="/invoices">🧾 Invoices</NavLink>
      <NavLink to="/payments">💳 Payments</NavLink>
      <NavLink to="/bank-reconciliation">🏦 Bank Reconciliation</NavLink>
      <NavLink to="/budget">📈 Budget</NavLink>
      <NavLink to="/cost-centers">💰 Cost Centers</NavLink>
      <NavLink to="/profit-centers">📉 Profit Centers</NavLink>
      <NavLink to="/expenses">🧮 Expenses</NavLink>
      <NavLink to="/audit-logs">🔍 Audit</NavLink>

      <NavLink to="/gl-accounts">📒 G/L Accounts</NavLink>
      {/* <NavLink to="/asset-classes">🏢 Asset Classes</NavLink> */}
      <NavLink to="/accounting-documents">📄 Acc-Documents</NavLink>
      <NavLink to="/journal">📔 Journal</NavLink>
      <NavLink to="/customer-credit-memo">🧾 Credit Memo</NavLink>
      <NavLink to="/clearing">⚖️ Clearing</NavLink>
      <NavLink to="/down-payments">💸 Down Payments</NavLink>
      <NavLink to="/parked-invoices">🅿️ Parked Invoices</NavLink>
      <NavLink to="/approval-workflow">✅ Approval Workflow</NavLink>
      <NavLink to="/grir-clearing">🔄 GR/IR Clearing</NavLink>
      <NavLink to="/period-closing">📅 Period Closing</NavLink>
      <NavLink to="/trial-balance">⚖️ Trial Balance</NavLink>
      <NavLink to="/financial-reports">📊 Financial Reports</NavLink>
    </aside>
  );
};

export default Sidebar;
