// inspection/frontend/src/pages/InspectionLotPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/qc/Sidebar";
import Header from "../components/qc/Header";
import "./Pagestyles.css";

const BASE_URL = "http://localhost:5003/api";

export default function InspectionLotPage() {
  const [items, setItems] = useState([]);
  const [binItems, setBinItems] = useState([]);
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    selectionProfile: "",
    lotCreatedFrom: "",
    lotCreatedTo: "",
    inspStartFrom: "",
    inspStartTo: "",
    inspectionEndFrom: "",
    inspectionEndTo: "",
    plant: "",
    lotOrigin: "",
    material: "",
    batch: "",
    vendor: "",
    manufacturer: "",
    customer: "",
    materialClass: "",
    maxHits: ""
  });

  const loadData = async () => {
    const [activeRes, binRes] = await Promise.all([
      axios.get(`${BASE_URL}/inspection-lots`),
      axios.get(`${BASE_URL}/inspection-lots/recycle-bin`)
    ]);
    setItems(activeRes.data || []);
    setBinItems(binRes.data || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  // helper for date parsing (this was missing)
  const parse = v => (v ? new Date(v) : null);

  const handleChange = e => {
    const { name, value } = e.target;
    console.log("CHANGE:", name, value);

    let newValue = value;

    if (
      [
        "selectionProfile",
        "plant",
        "lotOrigin",
        "material",
        "batch",
        "vendor",
        "manufacturer",
        "customer",
        "materialClass"
      ].includes(name)
    ) {
      newValue = value.toUpperCase().replace(/[^A-Z0-9_-]/g, "");
    }

    if (name === "maxHits") {
      newValue = value.replace(/[^0-9]/g, "");
    }

    console.log("NEW VALUE:", name, newValue);
    setForm(prev => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const lcFrom = parse(form.lotCreatedFrom);
    const lcTo = parse(form.lotCreatedTo);
    const isFrom = parse(form.inspStartFrom);
    const isTo = parse(form.inspStartTo);
    const ieFrom = parse(form.inspectionEndFrom);
    const ieTo = parse(form.inspectionEndTo);

    if (lcFrom && lcTo && lcFrom > lcTo) {
      alert("Lot created (From) cannot be after (To)");
      return;
    }
    if (isFrom && isTo && isFrom > isTo) {
      alert("Insp. start date (From) cannot be after (To)");
      return;
    }
    if (ieFrom && ieTo && ieFrom > ieTo) {
      alert("End of Inspection (From) cannot be after (To)");
      return;
    }

    const payload = {
      ...form,
      maxHits: form.maxHits || null
    };

    if (editingId) {
      await axios.put(
        `${BASE_URL}/inspection-lots/${editingId}`,
        payload
      );
    } else {
      await axios.post(`${BASE_URL}/inspection-lots`, payload);
    }

    setForm({
      selectionProfile: "",
      lotCreatedFrom: "",
      lotCreatedTo: "",
      inspStartFrom: "",
      inspStartTo: "",
      inspectionEndFrom: "",
      inspectionEndTo: "",
      plant: "",
      lotOrigin: "",
      material: "",
      batch: "",
      vendor: "",
      manufacturer: "",
      customer: "",
      materialClass: "",
      maxHits: ""
    });
    setEditingId(null);
    await loadData();
  };

  const handleEdit = item => {
    setEditingId(item.id);
    setForm({
      selectionProfile: item.selectionProfile || "",
      lotCreatedFrom: item.lotCreatedFrom || "",
      lotCreatedTo: item.lotCreatedTo || "",
      inspStartFrom: item.inspStartFrom || "",
      inspStartTo: item.inspStartTo || "",
      inspectionEndFrom: item.inspectionEndFrom || "",
      inspectionEndTo: item.inspectionEndTo || "",
      plant: item.plant || "",
      lotOrigin: item.lotOrigin || "",
      material: item.material || "",
      batch: item.batch || "",
      vendor: item.vendor || "",
      manufacturer: item.manufacturer || "",
      customer: item.customer || "",
      materialClass: item.materialClass || "",
      maxHits: item.maxHits != null ? String(item.maxHits) : ""
    });
  };

  const handleSoftDelete = async id => {
    await axios.delete(`${BASE_URL}/inspection-lots/${id}`);
    await loadData();
  };

  const handleRestore = async id => {
    await axios.post(`${BASE_URL}/inspection-lots/${id}/restore`);
    await loadData();
  };

  const handleHardDelete = async id => {
    await axios.delete(`${BASE_URL}/inspection-lots/${id}/hard-delete`);
    await loadData();
  };

  const list = showRecycleBin ? binItems : items;

  return (
    <div className="qc-master-page">
      <Sidebar />
      <div className="qc-master-content">
        <Header title="Create Listing Inspection Lot" />

        <div className="qc-master-body">
          {/* Form */}
          <div className="qc-master-form-card">
            <h3>
              {editingId ? "Edit Inspection Lot" : "Create Inspection Lot"}
            </h3>

            <form onSubmit={handleSubmit} className="qc-form">
              <div className="form-row">
                <label>Selection Profile</label>
                <input
                  name="selectionProfile"
                  value={form.selectionProfile}
                  onChange={handleChange}
                  placeholder="Profile"
                />
              </div>

              <div className="form-row">
                <label>Lot created on (From)</label>
                <input
                  type="date"
                  name="lotCreatedFrom"
                  value={form.lotCreatedFrom}
                  onChange={handleChange}
                />
              </div>
              <div className="form-row">
                <label>Lot created on (To)</label>
                <input
                  type="date"
                  name="lotCreatedTo"
                  value={form.lotCreatedTo}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <label>Insp. start date (From)</label>
                <input
                  type="date"
                  name="inspStartFrom"
                  value={form.inspStartFrom}
                  onChange={handleChange}
                />
              </div>
              <div className="form-row">
                <label>Insp. start date (To)</label>
                <input
                  type="date"
                  name="inspStartTo"
                  value={form.inspStartTo}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <label>End of Inspection (From)</label>
                <input
                  type="date"
                  name="inspectionEndFrom"
                  value={form.inspectionEndFrom}
                  onChange={handleChange}
                />
              </div>
              <div className="form-row">
                <label>End of Inspection (To)</label>
                <input
                  type="date"
                  name="inspectionEndTo"
                  value={form.inspectionEndTo}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <label>Plant</label>
                <input
                  name="plant"
                  value={form.plant}
                  onChange={handleChange}
                  placeholder="Plant"
                />
              </div>

              <div className="form-row">
                <label>Insp. lot origin</label>
                <input
                  name="lotOrigin"
                  value={form.lotOrigin}
                  onChange={handleChange}
                  placeholder="Origin"
                />
              </div>

              <div className="form-row">
                <label>Material</label>
                <input
                  name="material"
                  value={form.material}
                  onChange={handleChange}
                  placeholder="Material"
                />
              </div>

              <div className="form-row">
                <label>Batch</label>
                <input
                  name="batch"
                  value={form.batch}
                  onChange={handleChange}
                  placeholder="Batch"
                />
              </div>

              <div className="form-row">
                <label>Vendor</label>
                <input
                  name="vendor"
                  value={form.vendor}
                  onChange={handleChange}
                  placeholder="Vendor"
                />
              </div>

              <div className="form-row">
                <label>Manufacturer</label>
                <input
                  name="manufacturer"
                  value={form.manufacturer}
                  onChange={handleChange}
                  placeholder="Manufacturer"
                />
              </div>

              <div className="form-row">
                <label>Customer</label>
                <input
                  name="customer"
                  value={form.customer}
                  onChange={handleChange}
                  placeholder="Customer"
                />
              </div>

              <div className="form-row">
                <label>Material class</label>
                <input
                  name="materialClass"
                  value={form.materialClass}
                  onChange={handleChange}
                  placeholder="Material class"
                />
              </div>

              <div className="form-row">
                <label>Maximum No. of Hits</label>
                <input
                  name="maxHits"
                  value={form.maxHits}
                  onChange={handleChange}
                  placeholder="Max hits"
                />
              </div>

              <div className="form-row-full">
                <button type="submit">
                  {editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>

          {/* List */}
          <div className="qc-master-list">
            <div className="qc-master-list-header">
              <h3>
                {showRecycleBin
                  ? "Inspection Lot - Recycle Bin"
                  : "Inspection Lot List"}
              </h3>

              <button
                onClick={() => setShowRecycleBin(v => !v)}
              >
                {showRecycleBin ? "Show Active" : "Show Recycle Bin"}
              </button>
            </div>

            <table className="qc-table">
              <thead>
                <tr>
                  <th className="col-id">ID</th>
                  <th>Selection Profile</th>
                  <th>Plant</th>
                  <th>Material</th>
                  <th>Vendor</th>
                  <th>Customer</th>
                  <th>Max Hits</th>
                  {showRecycleBin && <th>Deleted At</th>}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map(item => (
                  <tr key={item.id}>
                    <td className="col-id">{item.id}</td>
                    <td>{item.selectionProfile}</td>
                    <td>{item.plant}</td>
                    <td>{item.material}</td>
                    <td>{item.vendor}</td>
                    <td>{item.customer}</td>
                    <td>{item.maxHits}</td>
                    {showRecycleBin && (
                      <td>{item.deletedAt || "-"}</td>
                    )}
                    <td>
                      {!showRecycleBin && (
                        <div className="btn">
                          <button
                            className="action-edit"
                            onClick={() => handleEdit(item)}
                          >
                            Edit
                          </button>
                          <button
                            className="action-delete"
                            onClick={() =>
                              handleSoftDelete(item.id)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      )}
                      {showRecycleBin && (
                        <div className="btn">
                          <button
                            className="action-restore"
                            onClick={() =>
                              handleRestore(item.id)
                            }
                          >
                            Restore
                          </button>
                          <button
                            className="action-hard-delete"
                            onClick={() =>
                              handleHardDelete(item.id)
                            }
                          >
                            Delete Permanently
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr>
                    <td
                      colSpan={showRecycleBin ? 9 : 8}
                      style={{ textAlign: "center" }}
                    >
                      No records
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}