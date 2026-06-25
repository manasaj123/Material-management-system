import React from "react";
import { NavLink } from "react-router-dom";

const sidebarStyle = {
  display: "flex",
  flexDirection: "column",
  padding: "16px",
  boxSizing: "border-box",
   height: "100%", 
   overflowY: "auto"
};



const logoStyle = {
  fontSize: "18px",
  fontWeight: "bold",
  marginBottom: "24px"
};

const navItemStyle = {
  padding: "8px 12px",
  borderRadius: "4px",
  marginBottom: "4px",
  color: "#e5e7eb",
  textDecoration: "none",
  fontSize: "14px"
};

const activeNavItemStyle = {
  ...navItemStyle,
  backgroundColor: "#374151",
  color: "#ffffff",
  
};

const groupTitleStyle = {
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#9ca3af",
  marginTop: "12px",
  marginBottom: "4px"
};

export default function Sidebar() {
  return (
    <div style={sidebarStyle}>
      <div style={logoStyle}>MM System</div>

      <div style={groupTitleStyle}>Masters</div>
      <NavLink
        to="/vendors"
        style={({ isActive }) => (isActive ? activeNavItemStyle : navItemStyle)}
      >
        Vendors / Farmers
      </NavLink>
      <NavLink
        to="/materials"
        style={({ isActive }) => (isActive ? activeNavItemStyle : navItemStyle)}
      >
        Materials
      </NavLink>

      <div style={groupTitleStyle}>Procurement</div>
      <NavLink
        to="/pr"
        style={({ isActive }) => (isActive ? activeNavItemStyle : navItemStyle)}
      >
        Purchase Requisitions
      </NavLink>
      <NavLink
        to="/rfq"
        style={({ isActive }) => (isActive ? activeNavItemStyle : navItemStyle)}
      >
        Request for Quotation
      </NavLink>
      <NavLink
        to="/po"
        style={({ isActive }) => (isActive ? activeNavItemStyle : navItemStyle)}
      >
        Purchase Orders
      </NavLink>
      <NavLink
        to="/grn"
        style={({ isActive }) => (isActive ? activeNavItemStyle : navItemStyle)}
      >
        Goods Receipt
      </NavLink>
        <NavLink
        to="/gi"
        style={({ isActive }) => (isActive ? activeNavItemStyle : navItemStyle)}
      >
        Goods issue
      </NavLink>

      <div style={groupTitleStyle}>Inventory</div>
      <NavLink
        to="/stock"
        style={({ isActive }) => (isActive ? activeNavItemStyle : navItemStyle)}
      >
        Stock Summary
      </NavLink>

      <div style={groupTitleStyle}>Finance</div>
      <NavLink
        to="/invoices"
        style={({ isActive }) => (isActive ? activeNavItemStyle : navItemStyle)}
      >
        Invoice Verification
      </NavLink>

      <div style={groupTitleStyle}>Planning</div>
      <NavLink
        to="/planning"
        style={({ isActive }) => (isActive ? activeNavItemStyle : navItemStyle)}
      >
        Planning Board
      </NavLink>
      <div style={groupTitleStyle}>StockTransfer</div>
      <NavLink
        to="/stock-transfer"
        style={({ isActive }) => (isActive ? activeNavItemStyle : navItemStyle)}
      >
        Stock Transfer
      </NavLink>
    </div>
  );
}
