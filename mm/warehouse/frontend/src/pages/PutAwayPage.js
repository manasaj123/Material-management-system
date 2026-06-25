import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import Table from '../components/common/Table';
import '../pages/style.css';

const PutAwayPage = () => {
  const [pendingGrns, setPendingGrns] = useState([]);

  useEffect(() => {
    loadPendingGrns();
  }, []);

  const loadPendingGrns = async () => {
    const response = await axiosClient.get('/grn/pending');
    setPendingGrns(response.data);
  };

  const handlePutAway = async (grnId) => {
    await axiosClient.put(`/grn/${grnId}/putaway`);
    loadPendingGrns();
  };

  const columns = [
    { key: 'grn_no', label: 'GRN No' },
    { key: 'total_items', label: 'Items' },
    { key: 'received_date', label: 'Date' },
    { key: 'action', label: 'Action' }
  ];

  return (
    <div>
      <div className="page-header">
        <h1>📥 Put Away</h1>
      </div>
      
      <div className="card">
        <h3>Pending Put Away ({pendingGrns.length})</h3>
        <Table columns={columns} data={
          pendingGrns.map(grn => ({
            ...grn,
            action: <button className="btn btn-success" onClick={() => handlePutAway(grn.id)}>Put Away</button>
          }))
        } />
      </div>
    </div>
  );
};

export default PutAwayPage;
