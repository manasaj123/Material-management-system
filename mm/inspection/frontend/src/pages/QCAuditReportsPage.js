import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/qc/Sidebar";
import Header from "../components/qc/Header";
import "./Pagestyles.css";

const BASE_URL = "http://localhost:5003/api";

export default function QCAuditReportsPage() {
  const [reports, setReports] = useState([]);

  const loadReports = async () => {
    const res = await axios.get(`${BASE_URL}/reports`);
    setReports(res.data || []);
  };

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <div className="qc-audit-page">
      <Sidebar />

      <div className="qc-audit-content">
        <Header title="QC Audit Reports" />

        <div className="qc-audit-body">
          <table className="qc-audit-table">
            <thead>
              <tr>
                <th>Lot Number</th>
                <th>Findings</th>
                <th>Decision</th>
              </tr>
            </thead>

            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan="3" className="qc-audit-empty">
                    No reports found
                  </td>
                </tr>
              ) : (
                reports.map(r => (
                  <tr key={r.id}>
                    <td>{r.lot_id}</td>
                    <td>{r.findings}</td>
                    <td className={`qc-decision-${r.decision}`}>
                      {r.decision}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
