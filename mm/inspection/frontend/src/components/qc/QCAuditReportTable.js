import axios from "axios";
import { useEffect, useState } from "react";
import "./componentstyles.css";

const BASE_URL = "http://localhost:5003/api";

export default function QCAuditReportTable() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/reports`);
      setReports(res.data || []);
      setError("");
    } catch (err) {
      console.error("Error loading reports", err);
      setError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleDecision = async (reportId, decision) => {
    try {
      await axios.put(`${BASE_URL}/reports/${reportId}`, { decision });
      loadReports();
    } catch (err) {
      console.error("Error updating decision", err);
      alert("Failed to update decision");
    }
  };

  if (loading) return <p>Loading reports...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <table className="qc-table">
      <thead>
        <tr>
          <th>Lot Number</th>
          <th>Findings</th>
          <th>Decision</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {reports.length === 0 ? (
          <tr>
            <td colSpan="4" className="no-data">
              No audit reports found
            </td>
          </tr>
        ) : (
          reports.map((r) => (
            <tr key={r.id}>
              <td>{r.lot_number || r.lot_id}</td>
              <td>{r.findings || r.remarks || "-"}</td>
              <td>{r.decision || "PENDING"}</td>
              <td>
                {r.decision !== "APPROVED" && (
                  <button
                    onClick={() => handleDecision(r.id, "APPROVED")}
                    className="approve-btn"
                  >
                    Approve
                  </button>
                )}
                {r.decision !== "REJECTED" && (
                  <button
                    onClick={() => handleDecision(r.id, "REJECTED")}
                    className="reject-btn"
                  >
                    Reject
                  </button>
                )}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
