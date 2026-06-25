import React, { useEffect, useState } from "react";
import Sidebar from "../components/qc/Sidebar";
import Header from "../components/qc/Header";
import axios from "axios";
import "./Pagestyles.css";

const BASE_URL = "http://localhost:5003/api";

export default function QCDashboardPage() {
  const [counts, setCounts] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0

  });

  useEffect(() => {
  axios
    .get(`${BASE_URL}/dashboard/counts`)
    .then(res => {
      const { total, approved, rejected } = res.data;

      setCounts({
        total,
        approved,
        rejected,
        pending: total - approved - rejected
      });
    })
    .catch(err => console.error("Dashboard count error", err));
}, []);


  return (
    <div className="qc-dashboard">
      <Sidebar />

      <div className="qc-dashboard-content">
        <Header title="Quality Control Dashboard" />

        <div className="qc-dashboard-body">
          <p className="qc-dashboard-desc">
            Inspection lots, approvals, rejections and QC audit reports
          </p>

          <div className="qc-dashboard-cards">
            <DashboardCard emoji="📦" title="Total Inspection Lots" value={counts.total} />
            <DashboardCard emoji="✅" title="Approved Lots" value={counts.approved} />
            <DashboardCard emoji="❌" title="Rejected Lots" value={counts.rejected} />
            <DashboardCard emoji="⏳" title="Pending Lots" value={counts.pending} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({emoji, title, value }) {
  return (
    <div className="dashboard-card">
      <h4>
        {title}</h4>
      <p>
        <span style={{ fontSize: "22px", marginRight: "8px" }}>
          {emoji}
        </span>{value}</p>
    </div>
  );
}
