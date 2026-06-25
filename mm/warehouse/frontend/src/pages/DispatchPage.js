import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import Table from '../components/common/Table';
import '../pages/style.css';

const DispatchPage = () => {
  const [readyDispatches, setReadyDispatches] = useState([]);

  useEffect(() => {
    loadReadyDispatches();
  }, []);

  const loadReadyDispatches = async () => {
    const response = await axiosClient.get('/dispatch/ready');
    setReadyDispatches(response.data);
  };

  const handleDispatch = async (dispatchId) => {
    await axiosClient.put(`/dispatch/${dispatchId}/ship`);
    loadReadyDispatches();
  };

  const columns = [
    { key: 'dispatch_no', label: 'Dispatch No' },
    { key: 'pick_no', label: 'Pick No' },
    { key: 'status', label: 'Status' },
    { key: 'action', label: 'Action' }
  ];

  return (
    <div>
      <div className="page-header">
        <h1>🚚 Dispatch</h1>
      </div>
      
      <div className="card">
        <h3>Ready for Dispatch ({readyDispatches.length})</h3>
        <Table columns={columns} data={
          readyDispatches.map(dispatch => ({
            ...dispatch,
            action: <button className="btn btn-primary" onClick={() => handleDispatch(dispatch.id)}>Dispatch</button>
          }))
        } />
      </div>
    </div>
  );
};

export default DispatchPage;
