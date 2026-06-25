import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';

import Dashboard from './pages/Dashboard';
import Invoice from './pages/Invoice';
import Payment from './pages/Payment';
import BankReconciliation from './pages/BankReconciliation';
import Budget from './pages/Budget';
import CostCenter from './pages/CostCenter';
import ProfitCenter from './pages/ProfitCenter';
import Expense from './pages/Expense';
import AuditLogs from './pages/AuditLogs';
import GLAccounts from './pages/GLAccounts';
import AssetClasses from './pages/AssetClasses';
import AccDocument from './pages/AccDocument';
import Journal from './pages/Journal';
import CustomerCreditMemo from './pages/CustomerCreditMemo';
import Clearing from './pages/Clearing';
import DownPayments from './pages/DownPayments';
import ParkedInvoices from './pages/ParkedInvoices';
import ApprovalWorkflow from './pages/ApprovalWorkflow';
import GRIRClearing from './pages/GRIRClearing';
import PeriodClosing from './pages/PeriodClosing';
import TrialBalance from './pages/TrialBalance';
import FinancialReports from './pages/FinancialReports';

import './styles/App.css';

import './styles/Common.css';

const AppLayout = ({ children }) => (
  <div className="app-layout  app-background">
    <Navbar />
    <div className="app-body">
      <Sidebar />
      <main className="app-content">{children}</main>
    </div>
  </div>
);

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />
        <Route
          path="/dashboard"
          element={
            <AppLayout>
              <Dashboard />
            </AppLayout>
          }
        />
        <Route
          path="/invoices"
          element={
            <AppLayout>
              <Invoice />
            </AppLayout>
          }
        />
        <Route
          path="/payments"
          element={
            <AppLayout>
              <Payment />
            </AppLayout>
          }
        />
        <Route
          path="/bank-reconciliation"
          element={
            <AppLayout>
              <BankReconciliation />
            </AppLayout>
          }
        />
        <Route
          path="/budget"
          element={
            <AppLayout>
              <Budget />
            </AppLayout>
          }
        />
        <Route
          path="/cost-centers"
          element={
            <AppLayout>
              <CostCenter />
            </AppLayout>
          }
        />
        <Route
          path="/profit-centers"
          element={
            <AppLayout>
              <ProfitCenter />
            </AppLayout>
          }
        />
        <Route
          path="/expenses"
          element={
            <AppLayout>
              <Expense />
            </AppLayout>
          }
        />
<Route
  path="/audit-logs"
  element={
    <AppLayout>
      <AuditLogs />
    </AppLayout>
  }
/>




<Route
  path="/gl-accounts"
  element={
    <AppLayout>
      <GLAccounts />
    </AppLayout>
  }
/>
<Route
  path="/asset-classes"
  element={
    <AppLayout>
      <AssetClasses />
    </AppLayout>
  }
/>
<Route
  path="/accounting-documents"
  element={
    <AppLayout>
      <AccDocument />
    </AppLayout>
  }
/>
<Route
  path="/journal"
  element={
    <AppLayout>
      <Journal />
    </AppLayout>
  }
/>
<Route
  path="/customer-credit-memo"
  element={
    <AppLayout>
      <CustomerCreditMemo />
    </AppLayout>
  }
/>
<Route
  path="/clearing"
  element={
    <AppLayout>
      <Clearing />
    </AppLayout>
  }
/>
<Route
  path="/down-payments"
  element={
    <AppLayout>
      <DownPayments />
    </AppLayout>
  }
/>
<Route
  path="/parked-invoices"
  element={
    <AppLayout>
      <ParkedInvoices />
    </AppLayout>
  }
/>
<Route
  path="/approval-workflow"
  element={
    <AppLayout>
      <ApprovalWorkflow />
    </AppLayout>
  }
/>
<Route
  path="/grir-clearing"
  element={
    <AppLayout>
      <GRIRClearing />
    </AppLayout>
  }
/>
<Route
  path="/period-closing"
  element={
    <AppLayout>
      <PeriodClosing />
    </AppLayout>
  }
/>
<Route
  path="/trial-balance"
  element={
    <AppLayout>
      <TrialBalance />
    </AppLayout>
  }
/>
<Route
  path="/financial-reports"
  element={
    <AppLayout>
      <FinancialReports />
    </AppLayout>
  }
/>
<Route
  path="/forgot-password"
  element={
    <AppLayout>
      <ForgotPassword />
    </AppLayout>
  }
/>

      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;
