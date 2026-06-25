import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "../pages/DashboardPage";
import VendorPage from "../pages/VendorPage";
import MaterialPage from "../pages/MaterialPage";
import PRPage from "../pages/PRPage";
import POPage from "../pages/POPage";
import GRNPage from "../pages/GRNPage";
import StockPage from "../pages/StockPage";
import InvoicePage from "../pages/InvoicePage";
import PlanningPage from "../pages/PlanningPage";
import StockTransferPage  from "../pages/StockTransferPage";
import RequestForQuotationPage from "../pages/RequestForQuotationPage";

import GoodsissuePage from "../pages/GoodsissuePage";


export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/vendors" element={<VendorPage />} />
      <Route path="/materials" element={<MaterialPage />} />
      <Route path="/pr" element={<PRPage />} />
      <Route path="/po" element={<POPage />} />
      <Route path="/grn" element={<GRNPage />} />
      <Route path="/stock" element={<StockPage />} />
      <Route path="/invoices" element={<InvoicePage />} />
      <Route path="/planning" element={<PlanningPage />} />
      <Route path="/stock-transfer" element={<StockTransferPage />} />
      <Route path="/rfq" element={<RequestForQuotationPage />} />
      <Route path="/gi" element={<GoodsissuePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
