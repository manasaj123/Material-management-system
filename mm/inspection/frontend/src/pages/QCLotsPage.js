import React, { useEffect, useState } from "react";
import axios from "axios";
import QCLotList from "../components/qc/QCLotList";
import QCLotForm from "../components/qc/QCLotForm";
import Sidebar from "../components/qc/Sidebar";
import Header from "../components/qc/Header";
import "./Pagestyles.css";

const BASE_URL = "http://localhost:5003/api";

export default function QCLotsPage() {
  const [lots, setLots] = useState([]);

  const loadLots = async () => {
    const res = await axios.get(`${BASE_URL}/lots`);
    setLots(res.data || []);
  };

  useEffect(() => {
    loadLots();
  }, []);

  const handleCreateLot = async data => {
    await axios.post(`${BASE_URL}/lots`, data);
    await loadLots();
  };

  const handleStatusChange = async (id, status) => {
    await axios.put(`${BASE_URL}/lots/${id}/status`, {
      status,
      findings:
        status === "REJECTED"
          ? "Quality not acceptable"
          : "Quality acceptable"
    });
    await loadLots();
  };

  return (
    <div className="qc-lots-page">
      <Sidebar />

      <div className="qc-lots-content">
        <Header title="Inspection Lots" />

        <div className="qc-lots-body">
          
          <div className="create-lot-card">
            <h3>Create Inspection Lot</h3>
            <QCLotForm onSave={handleCreateLot} />
          </div>

          
          <QCLotList lots={lots} onStatusChange={handleStatusChange} />
        </div>
      </div>
    </div>
  );
}
